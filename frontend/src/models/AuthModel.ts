export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthMeResponse {
  id: string;
  roles: string[];
  permissions: string[];
}
