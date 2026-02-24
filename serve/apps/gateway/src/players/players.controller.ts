import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Auth } from '../decorators/auth.decorator';
import { PERMISSIONS } from '@app/common';

@ApiTags('Players')
@Controller('players')
export class PlayersController {
  constructor(
    @Inject('ESPORTS_SERVICE') private readonly esportsClient: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List players — public' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('gameId') gameId?: string,
    @Query('teamId') teamId?: string,
    @Query('tier') tier?: string,
    @Query('isPro') isPro?: string,
    @Query('isActive') isActive?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return firstValueFrom(
      this.esportsClient.send('players.findAll', {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        search: search || undefined,
        gameId: gameId || undefined,
        teamId: teamId || undefined,
        tier: tier || undefined,
        ...(isPro !== undefined && isPro !== '' && { isPro: isPro === 'true' }),
        ...(isActive !== undefined && isActive !== '' && { isActive: isActive === 'true' }),
        sortBy: sortBy || undefined,
        sortOrder: (sortOrder === 'asc' || sortOrder === 'desc') ? sortOrder : undefined,
      }),
    );
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get player by slug — public' })
  async findBySlug(@Param('slug') slug: string) {
    return firstValueFrom(this.esportsClient.send('players.findBySlug', { slug }));
  }

  @Post()
  @Auth(PERMISSIONS.PLAYER_CREATE)
  @ApiOperation({ summary: 'Create player — requires player:create' })
  async create(@Body() dto: any) {
    return firstValueFrom(this.esportsClient.send('players.create', dto));
  }

  @Patch(':slug')
  @Auth(PERMISSIONS.PLAYER_UPDATE)
  @ApiOperation({ summary: 'Update player — requires player:update' })
  async update(@Param('slug') slug: string, @Body() dto: any) {
    return firstValueFrom(this.esportsClient.send('players.update', { slug, dto }));
  }

  @Delete(':slug')
  @Auth(PERMISSIONS.PLAYER_DELETE)
  @ApiOperation({ summary: 'Delete player — requires player:delete' })
  async delete(@Param('slug') slug: string) {
    return firstValueFrom(this.esportsClient.send('players.delete', { slug }));
  }

  @Get(':slug/history')
  @ApiOperation({ summary: 'Get player history — public' })
  async getHistory(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return firstValueFrom(
      this.esportsClient.send('players.history.findBySlug', {
        slug,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      }),
    );
  }

  @Post(':slug/history')
  @Auth(PERMISSIONS.PLAYER_UPDATE)
  @ApiOperation({ summary: 'Add player history record — requires player:update' })
  async addHistory(@Param('slug') slug: string, @Body() dto: any) {
    return firstValueFrom(
      this.esportsClient.send('players.history.createBySlug', { ...dto, slug }),
    );
  }

  @Delete(':slug/history/:historyId')
  @Auth(PERMISSIONS.PLAYER_UPDATE)
  @ApiOperation({ summary: 'Delete player history record — requires player:update' })
  async deleteHistory(@Param('historyId') historyId: string) {
    return firstValueFrom(this.esportsClient.send('players.history.delete', { id: historyId }));
  }
}
