import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/common';
import { Prisma } from '@app/common/../generated/prisma/client';
import type { Game } from '@app/common';
import { CreateGameDto, UpdateGameDto } from '../dtos';

const ORG_SELECT = { id: true, name: true, logo: true };

const ALLOWED_SORT = ['name', 'createdAt'] as const;
type GameSortField = (typeof ALLOWED_SORT)[number];

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
    sortBy = 'name',
    sortOrder: 'asc' | 'desc' = 'asc',
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.GameWhereInput = {};

    if (search?.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { shortName: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const sortField: GameSortField = ALLOWED_SORT.includes(sortBy as GameSortField)
      ? (sortBy as GameSortField)
      : 'name';
    const order = sortOrder === 'asc' ? 'asc' : 'desc';
    const orderBy: Prisma.GameOrderByWithRelationInput[] = [{ [sortField]: order }];
    if (sortField !== 'name') orderBy.push({ name: 'asc' });

    const [data, total] = await this.prisma.$transaction([
      this.prisma.game.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { organization: { select: ORG_SELECT } },
      }),
      this.prisma.game.count({ where }),
    ]);
    return this.paginate(data, total, page, limit);
  }

  async findById(id: string): Promise<Game | null> {
    return this.prisma.game.findUnique({
      where: { id },
      include: { organization: { select: ORG_SELECT } },
    });
  }

  async create(dto: CreateGameDto): Promise<Game> {
    const { organizationId, mediaLinks, ...rest } = dto;
    return this.prisma.game.create({
      data: {
        ...rest,
        mediaLinks: mediaLinks ?? [],
        ...(organizationId && { organization: { connect: { id: organizationId } } }),
      },
      include: { organization: { select: ORG_SELECT } },
    });
  }

  async update(id: string, dto: UpdateGameDto): Promise<Game> {
    const { organizationId, mediaLinks, ...rest } = dto;
    return this.prisma.game.update({
      where: { id },
      data: {
        ...rest,
        ...(mediaLinks !== undefined && { mediaLinks }),
        ...(organizationId !== undefined && {
          organization: organizationId ? { connect: { id: organizationId } } : { disconnect: true },
        }),
      },
      include: { organization: { select: ORG_SELECT } },
    });
  }

  async delete(id: string): Promise<Game> {
    return this.prisma.game.delete({ where: { id } });
  }

  private paginate<T>(data: T[], total: number, page: number, limit: number) {
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
