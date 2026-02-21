import { Controller, Get, Post, Patch, Delete, Body, Param, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Auth } from './decorators/auth.decorator';
import { PERMISSIONS } from '@app/common';

@Controller()
export class AppController {
  constructor(
    @Inject('ESPORTS_SERVICE') private esportsClient: ClientProxy,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  health() {
    return { status: 'ok', service: 'api-gateway' };
  }

  // ─── Tournaments ─────────────────────────────────────────────────────────

  @ApiTags('Tournaments')
  @Get('tournaments')
  @ApiOperation({ summary: 'List all tournaments — public' })
  async getTournaments() {
    return firstValueFrom(this.esportsClient.send('tournaments.findAll', {}));
  }

  @ApiTags('Tournaments')
  @Post('tournaments')
  @Auth(PERMISSIONS.TOURNAMENT_CREATE)
  @ApiOperation({ summary: 'Create tournament — requires tournament:create' })
  async createTournament(@Body() data: any) {
    return firstValueFrom(this.esportsClient.send('tournaments.create', data));
  }

  @ApiTags('Tournaments')
  @Patch('tournaments/:id')
  @Auth(PERMISSIONS.TOURNAMENT_UPDATE)
  @ApiOperation({ summary: 'Update tournament — requires tournament:update' })
  async updateTournament(@Param('id') id: string, @Body() data: any) {
    return firstValueFrom(this.esportsClient.send('tournaments.update', { id, ...data }));
  }

  @ApiTags('Tournaments')
  @Delete('tournaments/:id')
  @Auth(PERMISSIONS.TOURNAMENT_DELETE)
  @ApiOperation({ summary: 'Delete tournament — requires tournament:delete' })
  async deleteTournament(@Param('id') id: string) {
    return firstValueFrom(this.esportsClient.send('tournaments.delete', { id }));
  }

  // ─── Matches ─────────────────────────────────────────────────────────────

  @ApiTags('Matches')
  @Get('matches')
  @ApiOperation({ summary: 'List all matches — public' })
  async getMatches() {
    return firstValueFrom(this.esportsClient.send('matches.findAll', {}));
  }

  @ApiTags('Matches')
  @Post('matches')
  @Auth(PERMISSIONS.MATCH_CREATE)
  @ApiOperation({ summary: 'Create match — requires match:create' })
  async createMatch(@Body() data: any) {
    return firstValueFrom(this.esportsClient.send('matches.create', data));
  }

  @ApiTags('Matches')
  @Patch('matches/:id/result')
  @Auth(PERMISSIONS.MATCH_UPDATE)
  @ApiOperation({ summary: 'Update match result — requires match:update' })
  async updateMatchResult(@Param('id') id: string, @Body() data: any) {
    return firstValueFrom(this.esportsClient.send('matches.updateResult', { id, ...data }));
  }

  // ─── Players ─────────────────────────────────────────────────────────────

  @ApiTags('Players')
  @Get('players')
  @ApiOperation({ summary: 'List all players — public' })
  async getPlayers() {
    return firstValueFrom(this.esportsClient.send('players.findAll', {}));
  }

  @ApiTags('Players')
  @Post('players')
  @Auth(PERMISSIONS.PLAYER_CREATE)
  @ApiOperation({ summary: 'Create player — requires player:create' })
  async createPlayer(@Body() data: any) {
    return firstValueFrom(this.esportsClient.send('players.create', data));
  }

  @ApiTags('Players')
  @Patch('players/:slug')
  @Auth(PERMISSIONS.PLAYER_UPDATE)
  @ApiOperation({ summary: 'Update player — requires player:update' })
  async updatePlayer(@Param('slug') slug: string, @Body() data: any) {
    return firstValueFrom(this.esportsClient.send('players.update', { slug, ...data }));
  }

  // ─── Teams ───────────────────────────────────────────────────────────────

  @ApiTags('Teams')
  @Get('teams')
  @ApiOperation({ summary: 'List all teams — public' })
  async getTeams() {
    return firstValueFrom(this.esportsClient.send('teams.findAll', {}));
  }

  // ─── Ratings ─────────────────────────────────────────────────────────────

  @ApiTags('Ratings')
  @Post('ratings/:playerSlug')
  @Auth(PERMISSIONS.RATING_CREATE)
  @ApiOperation({ summary: 'Submit rating — requires rating:create' })
  async createRating(@Param('playerSlug') playerSlug: string, @Body() data: any) {
    return firstValueFrom(this.esportsClient.send('ratings.create', { playerSlug, ...data }));
  }
}
