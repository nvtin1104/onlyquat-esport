import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { UpdateUserDto, ChangePasswordDto, UpdateRoleDto } from '../dtos';

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
  async update(
    @Payload() data: { userId: string; updateUserDto: UpdateUserDto },
  ) {
    return this.usersService.update(data.userId, data.updateUserDto);
  }

  @MessagePattern('user.delete')
  async delete(@Payload() data: { userId: string }) {
    return this.usersService.delete(data.userId);
  }

  @MessagePattern('user.changePassword')
  async changePassword(
    @Payload()
    data: { userId: string; changePasswordDto: ChangePasswordDto },
  ) {
    return this.usersService.changePassword(
      data.userId,
      data.changePasswordDto,
    );
  }

  @MessagePattern('user.updateRole')
  async updateRole(
    @Payload() data: { userId: string; updateRoleDto: UpdateRoleDto },
  ) {
    return this.usersService.updateRole(data.userId, data.updateRoleDto);
  }
}
