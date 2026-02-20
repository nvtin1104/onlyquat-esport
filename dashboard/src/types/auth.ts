export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name: string | null;
  roles: string[];
  status: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
}
