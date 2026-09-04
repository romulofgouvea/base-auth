import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Rate-limiting guard for the login endpoint.
 * Tracks attempts per IP + email combination, preventing
 * brute-force attacks targeted at a specific account.
 *
 * ThrottlerModule config (applied in AuthModule):
 *   ttl: 900000 (15 minutes in ms)
 *   limit: 10 attempts
 */
interface LoginRequest {
  ip?: string;
  body?: { email?: string };
}

@Injectable()
export class LoginRateLimitGuard extends ThrottlerGuard {
  protected generateKey(
    context: ExecutionContext,
    _suffix: string,
    _throttlerName: string,
  ): string {
    const request = context.switchToHttp().getRequest<LoginRequest>();
    const ip = request.ip ?? 'unknown';
    const email = request.body?.email ?? 'unknown';

    return `${ip}:${email}`;
  }
}
