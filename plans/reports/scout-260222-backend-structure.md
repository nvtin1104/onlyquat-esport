# Backend Codebase Scout Report
**Date:** 2026-02-22 | **Project:** onlyquat-esport | **Scope:** NestJS Structure & Error Handling

## 1. NestJS Overall Architecture

### Apps Structure
```
serve/
├── apps/
│   ├── gateway/         (HTTP API gateway - Port 3333)
│   ├── core/            (Microservice - Auth/Users - NATS only)
│   └── esports/         (Microservice - Tournaments/Regions - NATS only)
└── libs/
    └── common/          (Shared library - Prisma, filters)
```

## 2. Exception Filters

### Gateway Level
**File:** `serve/apps/gateway/src/filters/rpc-exception.filter.ts`
- Class: `RpcToHttpExceptionFilter`
- Applied: `app.useGlobalFilters(new RpcToHttpExceptionFilter())`
- Handles 5 error case types

Response format:
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### Microservice Level
**File:** `serve/libs/common/src/filters/all-exceptions-to-rpc.filter.ts`
- Class: `AllExceptionsToRpcFilter extends BaseRpcExceptionFilter`
- Applied: `app.useGlobalFilters(new AllExceptionsToRpcFilter())`
- Wraps HttpExceptions as RpcExceptions

## 3. Validation Pipeline

Applied: `app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))`
- Location: `serve/apps/gateway/src/main.ts:21`
- Decorators used: @IsEmail, @IsNotEmpty, @IsString, @MinLength, @IsEnum, @IsUUID, etc.

## 4. Error Messages

### Current Patterns
```typescript
throw new ConflictException('Email already exists');
throw new UnauthorizedException('Invalid credentials');
throw new BadRequestException('Users with ROOT, ADMIN, or STAFF roles must have accountType = 0');
```

### Characteristics
- English-only, hardcoded in services
- No error codes, no structured error objects
- No centralized message definitions

## 5. i18n Status

**Found:** Vietnamese in permissions only
- File: `serve/libs/common/src/constants/permissions.ts`
- Example: `{ code: 'user:view', name: 'Xem danh sách người dùng' }`
- NOT used for error messages or API responses

**Missing:** No i18n infrastructure at all

## 6. Response Interceptors
Currently: NONE

## 7. Pagination Pattern

From: `serve/apps/esports/src/region/region.service.ts`
```typescript
private paginate<T>(data: T[], total: number, page: number, limit: number) {
  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}
```

## 8. Controllers (HTTP)

File: `serve/apps/gateway/src/auth/auth.controller.ts`
```typescript
@Controller('auth')
export class AuthController {
  constructor(@Inject('IDENTITY_SERVICE') private readonly identityClient: ClientProxy) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return firstValueFrom(this.identityClient.send('auth.register', createUserDto));
  }
}
```

## 9. Microservice Controllers (NATS)

File: `serve/apps/core/src/auth/auth.controller.ts`
```typescript
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register')
  async register(@Payload() data: CreateUserDto) {
    return this.authService.register(data);
  }
}
```

## 10. Services

File: `serve/apps/core/src/auth/auth.service.ts` (partial)
```typescript
async login(loginDto: LoginDto): Promise<TokenResponseDto> {
  const user = await this.usersService.findByEmailWithPassword(loginDto.email);
  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }
  const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid credentials');
  }
  return { ...tokens, user };
}
```

## 11. DTOs

### LoginDto
File: `serve/apps/gateway/src/dtos/login.dto.ts`
```typescript
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
```

### AdminCreateUserDto
File: `serve/apps/core/src/dtos/admin-create-user.dto.ts`
```typescript
export class AdminCreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(UserRole, { each: true })
  roles: UserRole[];

  @IsInt()
  @Min(0)
  @Max(1)
  accountType: number;
}
```

## 12. Permission System

File: `serve/libs/common/src/constants/permissions.ts`
- 50+ permission codes (user:view, tournament:create, etc.)
- Vietnamese metadata for each permission
- Modules: user, tournament, match, player, team, rating, points, content, region, organization, system

## Key Findings

| Aspect | Status |
|--------|--------|
| Error Messages | Hardcoded English strings in services |
| Error Codes | NONE (only HTTP status) |
| i18n Infrastructure | NONE |
| Response Interceptors | NONE |
| Validation | Class-validator decorators on DTOs |
| Pagination | Manual in services |
| Logging | Basic Logger from @nestjs/common |

## File Paths (Absolute)

### Exception Filters
- C:\project\onlyquat-esport\serve\apps\gateway\src\filters\rpc-exception.filter.ts
- C:\project\onlyquat-esport\serve\libs\common\src\filters\all-exceptions-to-rpc.filter.ts

### Entry Points
- C:\project\onlyquat-esport\serve\apps\gateway\src\main.ts
- C:\project\onlyquat-esport\serve\apps\core\src\main.ts
- C:\project\onlyquat-esport\serve\apps\esports\src\main.ts

### App Modules
- C:\project\onlyquat-esport\serve\apps\gateway\src\app.module.ts
- C:\project\onlyquat-esport\serve\apps\core\src\app.module.ts
- C:\project\onlyquat-esport\serve\apps\esports\src\app.module.ts

### DTOs
- C:\project\onlyquat-esport\serve\apps\gateway\src\dtos\login.dto.ts
- C:\project\onlyquat-esport\serve\apps\gateway\src\dtos\create-user.dto.ts
- C:\project\onlyquat-esport\serve\apps\core\src\dtos\admin-create-user.dto.ts
- C:\project\onlyquat-esport\serve\apps\esports\src\dtos\create-tournament.dto.ts
- C:\project\onlyquat-esport\serve\apps\esports\src\dtos\create-region.dto.ts

### Services
- C:\project\onlyquat-esport\serve\apps\core\src\auth\auth.service.ts
- C:\project\onlyquat-esport\serve\apps\core\src\users\users.service.ts
- C:\project\onlyquat-esport\serve\apps\esports\src\region\region.service.ts

### Controllers
- C:\project\onlyquat-esport\serve\apps\gateway\src\auth\auth.controller.ts
- C:\project\onlyquat-esport\serve\apps\core\src\auth\auth.controller.ts
- C:\project\onlyquat-esport\serve\apps\esports\src\region\region.controller.ts

### Shared
- C:\project\onlyquat-esport\serve\libs\common\src\index.ts
- C:\project\onlyquat-esport\serve\libs\common\src\constants\permissions.ts
