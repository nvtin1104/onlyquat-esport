import type { OrganizationType } from '@app/common';

export class CreateOrganizationDto {
  name: string;
  shortName?: string;
  logo?: string;
  website?: string;
  description?: string;
  mediaLinks?: Array<{ url: string; description?: string; regionId?: string }>;
  roles: OrganizationType[];
  ownerId: string;
  managerId?: string;
  regionId?: string;
}
