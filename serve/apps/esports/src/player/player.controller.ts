import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PlayerService } from './player.service';
import { CreatePlayerDto, UpdatePlayerDto } from '../dtos';

@Controller()
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @MessagePattern('players.findAll')
  async findAll(
    @Payload()
    data: {
      page?: number;
      limit?: number;
      gameId?: string;
      teamId?: string;
      isPro?: boolean;
      isActive?: boolean;
      search?: string;
      tier?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    return this.playerService.findAll(
      data.page,
      data.limit,
      data.gameId,
      data.teamId,
      data.isPro,
      data.isActive,
      data.search,
      data.tier,
      data.sortBy,
      data.sortOrder,
    );
  }

  @MessagePattern('players.findBySlug')
  async findBySlug(@Payload() data: { slug: string }) {
    return this.playerService.findBySlug(data.slug);
  }

  @MessagePattern('players.create')
  async create(@Payload() dto: CreatePlayerDto) {
    return this.playerService.create(dto);
  }

  @MessagePattern('players.update')
  async update(@Payload() data: { slug: string; dto: UpdatePlayerDto }) {
    return this.playerService.update(data.slug, data.dto);
  }

  @MessagePattern('players.delete')
  async delete(@Payload() data: { slug: string }) {
    return this.playerService.delete(data.slug);
  }
}
