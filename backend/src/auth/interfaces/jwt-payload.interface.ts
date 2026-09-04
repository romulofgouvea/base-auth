export interface JwtPayload {
  /** Subject — authenticated user's UUID */
  sub: string;
  /** List of role names for the user */
  roles: string[];
  /** List of permission keys (resource:action format) */
  permissions: string[];
  /** Issued at (added automatically by JwtModule) */
  iat?: number;
  /** Expiration (added automatically by JwtModule) */
  exp?: number;
  /** Session id, matched against the raw refresh token */
  sessionId?: string;
}
