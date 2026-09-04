import { Module } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { ParseUuidPipe } from './pipes/parse-uuid.pipe';

/**
 * Centralizes shared infrastructure providers (filter, interceptor, pipe)
 * and exports them so any feature module that imports CommonModule can
 * inject or apply them without re-declaring the providers.
 */
@Module({
  providers: [HttpExceptionFilter, AuditInterceptor, ParseUuidPipe],
  exports: [HttpExceptionFilter, AuditInterceptor, ParseUuidPipe],
})
export class CommonModule {}
