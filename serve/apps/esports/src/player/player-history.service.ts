import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/common';
import { PlayerHistoryEventType } from '@app/common/../generated/prisma/client';
import { CreatePlayerHistoryDto } from '../dtos';

@Injectable()
export class PlayerHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findByPlayerId(playerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.playerHistory.findMany({
        where: { playerId },
        skip,
        take: limit,
        orderBy: { happenedAt: 'desc' },
        include: {
          team: { select: { id: true, slug: true, name: true, logo: true } },
        },
      }),
      this.prisma.playerHistory.count({ where: { playerId } }),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findBySlug(slug: string, page = 1, limit = 20) {
    const player = await this.prisma.player.findUnique({ where: { slug }, select: { id: true } });
    if (!player) throw new NotFoundException('errors.PLAYER_NOT_FOUND');
    return this.findByPlayerId(player.id, page, limit);
  }

  async create(dto: CreatePlayerHistoryDto) {
    const { playerId, teamId, happenedAt, metadata, ...rest } = dto;
    return this.prisma.playerHistory.create({
      data: {
        ...rest,
        metadata: (metadata ?? {}) as any,
        happenedAt: happenedAt ? new Date(happenedAt) : new Date(),
        player: { connect: { id: playerId } },
        ...(teamId && { team: { connect: { id: teamId } } }),
      },
      include: {
        team: { select: { id: true, slug: true, name: true, logo: true } },
      },
    });
  }

  async createBySlug(slug: string, dto: Omit<CreatePlayerHistoryDto, 'playerId'>) {
    const player = await this.prisma.player.findUnique({ where: { slug }, select: { id: true } });
    if (!player) throw new NotFoundException('errors.PLAYER_NOT_FOUND');
    return this.create({ ...dto, playerId: player.id });
  }

  async delete(id: string) {
    const record = await this.prisma.playerHistory.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('errors.PLAYER_HISTORY_NOT_FOUND');
    return this.prisma.playerHistory.delete({ where: { id } });
  }

  // Internal helper — used by PlayerService when auto-recording changes
  async record(
    playerId: string,
    eventType: PlayerHistoryEventType,
    metadata: Record<string, any>,
    teamId?: string,
  ) {
    return this.prisma.playerHistory.create({
      data: {
        playerId,
        eventType,
        metadata: metadata as any,
        happenedAt: new Date(),
        ...(teamId && { teamId }),
      },
    });
  }
}
