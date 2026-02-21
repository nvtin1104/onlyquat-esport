import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/common';
import type { Organization, OrganizationType } from '@app/common';
import { Prisma } from '@app/common/../generated/prisma/client';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../dtos';

const OWNER_SELECT = { id: true, username: true, avatar: true };

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, role?: OrganizationType, regionId?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.OrganizationWhereInput = {};
    if (role) where.roles = { hasSome: [role] };
    if (regionId) where.regionId = regionId;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          region: true,
          owner: { select: OWNER_SELECT },
          manager: { select: OWNER_SELECT },
        },
      }),
      this.prisma.organization.count({ where }),
    ]);
    return this.paginate(data, total, page, limit);
  }

  async findById(id: string): Promise<Organization | null> {
    return this.prisma.organization.findUnique({
      where: { id },
      include: {
        region: true,
        owner: { select: OWNER_SELECT },
        manager: { select: OWNER_SELECT },
        teams: true,
        tournaments: true,
      },
    });
  }

  async create(dto: CreateOrganizationDto): Promise<Organization> {
    const { ownerId, managerId, regionId, mediaLinks, roles, ...rest } = dto;
    return this.prisma.organization.create({
      data: {
        ...rest,
        roles,
        mediaLinks: mediaLinks ?? [],
        owner: { connect: { id: ownerId } },
        ...(managerId && { manager: { connect: { id: managerId } } }),
        ...(regionId && { region: { connect: { id: regionId } } }),
      },
    });
  }

  async update(id: string, dto: UpdateOrganizationDto): Promise<Organization> {
    const { managerId, regionId, mediaLinks, ...rest } = dto;
    return this.prisma.organization.update({
      where: { id },
      data: {
        ...rest,
        ...(mediaLinks !== undefined && { mediaLinks }),
        ...(managerId !== undefined && {
          manager: managerId ? { connect: { id: managerId } } : { disconnect: true },
        }),
        ...(regionId !== undefined && {
          region: regionId ? { connect: { id: regionId } } : { disconnect: true },
        }),
      },
    });
  }

  async delete(id: string): Promise<Organization> {
    return this.prisma.organization.delete({ where: { id } });
  }

  private paginate<T>(data: T[], total: number, page: number, limit: number) {
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
