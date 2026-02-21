# Phân tích Serve — Middleware & Phân quyền

> **Ngày phân tích:** 2026-02-21  
> **Phạm vi:** `serve/` — gateway, core, esports

---

## 1. Kiến trúc tổng quan

| Service | Transport | Vai trò |
|---------|-----------|---------|
| **gateway** (port 3333) | HTTP | Nhận request từ client, forward qua NATS |
| **core** | NATS only | Auth (đăng ký/đăng nhập/JWT) + User management |
| **esports** | NATS only | Tournament & Match CRUD |

---

## 2. Middleware hiện tại

### Đang có

| Middleware/Pipe | Vị trí | Mô tả |
|----------------|--------|--------|
| `ValidationPipe` (global) | `apps/gateway/src/main.ts:16` | `whitelist: true, transform: true` — loại bỏ field thừa, auto-transform type |
| CORS | `apps/gateway/src/main.ts:8-15` | Cho phép `localhost:5173` (dashboard) và `localhost:3000` (client) |

### THIẾU (Critical)

| Middleware | Rủi ro | Mức độ |
|-----------|--------|--------|
| **Rate Limiting** | Brute-force login, DDoS endpoint `/auth/login`, `/auth/register` | **Critical** |
| **Helmet** | Thiếu security headers (XSS, clickjacking, MIME sniffing) | **High** |
| **CSRF Protection** | Cross-site request forgery (nếu dùng cookie-based auth) | Medium |
| **Request Logging / Morgan** | Không có audit trail, khó debug production | **High** |
| **Exception Filter (global)** | Lỗi microservice (NATS timeout) trả raw error cho client | **High** |
| **Interceptor (Response transform)** | Response format không nhất quán giữa các endpoint | Medium |
| **Compression** | Response lớn không được nén | Low |

---

## 3. Phân quyền (Authorization) — Phân tích chi tiết

### 3.1. Mô hình Role hiện tại

Prisma schema có hệ thống role khá phong phú:

```
UserRole: ADMIN | STAFF | ORGANIZER | CREATOR | PARTNER | PLAYER | USER
accountType: 0 (admin) | 1 (user)
```

Mỗi User có **array of roles** (`UserRole[]`) — cho phép đa vai trò.

### 3.2. Authentication (Xác thực)

| Cơ chế | Chi tiết | Đánh giá |
|--------|---------|----------|
| JWT Strategy | `apps/gateway/src/strategies/jwt.strategy.ts` — extract từ Bearer token | OK |
| JWT payload | `{ sub: userId, email }` | **Thiếu `roles`** |
| Access Token | 15 phút | OK |
| Refresh Token | 7 ngày, secret riêng (`JWT_REFRESH_SECRET`) | OK |
| Password hashing | bcrypt, 10 rounds | OK |
| Admin Login | Check `accountType === 0` | OK nhưng chỉ kiểm tra lúc login |

### 3.3. Authorization (Phân quyền) — RẤT THIẾU

**Vấn đề nghiêm trọng nhất:**

| # | Vấn đề | Nơi ảnh hưởng | Mức độ |
|---|--------|--------------|--------|
| 1 | **Không có RolesGuard** | Toàn bộ hệ thống | **Critical** |
| 2 | **JWT payload thiếu `roles`** | `apps/core/src/auth/auth.service.ts` → `generateTokens()` chỉ truyền `sub` + `email` | **Critical** |
| 3 | **`PATCH :id/role`** — ai cũng đổi được role | `apps/gateway/src/users/users.controller.ts:62-70` — chỉ cần JWT hợp lệ là đổi role bất kỳ user nào | **Critical** |
| 4 | **`POST /tournaments`** — không check quyền | `apps/gateway/src/app.controller.ts:20-23` — ai cũng tạo tournament được, không cần auth | **Critical** |
| 5 | **`GET /tournaments`** — không phân biệt public/private | Không vấn đề nếu cố ý public | Low |
| 6 | **`GET /users`** — chỉ cần JWT là xem tất cả user | `apps/gateway/src/users/users.controller.ts:73-84` — user thường không nên list toàn bộ | **High** |
| 7 | **NATS message không xác thực** | Tất cả `@MessagePattern` ở core/esports không verify ai gửi | **Medium** |
| 8 | **Không có ownership check** | User A có thể update profile User B nếu biết endpoint | Medium |

---

## 4. Phân tích từng endpoint

| Endpoint | Method | Auth Guard? | Role Guard? | Vấn đề |
|----------|--------|:-----------:|:-----------:|--------|
| `/health` | GET | ❌ | ❌ | OK (public) |
| `/auth/register` | POST | ❌ | ❌ | OK nhưng **thiếu rate limit** |
| `/auth/login` | POST | ❌ | ❌ | OK nhưng **thiếu rate limit** |
| `/auth/admin/login` | POST | ❌ | ❌ | Check `accountType` ở service layer, OK |
| `/auth/refresh` | POST | ❌ | ❌ | OK |
| `/users/me` | GET | ✅ JWT | ❌ | OK |
| `/users/me` | PATCH | ✅ JWT | ❌ | OK |
| `/users/me/password` | PATCH | ✅ JWT | ❌ | OK |
| `/users/:id/role` | PATCH | ✅ JWT | ❌ **NONE** | **BẤT KỲ user login nào cũng đổi role được** |
| `/users` | GET | ✅ JWT | ❌ **NONE** | **User thường thấy toàn bộ danh sách** |
| `/tournaments` | GET | ❌ **NONE** | ❌ | Public, có thể OK |
| `/tournaments` | POST | ❌ **NONE** | ❌ **NONE** | **Ai cũng tạo tournament, thậm chí không cần login** |

---

## 5. Đề xuất khắc phục

### A. Bổ sung JWT payload chứa roles

```typescript
// apps/core/src/auth/auth.service.ts → generateTokens()
private async generateTokens(userId: string, email: string, roles: UserRole[]) {
  const payload = { sub: userId, email, roles };
  
  const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
  const refreshToken = this.jwtService.sign(payload, {
    secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
}
```

### B. Cập nhật JWT Strategy để extract roles

```typescript
// apps/gateway/src/strategies/jwt.strategy.ts
validate(payload: { sub: string; email: string; roles: string[] }) {
  return { userId: payload.sub, email: payload.email, roles: payload.roles };
}
```

### C. Tạo RolesGuard + @Roles() decorator

```typescript
// guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}

// decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@app/common';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
```

### D. Áp dụng vào endpoint

```typescript
// users.controller.ts
@Patch(':id/role')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)                         // Chỉ ADMIN
async updateRole(...) {}

@Get()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)          // ADMIN hoặc STAFF
async findAll(...) {}

// app.controller.ts (tournaments)
@Post('tournaments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.ORGANIZER)      // ADMIN hoặc ORGANIZER
async createTournament(...) {}
```

### E. Thêm middleware bảo mật

```bash
pnpm add @nestjs/throttler helmet
```

```typescript
// app.module.ts — thêm ThrottlerModule
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    // ...existing imports
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})

// main.ts — thêm helmet
import helmet from 'helmet';
app.use(helmet());
```

### F. Thêm Global Exception Filter

```typescript
// filters/rpc-exception.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    
    const status = exception?.status || exception?.statusCode || 500;
    const message = exception?.message || 'Internal server error';
    
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### G. Thêm Logging Middleware

```typescript
// middleware/logger.middleware.ts
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      this.logger.log(`${method} ${originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    
    next();
  }
}
```

---

## 6. Tóm tắt đánh giá

| Tiêu chí | Điểm | Đánh giá |
|----------|:-----:|----------|
| **Authentication** | 7/10 | JWT cơ bản đầy đủ, thiếu roles trong token |
| **Authorization (RBAC)** | 2/10 | Có schema UserRole nhưng **chưa enforce ở bất kỳ đâu** |
| **Middleware bảo mật** | 3/10 | Chỉ có ValidationPipe + CORS, thiếu rate limit/helmet/logging |
| **Input Validation** | 7/10 | DTO + ValidationPipe hoạt động tốt |
| **Audit/Logging** | 1/10 | Không có logging middleware |

---

## 7. Thứ tự ưu tiên fix

1. **[P0]** Thêm `roles` vào JWT payload + tạo `RolesGuard` + `@Roles()` decorator
2. **[P0]** Bảo vệ `PATCH :id/role` — chỉ ADMIN
3. **[P0]** Bảo vệ `POST /tournaments` — cần auth + role ADMIN/ORGANIZER
4. **[P0]** Bảo vệ `GET /users` — chỉ ADMIN/STAFF
5. **[P1]** Thêm `@nestjs/throttler` rate limiting (đặc biệt cho auth endpoints)
6. **[P1]** Thêm `helmet` security headers
7. **[P1]** Thêm Global Exception Filter
8. **[P2]** Thêm Logging Middleware
9. **[P2]** Thêm Response Interceptor (format nhất quán)
10. **[P3]** Thêm Compression middleware

---

**Kết luận:** Hệ thống đã xây dựng schema phân quyền tốt (7 roles, account type) nhưng **chưa implement bất kỳ authorization guard nào**. Bất kỳ user login nào cũng có thể thực hiện mọi hành động (đổi role, tạo tournament, xem tất cả user). Đây là **lỗ hổng nghiêm trọng nhất** cần fix trước khi deploy.
