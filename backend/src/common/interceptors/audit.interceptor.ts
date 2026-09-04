import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

/** HTTP methods that mutate state and must be audited. */
const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Logs IP address and User-Agent for every mutation request
 * (POST, PUT, PATCH, DELETE). The request body is intentionally
 * never logged to avoid persisting passwords or tokens.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method?.toUpperCase();

    if (MUTATION_METHODS.has(method)) {
      const ip =
        (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
        request.socket?.remoteAddress ??
        'unknown';

      const userAgent = request.headers['user-agent'] ?? 'unknown';

      this.logger.log(
        `[AUDIT] ${method} ${request.url} | IP: ${ip} | User-Agent: ${userAgent}`,
      );
    }

    return next.handle();
  }
}
