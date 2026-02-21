import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PermissionsService } from './permissions.service';

@Controller()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) { }

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

  @MessagePattern('permissions.createGroup')
  async createGroup(@Payload() data: { name: string; description?: string; permissions: string[]; isSystem?: boolean }) {
    return this.permissionsService.createGroupPermission(data);
  }

  @MessagePattern('permissions.updateGroup')
  async updateGroup(@Payload() data: { id: string; name?: string; description?: string; permissions?: string[]; isActive?: boolean }) {
    return this.permissionsService.updateGroupPermission(data.id, data);
  }

  @MessagePattern('permissions.deleteGroup')
  async deleteGroup(@Payload() data: { id: string }) {
    return this.permissionsService.deleteGroupPermission(data.id);
  }

  @MessagePattern('permissions.getGroupById')
  async getGroupById(@Payload() data: { id: string }) {
    return this.permissionsService.findGroupById(data.id);
  }

  @MessagePattern('permissions.assignGroup')
  async assignGroup(@Payload() data: { userId: string; groupId: string }) {
    return this.permissionsService.assignGroupToUser(data.userId, data.groupId);
  }

  @MessagePattern('permissions.removeGroup')
  async removeGroup(@Payload() data: { userId: string; groupId: string }) {
    return this.permissionsService.removeGroupFromUser(data.userId, data.groupId);
  }
}
