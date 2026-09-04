import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { NotificationException } from '../domain/notification/notification.exception';

@Catch(NotificationException)
export class NotificationExceptionFilter implements ExceptionFilter {
  catch(exception: NotificationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      message: 'Falha na validação',
      errors: exception.errors,
      timestamp: new Date().toISOString(),
    });
  }
}
