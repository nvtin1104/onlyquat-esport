import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    @Inject('ESPORTS_SERVICE') private esportsClient: ClientProxy,
  ) {}

  @Get('health')
  health() {
    return { status: 'ok', service: 'api-gateway' };
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
