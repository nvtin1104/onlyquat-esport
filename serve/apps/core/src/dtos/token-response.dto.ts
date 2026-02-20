import { UserRole, UserStatus } from '@app/common';

export class TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    name: string | null;
    roles: UserRole[];
    status: UserStatus;
  };
}
