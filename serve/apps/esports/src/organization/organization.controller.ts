import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { OrganizationType } from '@app/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../dtos';

@Controller()
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @MessagePattern('organizations.findAll')
  async findAll(
    @Payload()
    data: { page?: number; limit?: number; role?: OrganizationType; regionId?: string },
  ) {
    return this.organizationService.findAll(data.page, data.limit, data.role, data.regionId);
  }

  @MessagePattern('organizations.findById')
  async findById(@Payload() data: { id: string }) {
    return this.organizationService.findById(data.id);
  }

  @MessagePattern('organizations.create')
  async create(@Payload() dto: CreateOrganizationDto) {
    return this.organizationService.create(dto);
  }

  @MessagePattern('organizations.update')
  async update(@Payload() data: { id: string; dto: UpdateOrganizationDto }) {
    return this.organizationService.update(data.id, data.dto);
  }

  @MessagePattern('organizations.delete')
  async delete(@Payload() data: { id: string }) {
    return this.organizationService.delete(data.id);
  }
}
