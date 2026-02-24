import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/common';
import { Prisma, TeamHistoryEventType } from '@app/common/../generated/prisma/client';
import type { Team } from '@app/common';
import { CreateTeamDto, UpdateTeamDto } from '../dtos';

const ORG_SELECT = { id: true, name: true, logo: true };
const REGION_SELECT = { id: true, name: true, code: true, logo: true };

const ALLOWED_SORT = ['name', 'createdAt'] as const;
type TeamSortField = (typeof ALLOWED_SORT)[number];

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page = 1,
    limit = 20,
    organizationId?: string,
    regionId?: string,
    search?: string,
    sortBy = 'name',
    sortOrder: 'asc' | 'desc' = 'asc',
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.TeamWhereInput = {};

    if (organizationId) where.organizationId = organizationId;
    if (regionId) where.regionId = regionId;
    if (search?.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { tag: { contains: search.trim(), mode: 'insensitive' } },
        { slug: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const sortField: TeamSortField = ALLOWED_SORT.includes(sortBy as TeamSortField)
      ? (sortBy as TeamSortField)
      : 'name';
    const order = sortOrder === 'asc' ? 'asc' : 'desc';
    const orderBy: Prisma.TeamOrderByWithRelationInput[] = [{ [sortField]: order }];
    if (sortField !== 'name') orderBy.push({ name: 'asc' });

    const [data, total] = await this.prisma.$transaction([
      this.prisma.team.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          organization: { select: ORG_SELECT },
          region: { select: REGION_SELECT },
          _count: { select: { members: true } },
        },
      }),
      this.prisma.team.count({ where }),
    ]);
    return this.paginate(data, total, page, limit);
  }

  async findById(id: string): Promise<Team | null> {
    return this.prisma.team.findUnique({
      where: { id },
      include: {
        organization: { select: ORG_SELECT },
        region: { select: REGION_SELECT },
        members: {
          include: { player: true },
        },
      },
    });
  }

  async create(dto: CreateTeamDto): Promise<Team> {
    const { organizationId, regionId, mediaLinks, ...rest } = dto;
    const slug =
      rest.slug ??
      rest.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    return this.prisma.team.create({
      data: {
        ...rest,
        slug,
        mediaLinks: mediaLinks ?? [],
        ...(organizationId && { organization: { connect: { id: organizationId } } }),
        ...(regionId && { region: { connect: { id: regionId } } }),
      },
      include: {
        organization: { select: ORG_SELECT },
        region: { select: REGION_SELECT },
      },
    });
  }

  async update(id: string, dto: UpdateTeamDto): Promise<Team> {
    const current = await this.prisma.team.findUnique({ where: { id } });
    const { organizationId, regionId, mediaLinks, ...rest } = dto;

    const historyOps: Prisma.PrismaPromise<any>[] = [];

    if (rest.name !== undefined && current && rest.name !== current.name) {
      historyOps.push(
        this.prisma.teamHistory.create({
          data: {
            teamId: id,
            eventType: TeamHistoryEventType.NAME_CHANGE,
            metadata: { oldName: current.name, newName: rest.name } as any,
            happenedAt: new Date(),
          },
        }),
      );
    }

    if (rest.logo !== undefined && current && rest.logo !== current.logo) {
      historyOps.push(
        this.prisma.teamHistory.create({
          data: {
            teamId: id,
            eventType: TeamHistoryEventType.LOGO_CHANGE,
            metadata: { oldLogo: current.logo ?? null, newLogo: rest.logo } as any,
            happenedAt: new Date(),
          },
        }),
      );
    }

    if (organizationId !== undefined && current && organizationId !== current.organizationId) {
      historyOps.push(
        this.prisma.teamHistory.create({
          data: {
            teamId: id,
            eventType: TeamHistoryEventType.ORG_CHANGE,
            metadata: {
              oldOrgId: current.organizationId ?? null,
              newOrgId: organizationId ?? null,
            } as any,
            happenedAt: new Date(),
          },
        }),
      );
    }

    const updateOp = this.prisma.team.update({
      where: { id },
      data: {
        ...rest,
        ...(mediaLinks !== undefined && { mediaLinks }),
        ...(organizationId !== undefined && {
          organization: organizationId ? { connect: { id: organizationId } } : { disconnect: true },
        }),
        ...(regionId !== undefined && {
          region: regionId ? { connect: { id: regionId } } : { disconnect: true },
        }),
      },
      include: {
        organization: { select: ORG_SELECT },
        region: { select: REGION_SELECT },
      },
    });

    if (historyOps.length > 0) {
      const results = await this.prisma.$transaction([updateOp, ...historyOps]);
      return results[0] as Team;
    }
    return updateOp;
  }

  async delete(id: string): Promise<Team> {
    return this.prisma.team.delete({ where: { id } });
  }

  private paginate<T>(data: T[], total: number, page: number, limit: number) {
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
