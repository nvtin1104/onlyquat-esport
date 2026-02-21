import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Inject,
  ParseUUIDPipe,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiProperty } from '@nestjs/swagger';
import { IsString as IsStringClass, IsNotEmpty as IsNotEmptyClass, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Auth } from '../decorators/auth.decorator';
import { PERMISSIONS } from '@app/common';

class PermissionCodeDto {
  @ApiProperty({ example: 'tournament:manage', description: 'Permission code (module:action)' })
  @IsStringClass()
  @IsNotEmptyClass()
  permissionCode: string;
}

class CreateGroupDto {
  @ApiProperty() @IsStringClass() @IsNotEmptyClass() name: string;
  @ApiProperty({ required: false }) @IsOptional() @IsStringClass() description?: string;
  @ApiProperty({ type: [String] }) @IsArray() @IsStringClass({ each: true }) permissions: string[];
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isSystem?: boolean;
}

class UpdateGroupDto {
  @ApiProperty({ required: false }) @IsOptional() @IsStringClass() name?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsStringClass() description?: string;
  @ApiProperty({ type: [String], required: false }) @IsOptional() @IsArray() @IsStringClass({ each: true }) permissions?: string[];
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isActive?: boolean;
}

class AssignGroupDto {
  @ApiProperty() @IsNotEmptyClass() @IsStringClass() groupId: string;
}

@ApiTags('Admin')
@Controller('admin/permissions')
export class AdminPermissionsController {
  constructor(
    @Inject('IDENTITY_SERVICE') private readonly identityClient: ClientProxy,
  ) { }

  @Get()
  @Auth(PERMISSIONS.SYSTEM_PERMISSIONS)
  @ApiOperation({
    summary: 'List all group permissions',
    description: 'Returns all permission groups. Requires: `system:permissions`',
  })
  async findAll(@Query('activeOnly') activeOnly?: boolean) {
    return firstValueFrom(
      this.identityClient.send('permissions.findAll', { activeOnly }),
    );
  }

  @Post('groups')
  @Auth(PERMISSIONS.SYSTEM_PERMISSIONS)
  @ApiOperation({ summary: 'Create new permission group' })
  async createGroup(@Body() dto: CreateGroupDto) {
    return firstValueFrom(this.identityClient.send('permissions.createGroup', dto));
  }

  @Get('groups/:id')
  @Auth(PERMISSIONS.SYSTEM_PERMISSIONS)
  @ApiOperation({ summary: 'Get group details' })
  async getGroupById(@Param('id', ParseUUIDPipe) id: string) {
    return firstValueFrom(this.identityClient.send('permissions.getGroupById', { id }));
  }

  @Patch('groups/:id')
  @Auth(PERMISSIONS.SYSTEM_PERMISSIONS)
  @ApiOperation({ summary: 'Update permission group' })
  async updateGroup(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateGroupDto) {
    return firstValueFrom(this.identityClient.send('permissions.updateGroup', { ...dto, id }));
  }

  @Delete('groups/:id')
  @Auth(PERMISSIONS.SYSTEM_PERMISSIONS)
  @ApiOperation({ summary: 'Delete permission group' })
  async deleteGroup(@Param('id', ParseUUIDPipe) id: string) {
    return firstValueFrom(this.identityClient.send('permissions.deleteGroup', { id }));
  }

  @Get('roles')
  @Auth(PERMISSIONS.SYSTEM_PERMISSIONS)
  @ApiOperation({
    summary: 'Get role → permission defaults',
    description: 'Returns default permission mapping per role',
  })
  async getRoleDefaults() {
    return firstValueFrom(
      this.identityClient.send('permissions.roleDefaults', {}),
    );
  }

  @Get('user/:userId')
  @Auth(PERMISSIONS.SYSTEM_PERMISSIONS)
  @ApiOperation({
    summary: 'Get user resolved permissions',
    description: 'Returns flattened permission list + custom overrides for a user',
  })
  async getUserPermissions(@Param('userId', ParseUUIDPipe) userId: string) {
    return firstValueFrom(
      this.identityClient.send('permissions.userPermissions', { userId }),
    );
  }

  @Post('user/:userId/assign-group')
  @Auth(PERMISSIONS.SYSTEM_PERMISSIONS)
  @ApiOperation({ summary: 'Assign group to user' })
  async assignGroup(@Param('userId', ParseUUIDPipe) userId: string, @Body() dto: AssignGroupDto) {
    return firstValueFrom(this.identityClient.send('permissions.assignGroup', { userId, groupId: dto.groupId }));
  }

  @Delete('user/:userId/remove-group/:groupId')
  @Auth(PERMISSIONS.SYSTEM_PERMISSIONS)
  @ApiOperation({ summary: 'Remove group from user' })
  async removeGroup(@Param('userId', ParseUUIDPipe) userId: string, @Param('groupId', ParseUUIDPipe) groupId: string) {
    return firstValueFrom(this.identityClient.send('permissions.removeGroup', { userId, groupId }));
  }

  @Post('user/:userId/grant')
  @Auth(PERMISSIONS.SYSTEM_PERMISSIONS)
  @ApiOperation({
    summary: 'Grant custom permission to user',
    description: 'Adds permission beyond role defaults. Requires: `system:permissions`',
  })
  @ApiBody({ type: PermissionCodeDto })
  async grantCustom(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: PermissionCodeDto,
  ) {
    return firstValueFrom(
      this.identityClient.send('permissions.grantCustom', { userId, code: dto.permissionCode }),
    );
  }

  @Post('user/:userId/revoke')
  @Auth(PERMISSIONS.SYSTEM_PERMISSIONS)
  @ApiOperation({
    summary: 'Revoke permission from user',
    description: 'Removes permission even if role grants it. Requires: `system:permissions`',
  })
  @ApiBody({ type: PermissionCodeDto })
  async revokeCustom(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: PermissionCodeDto,
  ) {
    return firstValueFrom(
      this.identityClient.send('permissions.revokeCustom', { userId, code: dto.permissionCode }),
    );
  }

  @Post('user/:userId/rebuild')
  @Auth(PERMISSIONS.SYSTEM_PERMISSIONS)
  @ApiOperation({
    summary: 'Rebuild permission cache for a user',
    description: 'Forces cache rebuild. Useful after role or permission changes.',
  })
  async rebuildCache(@Param('userId', ParseUUIDPipe) userId: string) {
    return firstValueFrom(
      this.identityClient.send('permissions.buildCache', { userId }),
    );
  }
}
