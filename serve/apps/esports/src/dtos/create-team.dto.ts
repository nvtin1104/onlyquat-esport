export class CreateTeamDto {
  name: string;
  slug?: string;
  tag?: string;
  logo?: string;
  website?: string;
  mediaLinks?: Array<{ url: string; label?: string }>;
  description?: string;
  organizationId?: string;
  regionId?: string;
}
