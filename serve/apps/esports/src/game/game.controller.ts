import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GameService } from './game.service';
import { CreateGameDto, UpdateGameDto } from '../dtos';

@Controller()
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @MessagePattern('games.findAll')
  async findAll(
    @Payload()
    data: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    return this.gameService.findAll(data.page, data.limit, data.search, data.sortBy, data.sortOrder);
  }

  @MessagePattern('games.findById')
  async findById(@Payload() data: { id: string }) {
    return this.gameService.findById(data.id);
  }

  @MessagePattern('games.create')
  async create(@Payload() dto: CreateGameDto) {
    return this.gameService.create(dto);
  }

  @MessagePattern('games.update')
  async update(@Payload() data: { id: string; dto: UpdateGameDto }) {
    return this.gameService.update(data.id, data.dto);
  }

  @MessagePattern('games.delete')
  async delete(@Payload() data: { id: string }) {
    return this.gameService.delete(data.id);
  }
}
