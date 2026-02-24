export class CreateGameDto {
  name: string;
  shortName: string;
  logo?: string;
  website?: string;
  mediaLinks?: Array<{ url: string; label?: string }>;
  roles?: string[];
  organizationId?: string;
}
