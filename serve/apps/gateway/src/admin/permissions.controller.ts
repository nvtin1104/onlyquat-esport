import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Inject,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiProperty } from '@nestjs/swagger';
import { IsString as IsStringClass, IsNotEmpty as IsNotEmptyClass } from 'class-validator';
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

@ApiTags('Admin')
@Controller('admin/permissions')
export class AdminPermissionsController {
  constructor(
    @Inject('IDENTITY_SERVICE') private readonly identityClient: ClientProxy,
  ) {}

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
