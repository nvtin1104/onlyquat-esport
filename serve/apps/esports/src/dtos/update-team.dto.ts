export class UpdateTeamDto {
  name?: string;
  slug?: string;
  tag?: string;
  logo?: string;
  website?: string;
  mediaLinks?: Array<{ url: string; label?: string }>;
  description?: string;
  organizationId?: string | null;
  regionId?: string | null;
}
