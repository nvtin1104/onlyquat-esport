import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IdentityService } from './identity.service';
import { CreateUserDto } from '@app/common';

@Controller()
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @MessagePattern('auth.register')
  async register(@Payload() data: CreateUserDto) {
    return this.identityService.register(data);
  }

  @MessagePattern('auth.login')
  async login(@Payload() data: { email: string; password: string }) {
    return this.identityService.login(data.email, data.password);
  }

  @MessagePattern('user.findById')
  async findById(@Payload() userId: string) {
    return this.identityService.findById(userId);
  }

  @MessagePattern('user.findByEmail')
  async findByEmail(@Payload() email: string) {
    return this.identityService.findByEmail(email);
  }
}
