import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global filter that intercepts every HttpException and standardizes
 * the error response shape to { statusCode, message, timestamp }.
 * Registered globally in main.ts via app.useGlobalFilters().
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception.getResponse();

    let message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : ((exceptionResponse as Record<string, unknown>).message ??
          exception.message);

    if (statusCode === HttpStatus.TOO_MANY_REQUESTS) {
      message =
        'Muitas tentativas de acesso. Por favor, aguarde alguns minutos antes de tentar novamente.';
    } else if (
      statusCode === HttpStatus.UNAUTHORIZED &&
      message === 'Unauthorized'
    ) {
      message = 'Não autorizado. Faça login para continuar.';
    } else if (
      statusCode === HttpStatus.FORBIDDEN &&
      message === 'Forbidden resource'
    ) {
      message =
        'Acesso negado. Você não tem permissão para acessar este recurso.';
    }

    const errorBody = {
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.error(
      `[${request.method}] ${request.url} → ${statusCode}`,
      JSON.stringify({ message }),
    );

    response.status(statusCode).json(errorBody);
  }
}
