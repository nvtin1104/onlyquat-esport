# Phase 4: Tao User Module

## Context Links

- [plan.md](./plan.md)
- [research/researcher-02-report.md](./research/researcher-02-report.md)
- Phu thuoc: Phase 1 (dependencies), Phase 2 (DTOs)

## Tong quan

Tao Users module trong `apps/core/src/users/` xu ly CRUD nguoi dung, doi mat khau, cap nhat role. Module nay quan ly Mongoose User model va **duoc export de AuthModule su dung**.

## Key Insights

- UsersService phai export `findByEmailWithPassword()` cho AuthService (truong hop duy nhat tra ve password)
- Moi query khac phai `.select('-password')` de loai password khoi response
- `user.changePassword` can verify old password truoc khi cap nhat
- `user.updateRole` chi cho admin - nhung kiem tra role la viec cua gateway, core service chi thuc thi
- UsersModule **khong biet** AuthModule ton tai - khong import nguoc lai

## Requirements

1. `users.module.ts` - Import MongooseModule voi User schema, export UsersService
2. `users.controller.ts` - NATS message patterns cho CRUD + changePassword + updateRole
3. `users.service.ts` - Logic CRUD, luon loai password tru khi AuthService can

## Architecture

```
apps/core/src/users/
  |-- users.module.ts
  |-- users.controller.ts
  |-- users.service.ts
```

**Message patterns:**
```
user.create       -> Tao user moi (dung boi AuthService qua internal call)
user.findAll      -> Lay danh sach users (co pagination)
user.findById     -> Lay user theo ID
user.findByEmail  -> Lay user theo email
user.update       -> Cap nhat thong tin user
user.delete       -> Xoa user (soft delete = set isActive: false)
user.changePassword -> Doi mat khau
user.updateRole   -> Cap nhat role (admin only, kiem tra o gateway)
```

## Related Code Files

| File | Hanh dong |
|------|-----------|
| `apps/core/src/users/users.module.ts` | Tao moi |
| `apps/core/src/users/users.controller.ts` | Tao moi |
| `apps/core/src/users/users.service.ts` | Tao moi |
| `libs/common/src/schemas/user.schema.ts` | Giu nguyen, khong thay doi |

## Implementation Steps

### Step 1: Tao users.service.ts

```typescript
// apps/core/src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import {
  User,
  UserDocument,
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  UpdateRoleDto,
} from '@app/common';

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 10;

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * Tao user moi - dung boi AuthService (password da hash san)
   */
  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = new this.userModel(createUserDto);
    return user.save();
  }

  /**
   * Lay danh sach users co pagination
   */
  async findAll(page = 1, limit = 20): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userModel.find().skip(skip).limit(limit).select('-password').exec(),
      this.userModel.countDocuments(),
    ]);
    return { users, total, page, limit };
  }

  /**
   * Tim user theo ID - khong tra ve password
   */
  async findById(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Tim user theo email - khong tra ve password
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('-password').exec();
  }

  /**
   * Tim user theo email BAO GOM password - CHI dung boi AuthService
   */
  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  /**
   * Cap nhat thong tin user (khong bao gom password, email, role)
   */
  async update(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, updateUserDto, { new: true })
      .select('-password')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Soft delete - set isActive = false
   */
  async delete(userId: string): Promise<{ message: string }> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { isActive: false }, { new: true })
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User deactivated successfully' };
  }

  /**
   * Doi mat khau - verify old password truoc
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    // Hash va save new password
    user.password = await bcrypt.hash(changePasswordDto.newPassword, this.SALT_ROUNDS);
    await user.save();

    return { message: 'Password changed successfully' };
  }

  /**
   * Cap nhat role - gateway da kiem tra quyen admin truoc khi goi
   */
  async updateRole(userId: string, updateRoleDto: UpdateRoleDto): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { role: updateRoleDto.role }, { new: true })
      .select('-password')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
```

### Step 2: Tao users.controller.ts

```typescript
// apps/core/src/users/users.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { UpdateUserDto, ChangePasswordDto, UpdateRoleDto } from '@app/common';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('user.findAll')
  async findAll(@Payload() data: { page?: number; limit?: number }) {
    return this.usersService.findAll(data.page, data.limit);
  }

  @MessagePattern('user.findById')
  async findById(@Payload() data: { userId: string }) {
    return this.usersService.findById(data.userId);
  }

  @MessagePattern('user.findByEmail')
  async findByEmail(@Payload() data: { email: string }) {
    return this.usersService.findByEmail(data.email);
  }

  @MessagePattern('user.update')
  async update(@Payload() data: { userId: string; updateUserDto: UpdateUserDto }) {
    return this.usersService.update(data.userId, data.updateUserDto);
  }

  @MessagePattern('user.delete')
  async delete(@Payload() data: { userId: string }) {
    return this.usersService.delete(data.userId);
  }

  @MessagePattern('user.changePassword')
  async changePassword(@Payload() data: { userId: string; changePasswordDto: ChangePasswordDto }) {
    return this.usersService.changePassword(data.userId, data.changePasswordDto);
  }

  @MessagePattern('user.updateRole')
  async updateRole(@Payload() data: { userId: string; updateRoleDto: UpdateRoleDto }) {
    return this.usersService.updateRole(data.userId, data.updateRoleDto);
  }
}
```

### Step 3: Tao users.module.ts

```typescript
// apps/core/src/users/users.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@app/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // AuthModule se import UsersModule de dung UsersService
})
export class UsersModule {}
```

## Todo List

- [ ] Tao `apps/core/src/users/users.service.ts`
- [ ] Tao `apps/core/src/users/users.controller.ts`
- [ ] Tao `apps/core/src/users/users.module.ts`
- [ ] Verify UsersModule export UsersService dung
- [ ] Test cac message patterns

## Success Criteria

- Moi query (tru findByEmailWithPassword) khong tra ve truong password
- `user.changePassword` verify old password truoc khi doi
- `user.delete` la soft delete (set isActive: false)
- `user.findAll` ho tro pagination
- UsersService export duoc cho AuthModule su dung
- Khong co circular dependency

## Risk Assessment

| Rui ro | Muc do | Giai phap |
|--------|--------|-----------|
| findByEmailWithPassword bi goi sai noi | Trung binh | Comment ro rang trong code, chi AuthService dung |
| Mongoose findByIdAndUpdate khong trigger middleware | Thap | Khong can middleware hien tai |
| Pagination sai khi data lon | Thap | Index tren email + createdAt |

## Security Considerations

- **Password exclusion**: `.select('-password')` tren moi query tra ve client
- **findByEmailWithPassword**: Chi export cho AuthService, khong expose qua message pattern
- **Soft delete**: Khong xoa data that, chi deactivate - ho tro audit trail
- **changePassword**: Bat buoc verify old password, hash new password voi bcrypt
- **updateRole**: Core service khong kiem tra quyen - gateway chiu trach nhiem authorize

## Next Steps

Sau khi hoan thanh Phase 3 + Phase 4 -> chuyen sang Phase 5 (Core AppModule)
