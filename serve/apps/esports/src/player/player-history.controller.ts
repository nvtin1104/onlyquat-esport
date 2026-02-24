import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PlayerHistoryService } from './player-history.service';
import { CreatePlayerHistoryDto } from '../dtos';

@Controller()
export class PlayerHistoryController {
  constructor(private readonly playerHistoryService: PlayerHistoryService) {}

  @MessagePattern('players.history.findBySlug')
  async findBySlug(
    @Payload() data: { slug: string; page?: number; limit?: number },
  ) {
    return this.playerHistoryService.findBySlug(data.slug, data.page, data.limit);
  }

  @MessagePattern('players.history.create')
  async create(@Payload() dto: CreatePlayerHistoryDto) {
    return this.playerHistoryService.create(dto);
  }

  @MessagePattern('players.history.createBySlug')
  async createBySlug(
    @Payload() data: { slug: string } & Omit<CreatePlayerHistoryDto, 'playerId'>,
  ) {
    const { slug, ...dto } = data;
    return this.playerHistoryService.createBySlug(slug, dto);
  }

  @MessagePattern('players.history.delete')
  async delete(@Payload() data: { id: string }) {
    return this.playerHistoryService.delete(data.id);
  }
}
