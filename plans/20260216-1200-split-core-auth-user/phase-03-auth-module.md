# Phase 3: Tao Auth Module

## Context Links

- [plan.md](./plan.md)
- [research/researcher-01-report.md](./research/researcher-01-report.md)
- Phu thuoc: Phase 1 (dependencies), Phase 2 (DTOs)

## Tong quan

Tao Auth module trong `apps/core/src/auth/` xu ly: dang ky (hash password + tao token), dang nhap (verify password + tao token), refresh token, validate token. Auth module import UsersModule de truy cap du lieu nguoi dung.

## Key Insights

- AuthService **phu thuoc** UsersService (mot chieu, khong nguoc lai)
- JWT access token 15 phut, refresh token 7 ngay, dung secret rieng biet
- bcrypt salt rounds = 10 (can bang giua bao mat va performance)
- Core service la NATS microservice - dung `@MessagePattern`, khong dung HTTP decorators
- Gateway se validate JWT cho protected routes - core service tin tuong gateway

## Requirements

1. `auth.module.ts` - Import JwtModule, PassportModule, UsersModule
2. `auth.controller.ts` - NATS message patterns: auth.register, auth.login, auth.refresh, auth.validate-token
3. `auth.service.ts` - Hash password, verify password, generate dual tokens, refresh logic

## Architecture

```
apps/core/src/auth/
  |-- auth.module.ts
  |-- auth.controller.ts
  |-- auth.service.ts
```

**Dependency flow:**
```
AuthModule --imports--> UsersModule
AuthService --injects--> UsersService
AuthService --injects--> JwtService
```

## Related Code Files

| File | Hanh dong |
|------|-----------|
| `apps/core/src/auth/auth.module.ts` | Tao moi |
| `apps/core/src/auth/auth.controller.ts` | Tao moi |
| `apps/core/src/auth/auth.service.ts` | Tao moi |
| `apps/core/src/identity.controller.ts` | Se bi xoa o Phase 5 |
| `apps/core/src/identity.service.ts` | Se bi xoa o Phase 5 |

## Implementation Steps

### Step 1: Tao auth.service.ts

```typescript
// apps/core/src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto, LoginDto, TokenResponseDto } from '@app/common';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<TokenResponseDto> {
    // Kiem tra email da ton tai chua
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, this.SALT_ROUNDS);

    // Tao user voi password da hash
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Generate tokens
    const tokens = await this.generateTokens(user._id.toString(), user.email);

    return {
      ...tokens,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    // Tim user bang email (bao gom password)
    const user = await this.usersService.findByEmailWithPassword(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // So sanh password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user._id.toString(), user.email);

    return {
      ...tokens,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const accessToken = this.jwtService.sign(
        { sub: payload.sub, email: payload.email },
        { expiresIn: '15m' },
      );

      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateToken(token: string): Promise<{ valid: boolean; payload?: any }> {
    try {
      const payload = this.jwtService.verify(token);
      return { valid: true, payload: { userId: payload.sub, email: payload.email } };
    } catch {
      return { valid: false };
    }
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
```

### Step 2: Tao auth.controller.ts

```typescript
// apps/core/src/auth/auth.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from '@app/common';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register')
  async register(@Payload() data: CreateUserDto) {
    return this.authService.register(data);
  }

  @MessagePattern('auth.login')
  async login(@Payload() data: LoginDto) {
    return this.authService.login(data);
  }

  @MessagePattern('auth.refresh')
  async refresh(@Payload() data: { refreshToken: string }) {
    return this.authService.refresh(data.refreshToken);
  }

  @MessagePattern('auth.validate-token')
  async validateToken(@Payload() data: { token: string }) {
    return this.authService.validateToken(data.token);
  }
}
```

### Step 3: Tao auth.module.ts

```typescript
// apps/core/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
```

**Luu y:** Dung `JwtModule.registerAsync` thay vi `register` de doc config tu ConfigService (thay vi hardcode hoac dung process.env truc tiep).

## Todo List

- [ ] Tao `apps/core/src/auth/auth.service.ts`
- [ ] Tao `apps/core/src/auth/auth.controller.ts`
- [ ] Tao `apps/core/src/auth/auth.module.ts`
- [ ] Verify AuthService inject duoc UsersService va JwtService
- [ ] Test message patterns voi NATS

## Success Criteria

- `auth.register` hash password truoc khi luu va tra ve tokens
- `auth.login` dung bcrypt.compare, tra ve tokens hoac throw UnauthorizedException
- `auth.refresh` verify refresh token va tra ve access token moi
- `auth.validate-token` tra ve { valid: true/false }
- Khong bao gio tra ve password trong response

## Risk Assessment

| Rui ro | Muc do | Giai phap |
|--------|--------|-----------|
| Circular dependency Auth <-> Users | Trung binh | Chi Auth import Users (mot chieu) |
| JWT_SECRET khong set trong env | Cao | ConfigService throw error neu thieu |
| bcrypt chay cham tren CI | Thap | Salt rounds 10 la chap nhan duoc |
| RpcException vs HttpException | Trung binh | Dung RpcException trong microservice, gateway convert sang HttpException |

## Security Considerations

- **Khong tra ve password**: UsersService.findByEmailWithPassword chi dung noi bo trong AuthService
- **Error message chung**: "Invalid credentials" cho ca sai email va sai password (chong enumeration)
- **Separate secrets**: JWT_SECRET cho access token, JWT_REFRESH_SECRET cho refresh token
- **Token expiry**: Access 15m (ngan), Refresh 7d (dai nhung co the revoke)
- **bcrypt cost factor**: 10 rounds - du manh cho production

## Next Steps

Sau khi hoan thanh -> dam bao Phase 4 (Users Module) cung xong -> chuyen sang Phase 5
