import type { OrganizationType } from '@app/common';

export class UpdateOrganizationDto {
  name?: string;
  shortName?: string;
  logo?: string;
  website?: string;
  description?: string;
  mediaLinks?: Array<{ url: string; description?: string; regionId?: string }>;
  roles?: OrganizationType[];
  managerId?: string;
  regionId?: string;
  // ownerId intentionally excluded — ownership transfer is a separate concern
}
