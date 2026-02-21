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
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Auth, JwtAuth } from '../decorators/auth.decorator';
import { PERMISSIONS } from '@app/common';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(
    @Inject('ESPORTS_SERVICE') private readonly esportsClient: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List organizations — filterable by role & regionId' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: string,
    @Query('regionId') regionId?: string,
  ) {
    return firstValueFrom(
      this.esportsClient.send('organizations.findAll', {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        role,
        regionId,
      }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  async findById(@Param('id') id: string) {
    return firstValueFrom(this.esportsClient.send('organizations.findById', { id }));
  }

  @Post()
  @JwtAuth()
  @ApiOperation({ summary: 'Create organization (ownerId set from authenticated user)' })
  async create(@Body() dto: any, @Req() req: any) {
    // Always use JWT userId as ownerId — never trust body-supplied value
    const { ownerId: _ignored, ...rest } = dto;
    return firstValueFrom(
      this.esportsClient.send('organizations.create', {
        ...rest,
        ownerId: req.user.userId,
      }),
    );
  }

  @Patch(':id')
  @Auth(PERMISSIONS.ORGANIZATION_UPDATE)
  @ApiOperation({ summary: 'Update organization — requires organization:update' })
  async update(@Param('id') id: string, @Body() dto: any) {
    return firstValueFrom(this.esportsClient.send('organizations.update', { id, dto }));
  }

  @Delete(':id')
  @Auth(PERMISSIONS.ORGANIZATION_DELETE)
  @ApiOperation({ summary: 'Delete organization — requires organization:delete' })
  async delete(@Param('id') id: string) {
    return firstValueFrom(this.esportsClient.send('organizations.delete', { id }));
  }
}
