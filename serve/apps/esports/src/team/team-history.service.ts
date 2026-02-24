import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/common';
import { TeamHistoryEventType } from '@app/common/../generated/prisma/client';
import { CreateTeamHistoryDto } from '../dtos';

@Injectable()
export class TeamHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findByTeamId(teamId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.teamHistory.findMany({
        where: { teamId },
        skip,
        take: limit,
        orderBy: { happenedAt: 'desc' },
        include: {
          player: { select: { id: true, slug: true, displayName: true, imageUrl: true } },
        },
      }),
      this.prisma.teamHistory.count({ where: { teamId } }),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(dto: CreateTeamHistoryDto) {
    const { teamId, playerId, happenedAt, metadata, ...rest } = dto;
    return this.prisma.teamHistory.create({
      data: {
        ...rest,
        metadata: (metadata ?? {}) as any,
        happenedAt: happenedAt ? new Date(happenedAt) : new Date(),
        team: { connect: { id: teamId } },
        ...(playerId && { player: { connect: { id: playerId } } }),
      },
      include: {
        player: { select: { id: true, slug: true, displayName: true, imageUrl: true } },
      },
    });
  }

  async delete(id: string) {
    const record = await this.prisma.teamHistory.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('errors.TEAM_HISTORY_NOT_FOUND');
    return this.prisma.teamHistory.delete({ where: { id } });
  }

  // Internal helper — used by TeamService when auto-recording changes
  async record(
    teamId: string,
    eventType: TeamHistoryEventType,
    metadata: Record<string, any>,
    playerId?: string,
  ) {
    return this.prisma.teamHistory.create({
      data: {
        teamId,
        eventType,
        metadata: metadata as any,
        happenedAt: new Date(),
        ...(playerId && { playerId }),
      },
    });
  }
}
