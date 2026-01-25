import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    @Inject('IDENTITY_SERVICE') private identityClient: ClientProxy,
    @Inject('ESPORTS_SERVICE') private esportsClient: ClientProxy,
  ) {}

  @Get('health')
  health() {
    return { status: 'ok', service: 'api-gateway' };
  }

  @Post('auth/register')
  async register(@Body() data: any) {
    return firstValueFrom(this.identityClient.send('auth.register', data));
  }

  @Post('auth/login')
  async login(@Body() data: any) {
    return firstValueFrom(this.identityClient.send('auth.login', data));
  }

  @Get('tournaments')
  async getTournaments() {
    return firstValueFrom(this.esportsClient.send('tournaments.findAll', {}));
  }

  @Post('tournaments')
  async createTournament(@Body() data: any) {
    return firstValueFrom(this.esportsClient.send('tournaments.create', data));
  }
}
