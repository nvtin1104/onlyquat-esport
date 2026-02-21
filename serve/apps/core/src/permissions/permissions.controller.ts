import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PermissionsService } from './permissions.service';

@Controller()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @MessagePattern('permissions.findAll')
  async findAll(@Payload() data: { activeOnly?: boolean }) {
    return this.permissionsService.findAll(data.activeOnly);
  }

  @MessagePattern('permissions.roleDefaults')
  async getRoleDefaults() {
    return this.permissionsService.getRoleDefaults();
  }

  @MessagePattern('permissions.userPermissions')
  async getUserPermissions(@Payload() data: { userId: string }) {
    return this.permissionsService.getUserPermissions(data.userId);
  }

  @MessagePattern('permissions.grantCustom')
  async grantCustom(@Payload() data: { userId: string; code: string }) {
    return this.permissionsService.grantCustom(data.userId, data.code);
  }

  @MessagePattern('permissions.revokeCustom')
  async revokeCustom(@Payload() data: { userId: string; code: string }) {
    return this.permissionsService.revokeCustom(data.userId, data.code);
  }

  @MessagePattern('permissions.buildCache')
  async buildCache(@Payload() data: { userId: string }) {
    return this.permissionsService.buildUserPermissions(data.userId);
  }
}
