# Phase 6: Cap nhat Gateway - Tach Controllers va Them Guards

## Context Links

- [plan.md](./plan.md)
- [research/researcher-01-report.md](./research/researcher-01-report.md) (JWT strategy, guards)
- [research/researcher-02-report.md](./research/researcher-02-report.md) (RBAC patterns)
- Phu thuoc: Phase 5 (Core AppModule hoan thanh)

## Tong quan

Tach `AppController` trong gateway thanh `AuthController` (public) va `UsersController` (protected). Them JwtAuthGuard + JwtStrategy o gateway level de bao ve route user. Gateway validate JWT truoc khi forward request sang Core service qua NATS.

## Key Insights

- Gateway la HTTP server duy nhat - JWT validation o day, khong o microservice
- AuthController routes (register, login, refresh) la public - khong can guard
- UsersController routes (profile, update, change-password) can JwtAuthGuard
- Gateway decode JWT va gui userId trong NATS message payload
- Tournaments routes giu nguyen trong AppController hoac tach rieng (ngoai scope)
- Can them `@nestjs/jwt` va `passport` imports trong gateway module

## Requirements

1. Tao `AuthController` - POST auth/register, POST auth/login, POST auth/refresh
2. Tao `UsersController` - GET users/me, PATCH users/me, PATCH users/me/password, PATCH users/:id/role
3. Tao `JwtStrategy` - Passport strategy cho gateway
4. Tao `JwtAuthGuard` - Guard dung JwtStrategy
5. Cap nhat `AppModule` - import JwtModule, PassportModule, register controllers moi
6. Giu tournament routes trong AppController (khong thay doi)

## Architecture

```
apps/gateway/src/
  |-- main.ts                    (giu nguyen)
  |-- app.module.ts              (cap nhat imports)
  |-- app.controller.ts          (chi giu health + tournaments)
  |-- auth/
  |   |-- auth.controller.ts     (MOI - public routes)
  |-- users/
  |   |-- users.controller.ts    (MOI - protected routes)
  |-- guards/
  |   |-- jwt-auth.guard.ts      (MOI)
  |-- strategies/
  |   |-- jwt.strategy.ts        (MOI)
```

**Request flow:**
```
Client -> Gateway (HTTP)
  |-- Public: POST /auth/register -> NATS 'auth.register' -> Core AuthModule
  |-- Public: POST /auth/login -> NATS 'auth.login' -> Core AuthModule
  |-- Public: POST /auth/refresh -> NATS 'auth.refresh' -> Core AuthModule
  |-- Protected: GET /users/me -> JwtAuthGuard -> NATS 'user.findById' {userId} -> Core UsersModule
  |-- Protected: PATCH /users/me -> JwtAuthGuard -> NATS 'user.update' {userId, dto} -> Core UsersModule
  |-- Protected: PATCH /users/me/password -> JwtAuthGuard -> NATS 'user.changePassword' {userId, dto} -> Core UsersModule
  |-- Protected: PATCH /users/:id/role -> JwtAuthGuard + RolesGuard(admin) -> NATS 'user.updateRole' -> Core UsersModule
```

## Related Code Files

| File | Hanh dong |
|------|-----------|
| `apps/gateway/src/app.module.ts` | Cap nhat imports |
| `apps/gateway/src/app.controller.ts` | Xoa auth routes, giu health + tournaments |
| `apps/gateway/src/auth/auth.controller.ts` | Tao moi |
| `apps/gateway/src/users/users.controller.ts` | Tao moi |
| `apps/gateway/src/guards/jwt-auth.guard.ts` | Tao moi |
| `apps/gateway/src/strategies/jwt.strategy.ts` | Tao moi |

## Implementation Steps

### Step 1: Tao jwt.strategy.ts

```typescript
// apps/gateway/src/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * Passport goi ham nay sau khi verify JWT thanh cong.
   * Return value se duoc attach vao request.user
   */
  validate(payload: { sub: string; email: string }) {
    return { userId: payload.sub, email: payload.email };
  }
}
```

### Step 2: Tao jwt-auth.guard.ts

```typescript
// apps/gateway/src/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### Step 3: Tao auth.controller.ts (Gateway)

```typescript
// apps/gateway/src/auth/auth.controller.ts
import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateUserDto, LoginDto } from '@app/common';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('IDENTITY_SERVICE') private readonly identityClient: ClientProxy,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return firstValueFrom(this.identityClient.send('auth.register', createUserDto));
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return firstValueFrom(this.identityClient.send('auth.login', loginDto));
  }

  @Post('refresh')
  async refresh(@Body() data: { refreshToken: string }) {
    return firstValueFrom(this.identityClient.send('auth.refresh', data));
  }
}
```

**Luu y:** Van dung `IDENTITY_SERVICE` client name de giu backward compat voi NATS config hien tai. Core service listen tren cung NATS server nen message pattern moi se route dung.

### Step 4: Tao users.controller.ts (Gateway)

```typescript
// apps/gateway/src/users/users.controller.ts
import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Inject,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UpdateUserDto, ChangePasswordDto, UpdateRoleDto } from '@app/common';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    @Inject('IDENTITY_SERVICE') private readonly identityClient: ClientProxy,
  ) {}

  @Get('me')
  async getProfile(@Req() req: any) {
    return firstValueFrom(
      this.identityClient.send('user.findById', { userId: req.user.userId }),
    );
  }

  @Patch('me')
  async updateProfile(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    return firstValueFrom(
      this.identityClient.send('user.update', {
        userId: req.user.userId,
        updateUserDto,
      }),
    );
  }

  @Patch('me/password')
  async changePassword(@Req() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    return firstValueFrom(
      this.identityClient.send('user.changePassword', {
        userId: req.user.userId,
        changePasswordDto,
      }),
    );
  }

  @Patch(':id/role')
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    // TODO: Them RolesGuard de chi admin moi goi duoc
    // Hien tai chua co role trong JWT payload -> can bo sung sau
    return firstValueFrom(
      this.identityClient.send('user.updateRole', {
        userId: id,
        updateRoleDto,
      }),
    );
  }

  @Get()
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    // TODO: Them RolesGuard(admin) hoac kiem tra quyen
    return firstValueFrom(
      this.identityClient.send('user.findAll', {
        page: page || 1,
        limit: limit || 20,
      }),
    );
  }
}
```

### Step 5: Cap nhat app.controller.ts

Xoa auth routes, chi giu health va tournament routes:

```typescript
// apps/gateway/src/app.controller.ts
import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    @Inject('ESPORTS_SERVICE') private esportsClient: ClientProxy,
  ) {}

  @Get('health')
  health() {
    return { status: 'ok', service: 'api-gateway' };
  }

  @Get('tournaments')
  async getTournaments() {
    return firstValueFrom(this.esportsClient.send('tournaments.findAll', {}));
  }

  @Post('tournaments')
  async createTournament(@Body() data: any) {
    return firstValueFrom(this.esportsClient.send('tournaments.create', data));
  }
}
```

### Step 6: Cap nhat app.module.ts

```typescript
// apps/gateway/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { AuthController } from './auth/auth.controller';
import { UsersController } from './users/users.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Passport + JWT cho gateway-level validation
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
    // NATS Clients
    ClientsModule.register([
      {
        name: 'IDENTITY_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_URL || 'nats://localhost:4223'],
        },
      },
      {
        name: 'ESPORTS_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_URL || 'nats://localhost:4223'],
        },
      },
    ]),
  ],
  controllers: [AppController, AuthController, UsersController],
  providers: [JwtStrategy],
})
export class AppModule {}
```

## Todo List

- [ ] Tao `apps/gateway/src/strategies/jwt.strategy.ts`
- [ ] Tao `apps/gateway/src/guards/jwt-auth.guard.ts`
- [ ] Tao `apps/gateway/src/auth/auth.controller.ts`
- [ ] Tao `apps/gateway/src/users/users.controller.ts`
- [ ] Cap nhat `apps/gateway/src/app.controller.ts` - xoa auth routes
- [ ] Cap nhat `apps/gateway/src/app.module.ts` - them imports + controllers
- [ ] Verify `pnpm run build:gateway` thanh cong
- [ ] Test POST /auth/register, POST /auth/login, POST /auth/refresh
- [ ] Test GET /users/me voi va khong co JWT
- [ ] Test PATCH /users/me, PATCH /users/me/password

## Success Criteria

- `/auth/*` routes hoat dong khong can token
- `/users/*` routes tra ve 401 khi khong co JWT
- `/users/me` tra ve user info cua nguoi dang nhap (dua tren JWT payload)
- `/users/me/password` doi mat khau thanh cong
- `/health` va `/tournaments` van hoat dong binh thuong
- Gateway va Core service start dong thoi khong loi

## Risk Assessment

| Rui ro | Muc do | Giai phap |
|--------|--------|-----------|
| JWT_SECRET khong khop giua gateway va core | Cao | Dung chung .env file, ConfigService |
| IDENTITY_SERVICE client name confusing | Thap | Giu de backward compat, rename sau |
| Missing error handling cho NATS timeout | Trung binh | Them timeout config trong ClientsModule |
| RolesGuard chua implement cho updateRole | Trung binh | TODO comment, implement trong sprint sau |
| ValidationPipe chua enable | Trung binh | Them `app.useGlobalPipes(new ValidationPipe())` trong main.ts |

## Security Considerations

- **JWT at gateway only**: Microservices tin tuong gateway - khong validate lai
- **userId from token**: Luon lay userId tu JWT payload (`req.user.userId`), khong tin request body
- **401 Unauthorized**: JwtAuthGuard tu dong tra ve 401 khi token thieu hoac het han
- **CORS**: Can configure CORS trong gateway main.ts cho production
- **Rate limiting**: Nen them rate limit cho auth/login de chong brute force (ngoai scope)
- **updateRole chua co admin check**: Can them RolesGuard truoc khi deploy production
- **ValidationPipe**: Nen enable global ValidationPipe de validate DTOs tu request body

### Luu y ve ValidationPipe

Them vao `apps/gateway/src/main.ts`:
```typescript
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(3000);
  console.log('API Gateway is running on: http://localhost:3000');
}
```

`whitelist: true` se tu dong strip cac field khong co trong DTO - ngan injection.

## Next Steps

Sau khi hoan thanh Phase 6 - tat ca phases da xong:
1. Chay `pnpm run start:all` de test toan bo he thong
2. Test flow: register -> login -> get profile -> update -> change password
3. Verify old plaintext passwords chua hash (can migration script rieng)
4. Xem xet them: RolesGuard, refresh token rotation, CORS config
