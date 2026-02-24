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

@ApiTags('Games')
@Controller('games')
export class GamesController {
  constructor(
    @Inject('ESPORTS_SERVICE') private readonly esportsClient: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all games — public' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return firstValueFrom(
      this.esportsClient.send('games.findAll', {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        search: search || undefined,
        sortBy: sortBy || undefined,
        sortOrder: (sortOrder === 'asc' || sortOrder === 'desc') ? sortOrder : undefined,
      }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get game by ID — public' })
  async findById(@Param('id') id: string) {
    return firstValueFrom(this.esportsClient.send('games.findById', { id }));
  }

  @Post()
  @Auth(PERMISSIONS.GAME_CREATE)
  @ApiOperation({ summary: 'Create game — requires game:create' })
  async create(@Body() dto: any) {
    return firstValueFrom(this.esportsClient.send('games.create', dto));
  }

  @Patch(':id')
  @Auth(PERMISSIONS.GAME_UPDATE)
  @ApiOperation({ summary: 'Update game — requires game:update' })
  async update(@Param('id') id: string, @Body() dto: any) {
    return firstValueFrom(this.esportsClient.send('games.update', { id, dto }));
  }

  @Delete(':id')
  @Auth(PERMISSIONS.GAME_DELETE)
  @ApiOperation({ summary: 'Delete game — requires game:delete' })
  async delete(@Param('id') id: string) {
    return firstValueFrom(this.esportsClient.send('games.delete', { id }));
  }
}
