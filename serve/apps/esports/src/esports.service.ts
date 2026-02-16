import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/common';
import { CreateTournamentDto } from './dtos';
import type { Tournament } from '@app/common';

@Injectable()
export class EsportsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Tournament[]> {
    return this.prisma.tournament.findMany({
      include: { game: true, organizer: true },
    });
  }

  async findById(tournamentId: string): Promise<Tournament | null> {
    return this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { game: true, organizer: true },
    });
  }

  async create(createTournamentDto: CreateTournamentDto): Promise<Tournament> {
    const slug =
      createTournamentDto.slug ??
      createTournamentDto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    return this.prisma.tournament.create({
      data: {
        name: createTournamentDto.name,
        slug,
        description: createTournamentDto.description,
        startDate: new Date(createTournamentDto.startDate),
        endDate: new Date(createTournamentDto.endDate),
        status: createTournamentDto.status as any,
        prizePool: createTournamentDto.prizePool,
        rules: createTournamentDto.rules,
        game: { connect: { id: createTournamentDto.gameId } },
        organizer: { connect: { id: createTournamentDto.organizerId } },
      },
    });
  }

  async findMatchesByTournament(tournamentId: string) {
    return this.prisma.match.findMany({
      where: { tournamentId },
      include: {
        team1: true,
        team2: true,
        winner: true,
        referee: true,
      },
    });
  }

  async findTournamentWithOrganizer(tournamentId: string) {
    return this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        organizer: true,
        tournamentTeams: {
          include: { team: true },
        },
      },
    });
  }
}
