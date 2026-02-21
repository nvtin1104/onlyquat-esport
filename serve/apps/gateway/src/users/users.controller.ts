import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Inject,
  Req,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Auth, JwtAuth } from '../decorators/auth.decorator';
import { PERMISSIONS } from '@app/common';
import { UpdateUserDto, ChangePasswordDto, UpdateRoleDto } from '../dtos';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    @Inject('IDENTITY_SERVICE') private readonly identityClient: ClientProxy,
  ) {}

  @Get('me')
  @JwtAuth()
  @ApiOperation({ summary: 'Get own profile' })
  async getProfile(@Req() req: any) {
    return firstValueFrom(
      this.identityClient.send('user.findById', { userId: req.user.userId }),
    );
  }

  @Patch('me')
  @JwtAuth()
  @ApiOperation({ summary: 'Update own profile' })
  async updateProfile(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    return firstValueFrom(
      this.identityClient.send('user.update', {
        userId: req.user.userId,
        updateUserDto,
      }),
    );
  }

  @Patch('me/password')
  @JwtAuth()
  @ApiOperation({ summary: 'Change own password' })
  async changePassword(
    @Req() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return firstValueFrom(
      this.identityClient.send('user.changePassword', {
        userId: req.user.userId,
        changePasswordDto,
      }),
    );
  }

  @Get()
  @Auth(PERMISSIONS.USER_VIEW)
  @ApiOperation({ summary: 'List all users — requires user:view' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return firstValueFrom(
      this.identityClient.send('user.findAll', {
        page: page || 1,
        limit: limit || 20,
      }),
    );
  }

  @Get(':id')
  @Auth(PERMISSIONS.USER_VIEW_DETAIL)
  @ApiOperation({ summary: 'Get user by ID — requires user:view-detail' })
  async findById(@Param('id') id: string) {
    return firstValueFrom(
      this.identityClient.send('user.findById', { userId: id }),
    );
  }

  @Patch(':id/role')
  @Auth(PERMISSIONS.USER_UPDATE_ROLE)
  @ApiOperation({ summary: 'Update user role — requires user:update-role' })
  async updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return firstValueFrom(
      this.identityClient.send('user.updateRole', { userId: id, updateRoleDto }),
    );
  }

  @Patch(':id/ban')
  @Auth(PERMISSIONS.USER_BAN)
  @ApiOperation({ summary: 'Ban/unban user — requires user:ban' })
  async banUser(@Param('id') id: string) {
    return firstValueFrom(
      this.identityClient.send('user.ban', { userId: id }),
    );
  }
}
