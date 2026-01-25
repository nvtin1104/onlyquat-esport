import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EsportsService } from './esports.service';
import { CreateTournamentDto } from '@app/common';

@Controller()
export class EsportsController {
  constructor(private readonly esportsService: EsportsService) {}

  @MessagePattern('tournaments.findAll')
  async findAll() {
    return this.esportsService.findAll();
  }

  @MessagePattern('tournaments.create')
  async create(@Payload() data: CreateTournamentDto) {
    return this.esportsService.create(data);
  }

  @MessagePattern('tournaments.findById')
  async findById(@Payload() tournamentId: string) {
    return this.esportsService.findById(tournamentId);
  }

  @MessagePattern('matches.findByTournament')
  async findMatchesByTournament(@Payload() tournamentId: string) {
    return this.esportsService.findMatchesByTournament(tournamentId);
  }
}
