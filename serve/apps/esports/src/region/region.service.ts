import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/common';
import type { Region } from '@app/common';
import { CreateRegionDto, UpdateRegionDto } from '../dtos';

@Injectable()
export class RegionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.region.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.region.count(),
    ]);
    return this.paginate(data, total, page, limit);
  }

  async findById(id: string): Promise<Region | null> {
    return this.prisma.region.findUnique({
      where: { id },
      include: { organizations: true },
    });
  }

  async create(dto: CreateRegionDto): Promise<Region> {
    return this.prisma.region.create({ data: dto });
  }

  async update(id: string, dto: UpdateRegionDto): Promise<Region> {
    return this.prisma.region.update({ where: { id }, data: dto });
  }

  async delete(id: string): Promise<Region> {
    return this.prisma.region.delete({ where: { id } });
  }

  private paginate<T>(data: T[], total: number, page: number, limit: number) {
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
