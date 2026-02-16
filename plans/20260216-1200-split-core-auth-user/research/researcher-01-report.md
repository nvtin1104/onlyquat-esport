# NestJS JWT Authentication for Microservices with NATS

## 1. Module Setup (@nestjs/jwt + @nestjs/passport)

Install: `npm i @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt @types/bcrypt`

**auth.module.ts:**
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
```

## 2. Dual Token Pattern (Access + Refresh)

**auth.service.ts:**
```typescript
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
  private readonly REFRESH_EXPIRES_IN = '7d';

  constructor(private jwtService: JwtService) {}

  async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.REFRESH_SECRET,
      expiresIn: this.REFRESH_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.REFRESH_SECRET,
      });
      const accessToken = this.jwtService.sign(
        { sub: payload.sub, email: payload.email },
        { expiresIn: '15m' }
      );
      return { accessToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}
```

## 3. bcrypt Password Hashing

**Best practice: Hash on signup, compare on login**
```typescript
// During user signup
const hashedPassword = await this.authService.hashPassword(rawPassword);
user.password = hashedPassword;
await user.save();

// During login verification
const isPasswordValid = await this.authService.validatePassword(
  providedPassword,
  user.password
);
if (!isPasswordValid) throw new UnauthorizedException();
```

## 4. AuthGuard for HTTP + Microservices

**jwt.strategy.ts (Passport Strategy):**
```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
```

**jwt-auth.guard.ts (Custom Guard):**
```typescript
import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    // For NATS: extract from message context instead of HTTP
    const contextType = context.getType();

    if (contextType === 'rpc') {
      // NATS message context
      const message = context.switchToRpc().getData();
      if (!message.user) return false;
      return true;
    }

    // HTTP context (default Passport behavior)
    return super.canActivate(context);
  }
}
```

## 5. Gateway-Level JWT Validation (Before NATS Forward)

**api-gateway.controller.ts:**
```typescript
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtValidationMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: any, res: any, next: () => void) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.verify(token);
      req.user = payload; // Attach decoded user to request
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
    next();
  }
}
```

**gateway.controller.ts (Forward to NATS):**
```typescript
import { Controller, Post, Body, UseGuards, Req, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('api/users')
export class ApiGatewayController {
  constructor(@Inject('USERS_SERVICE') private usersClient: ClientProxy) {}

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  async getUserProfile(@Req() req: any) {
    // JWT already validated by middleware/guard
    // Now forward to microservice with user context
    return this.usersClient.send('get_user_profile', {
      userId: req.user.sub,
      user: req.user, // Pass decoded JWT to microservice
    });
  }
}
```

## 6. NATS Microservice Configuration

**users.module.ts (Microservice):**
```typescript
import { Module } from '@nestjs/common';
import { MicroservicesModule } from '@nestjs/microservices';
import { Transport, ClientOptions } from '@nestjs/microservices';

const natsOptions: ClientOptions = {
  transport: Transport.NATS,
  options: {
    servers: [process.env.NATS_URL || 'nats://localhost:4222'],
  },
};

@Module({
  imports: [MicroservicesModule.register([natsOptions])],
})
export class UsersModule {}
```

**users.controller.ts (Receives from Gateway):**
```typescript
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class UsersController {
  @MessagePattern('get_user_profile')
  async getProfile(@Payload() data: { userId: string; user: any }) {
    // User context passed from gateway (already validated JWT)
    if (!data.user) throw new Error('Unauthorized');
    return { userId: data.userId, email: data.user.email };
  }
}
```

## Key Patterns

- **Gateway validates JWT first** before forwarding; microservices trust the gateway's validation
- **Dual tokens**: Access token (15m) for requests, refresh token (7d) for new access tokens
- **bcrypt hashing**: Always hash passwords with salt round 10; never store plaintext
- **NATS JWT transfer**: Pass decoded JWT payload to microservices via message data
- **Separate secrets**: Different secrets for access/refresh tokens reduce compromise surface

## Unresolved Questions

- How to handle JWT rotation in high-traffic environments without token revocation lists?
- Should refresh tokens be stored in Redis for centralized invalidation across services?
