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

@ApiTags('Regions')
@Controller('regions')
export class RegionsController {
  constructor(
    @Inject('ESPORTS_SERVICE') private readonly esportsClient: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all regions' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return firstValueFrom(
      this.esportsClient.send('regions.findAll', {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get region by ID' })
  async findById(@Param('id') id: string) {
    return firstValueFrom(this.esportsClient.send('regions.findById', { id }));
  }

  @Post()
  @Auth(PERMISSIONS.REGION_CREATE)
  @ApiOperation({ summary: 'Create region — requires region:create' })
  async create(@Body() dto: any) {
    return firstValueFrom(this.esportsClient.send('regions.create', dto));
  }

  @Patch(':id')
  @Auth(PERMISSIONS.REGION_UPDATE)
  @ApiOperation({ summary: 'Update region — requires region:update' })
  async update(@Param('id') id: string, @Body() dto: any) {
    return firstValueFrom(this.esportsClient.send('regions.update', { id, dto }));
  }

  @Delete(':id')
  @Auth(PERMISSIONS.REGION_DELETE)
  @ApiOperation({ summary: 'Delete region — requires region:delete' })
  async delete(@Param('id') id: string) {
    return firstValueFrom(this.esportsClient.send('regions.delete', { id }));
  }
}
