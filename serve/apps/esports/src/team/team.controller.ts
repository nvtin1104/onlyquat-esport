import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TeamService } from './team.service';
import { CreateTeamDto, UpdateTeamDto } from '../dtos';

@Controller()
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @MessagePattern('teams.findAll')
  async findAll(
    @Payload()
    data: {
      page?: number;
      limit?: number;
      organizationId?: string;
      regionId?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    return this.teamService.findAll(
      data.page,
      data.limit,
      data.organizationId,
      data.regionId,
      data.search,
      data.sortBy,
      data.sortOrder,
    );
  }

  @MessagePattern('teams.findById')
  async findById(@Payload() data: { id: string }) {
    return this.teamService.findById(data.id);
  }

  @MessagePattern('teams.create')
  async create(@Payload() dto: CreateTeamDto) {
    return this.teamService.create(dto);
  }

  @MessagePattern('teams.update')
  async update(@Payload() data: { id: string; dto: UpdateTeamDto }) {
    return this.teamService.update(data.id, data.dto);
  }

  @MessagePattern('teams.delete')
  async delete(@Payload() data: { id: string }) {
    return this.teamService.delete(data.id);
  }
}
