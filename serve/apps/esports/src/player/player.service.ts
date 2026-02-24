import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/common';
import { Prisma } from '@app/common/../generated/prisma/client';
import { CreatePlayerDto, UpdatePlayerDto } from '../dtos';

const GAME_SELECT = { id: true, name: true, shortName: true, logo: true };
const TEAM_SELECT = { id: true, name: true, slug: true, logo: true };

const ALLOWED_SORT = ['displayName', 'rating', 'totalRatings', 'rank', 'createdAt'] as const;
type PlayerSortField = (typeof ALLOWED_SORT)[number];

@Injectable()
export class PlayerService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page = 1,
    limit = 20,
    gameId?: string,
    teamId?: string,
    isPro?: boolean,
    isActive?: boolean,
    search?: string,
    tier?: string,
    sortBy = 'rating',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.PlayerWhereInput = {};

    if (gameId) where.gameId = gameId;
    if (teamId) where.teamId = teamId;
    if (isPro !== undefined) where.isPro = isPro;
    if (isActive !== undefined) where.isActive = isActive;
    if (tier) where.tier = tier as any;
    if (search?.trim()) {
      where.OR = [
        { displayName: { contains: search.trim(), mode: 'insensitive' } },
        { realName: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const sortField: PlayerSortField = ALLOWED_SORT.includes(sortBy as PlayerSortField)
      ? (sortBy as PlayerSortField)
      : 'rating';
    const order = sortOrder === 'asc' ? 'asc' : 'desc';
    const orderBy: Prisma.PlayerOrderByWithRelationInput[] = [{ [sortField]: order }];
    if (sortField !== 'displayName') orderBy.push({ displayName: 'asc' });

    const [data, total] = await this.prisma.$transaction([
      this.prisma.player.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          game: { select: GAME_SELECT },
          team: { select: TEAM_SELECT },
        },
      }),
      this.prisma.player.count({ where }),
    ]);
    return this.paginate(data, total, page, limit);
  }

  async findBySlug(slug: string) {
    const player = await this.prisma.player.findUnique({
      where: { slug },
      include: {
        game: { select: GAME_SELECT },
        team: { select: TEAM_SELECT },
        ratings: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { user: { select: { id: true, username: true, avatar: true } } },
        },
      },
    });
    if (!player) throw new NotFoundException('errors.PLAYER_NOT_FOUND');
    return player;
  }

  async create(dto: CreatePlayerDto) {
    const { gameId, teamId, userId, stats, ...rest } = dto;
    const slug =
      rest.slug ??
      rest.displayName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    return this.prisma.player.create({
      data: {
        ...rest,
        slug,
        stats: (stats ?? {}) as Prisma.InputJsonValue,
        game: { connect: { id: gameId } },
        ...(teamId && { team: { connect: { id: teamId } } }),
        ...(userId && { user: { connect: { id: userId } } }),
      },
      include: {
        game: { select: GAME_SELECT },
        team: { select: TEAM_SELECT },
      },
    });
  }

  async update(slug: string, dto: UpdatePlayerDto) {
    const player = await this.prisma.player.findUnique({ where: { slug } });
    if (!player) throw new NotFoundException('errors.PLAYER_NOT_FOUND');

    const { gameId, teamId, userId, stats, ...rest } = dto;
    return this.prisma.player.update({
      where: { slug },
      data: {
        ...rest,
        ...(stats !== undefined && { stats: stats as Prisma.InputJsonValue }),
        ...(gameId !== undefined && { game: { connect: { id: gameId } } }),
        ...(teamId !== undefined && {
          team: teamId ? { connect: { id: teamId } } : { disconnect: true },
        }),
        ...(userId !== undefined && {
          user: userId ? { connect: { id: userId } } : { disconnect: true },
        }),
      },
      include: {
        game: { select: GAME_SELECT },
        team: { select: TEAM_SELECT },
      },
    });
  }

  async delete(slug: string) {
    const player = await this.prisma.player.findUnique({ where: { slug } });
    if (!player) throw new NotFoundException('errors.PLAYER_NOT_FOUND');
    return this.prisma.player.delete({ where: { slug } });
  }

  private paginate<T>(data: T[], total: number, page: number, limit: number) {
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
