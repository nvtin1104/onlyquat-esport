import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegionService } from './region.service';
import { CreateRegionDto, UpdateRegionDto } from '../dtos';

@Controller()
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @MessagePattern('regions.findAll')
  async findAll(@Payload() data: { page?: number; limit?: number }) {
    return this.regionService.findAll(data.page, data.limit);
  }

  @MessagePattern('regions.findById')
  async findById(@Payload() data: { id: string }) {
    return this.regionService.findById(data.id);
  }

  @MessagePattern('regions.create')
  async create(@Payload() dto: CreateRegionDto) {
    return this.regionService.create(dto);
  }

  @MessagePattern('regions.update')
  async update(@Payload() data: { id: string; dto: UpdateRegionDto }) {
    return this.regionService.update(data.id, data.dto);
  }

  @MessagePattern('regions.delete')
  async delete(@Payload() data: { id: string }) {
    return this.regionService.delete(data.id);
  }
}
