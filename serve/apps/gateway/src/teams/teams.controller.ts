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

@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  constructor(
    @Inject('ESPORTS_SERVICE') private readonly esportsClient: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all teams — public' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('organizationId') organizationId?: string,
    @Query('regionId') regionId?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return firstValueFrom(
      this.esportsClient.send('teams.findAll', {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        search: search || undefined,
        organizationId: organizationId || undefined,
        regionId: regionId || undefined,
        sortBy: sortBy || undefined,
        sortOrder: (sortOrder === 'asc' || sortOrder === 'desc') ? sortOrder : undefined,
      }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get team by ID — public' })
  async findById(@Param('id') id: string) {
    return firstValueFrom(this.esportsClient.send('teams.findById', { id }));
  }

  @Post()
  @Auth(PERMISSIONS.TEAM_CREATE)
  @ApiOperation({ summary: 'Create team — requires team:create' })
  async create(@Body() dto: any) {
    return firstValueFrom(this.esportsClient.send('teams.create', dto));
  }

  @Patch(':id')
  @Auth(PERMISSIONS.TEAM_UPDATE)
  @ApiOperation({ summary: 'Update team — requires team:update' })
  async update(@Param('id') id: string, @Body() dto: any) {
    return firstValueFrom(this.esportsClient.send('teams.update', { id, dto }));
  }

  @Delete(':id')
  @Auth(PERMISSIONS.TEAM_DELETE)
  @ApiOperation({ summary: 'Delete team — requires team:delete' })
  async delete(@Param('id') id: string) {
    return firstValueFrom(this.esportsClient.send('teams.delete', { id }));
  }
}
