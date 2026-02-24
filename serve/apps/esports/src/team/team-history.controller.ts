import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TeamHistoryService } from './team-history.service';
import { CreateTeamHistoryDto } from '../dtos';

@Controller()
export class TeamHistoryController {
  constructor(private readonly teamHistoryService: TeamHistoryService) {}

  @MessagePattern('teams.history.findByTeamId')
  async findByTeamId(
    @Payload() data: { teamId: string; page?: number; limit?: number },
  ) {
    return this.teamHistoryService.findByTeamId(data.teamId, data.page, data.limit);
  }

  @MessagePattern('teams.history.create')
  async create(@Payload() dto: CreateTeamHistoryDto) {
    return this.teamHistoryService.create(dto);
  }

  @MessagePattern('teams.history.delete')
  async delete(@Payload() data: { id: string }) {
    return this.teamHistoryService.delete(data.id);
  }
}
