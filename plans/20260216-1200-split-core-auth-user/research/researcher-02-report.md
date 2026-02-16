# NestJS User Management Module: Best Practices Research Report

**Date:** Feb 16, 2026 | **Focus:** NestJS 10 + Mongoose production patterns

---

## 1. User CRUD Service Pattern with Mongoose

**Key Principle:** Service handles DB logic only, no HTTP logic.

```typescript
// users.service.ts
@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.userModel.create({
      ...createUserDto,
      password: hashedPassword
    });
  }

  async findAll(page: number, limit: number) {
    const [users, total] = await Promise.all([
      this.userModel.find().skip((page - 1) * limit).limit(limit).select('-password'),
      this.userModel.countDocuments()
    ]);
    return { users, total, page, limit };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
    if (!user) throw new NotFoundException('User not found');
    return user.select('-password');
  }

  async delete(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('User not found');
  }
}
```

**Best Practices:**
- Always `.select('-password')` to exclude sensitive data from responses
- Use `findByIdAndUpdate({ new: true })` to return updated doc
- Check for email duplicates before creation (unique index in schema)
- Hash passwords before saving

---

## 2. DTOs for User Operations

```typescript
// create-user.dto.ts
export class CreateUserDto {
  @IsEmail() email: string;
  @MinLength(8) password: string;
  @IsString() firstName: string;
  @IsString() lastName: string;
}

// update-user.dto.ts
export class UpdateUserDto {
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsEnum(Role) role?: Role;
}

// change-password.dto.ts
export class ChangePasswordDto {
  @MinLength(8) oldPassword: string;
  @MinLength(8) newPassword: string;
}

// paginated-response.dto.ts
export class PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}
```

---

## 3. Role-Based Access Control (RBAC) in Microservices

**Pattern:** Use Guards + Decorators for permission enforcement.

```typescript
// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>('roles', context.getHandler());
    if (!requiredRoles) return true; // No roles required

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return requiredRoles.some((role) => user.role === role);
  }
}

// roles.decorator.ts
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

// Controller usage
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  @Patch(':id')
  @Roles(Role.ADMIN)
  updateUserRole(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }
}
```

**Microservices Pattern:** API Gateway validates JWT, then enriches request with user context before routing to user/auth services via NATS.

---

## 4. Auth vs User Module Separation

**Clear Boundaries:**

| Auth Module | User Module |
|---|---|
| JWT/token generation | CRUD operations |
| Password verification | User data storage |
| Login/logout logic | Profile management |
| Refresh tokens | Role assignment |

```typescript
// auth.module.ts
@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({...})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule {}

// users.module.ts
@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService] // Auth imports this
})
export class UsersModule {}
```

**Rule:** AuthService consumes UsersService, never the reverse.

---

## 5. Password Change Flow (Secure Implementation)

```typescript
// users.service.ts - changePassword method
async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
  const user = await this.userModel.findById(userId);
  if (!user) throw new NotFoundException('User not found');

  // Verify old password
  const isPasswordValid = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
  if (!isPasswordValid) throw new UnauthorizedException('Old password is incorrect');

  // Hash new password
  const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

  // Update password
  await this.userModel.findByIdAndUpdate(userId, {
    password: hashedNewPassword
  });
}

// users.controller.ts
@Patch('change-password')
@UseGuards(JwtAuthGuard)
changePassword(@Req() req: RequestWithUser, @Body() dto: ChangePasswordDto) {
  return this.usersService.changePassword(req.user.id, dto);
}
```

**Security Checks:**
- Verify old password with `bcrypt.compare()` before allowing change
- Hash new password with salt rounds 10-12
- Only accessible to authenticated users (JwtAuthGuard)
- Consider invalidating all existing tokens after password change

---

## Key Takeaways

1. **Separation of Concerns:** Auth handles tokens, Users handles data
2. **DTOs:** Use class-validator decorators, support optional fields for updates
3. **Pagination:** offset/limit pattern with metadata response
4. **RBAC:** Guard + Decorator pattern, enforced at controller level
5. **Security:** Always exclude passwords from responses, use bcrypt salt rounds 10+, verify old password before changes

---

## Sources

- [CRUD with NestJS and MongoDB - Medium](https://medium.com/globant/crud-application-using-nestjs-and-mongodb-99a0756adb76)
- [NestJS RBAC Best Practices - Permit.io](https://www.permit.io/blog/how-to-protect-a-url-inside-a-nestjs-app-using-rbac-authorization)
- [Authentication in NestJS - Muhammad Awais](https://medium.com/@awaisshaikh94/a-detailed-guide-on-implementing-authentication-in-nestjs-4a347ce154b6)
- [Data Validation with class-validator - Medium](https://medium.com/@ahureinebenezer/mastering-data-validation-in-nestjs-a-complete-guide-with-class-validator-and-class-transformer-02a029db6ecf)
- [API Pagination Guide - Medium](https://medium.com/@solomoncodes/api-pagination-in-nestjs-a-comprehensive-guide-25a212f45f08)
- [bcrypt Password Hashing - Muhammad Awais](https://medium.com/@awaisshaikh94/encrypting-passwords-in-nestjs-with-the-robust-hashing-mechanism-of-bcrypt-e052c7a499a3)
- [NestJS Official Documentation](https://docs.nestjs.com)
