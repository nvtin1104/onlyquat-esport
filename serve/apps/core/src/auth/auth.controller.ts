import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from '../dtos';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register')
  async register(@Payload() data: CreateUserDto) {
    return this.authService.register(data);
  }

  @MessagePattern('auth.login')
  async login(@Payload() data: LoginDto) {
    return this.authService.login(data);
  }

  @MessagePattern('auth.adminLogin')
  async adminLogin(@Payload() data: LoginDto) {
    return this.authService.adminLogin(data);
  }

  @MessagePattern('auth.refresh')
  async refresh(@Payload() data: { refreshToken: string }) {
    return this.authService.refresh(data.refreshToken);
  }

  @MessagePattern('auth.validate-token')
  async validateToken(@Payload() data: { token: string }) {
    return this.authService.validateToken(data.token);
  }
}
