import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateUserDto, LoginDto } from '../dtos';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('IDENTITY_SERVICE') private readonly identityClient: ClientProxy,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return firstValueFrom(
      this.identityClient.send('auth.register', createUserDto),
    );
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return firstValueFrom(this.identityClient.send('auth.login', loginDto));
  }

  @Post('refresh')
  async refresh(@Body() data: { refreshToken: string }) {
    return firstValueFrom(this.identityClient.send('auth.refresh', data));
  }
}
