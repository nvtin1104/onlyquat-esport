import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Inject,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UpdateUserDto, ChangePasswordDto, UpdateRoleDto } from '../dtos';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    @Inject('IDENTITY_SERVICE') private readonly identityClient: ClientProxy,
  ) {}

  @Get('me')
  async getProfile(@Req() req: any) {
    return firstValueFrom(
      this.identityClient.send('user.findById', {
        userId: req.user.userId,
      }),
    );
  }

  @Patch('me')
  async updateProfile(
    @Req() req: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return firstValueFrom(
      this.identityClient.send('user.update', {
        userId: req.user.userId,
        updateUserDto,
      }),
    );
  }

  @Patch('me/password')
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

  @Patch(':id/role')
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return firstValueFrom(
      this.identityClient.send('user.updateRole', {
        userId: id,
        updateRoleDto,
      }),
    );
  }

  @Get()
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
}
