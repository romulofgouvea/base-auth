import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RbacGuard } from './auth/guards/rbac.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { NotificationExceptionFilter } from './common/filters/notification-exception.filter';
import { NotificationException } from './common/domain/notification/notification.exception';
import { Notification } from './common/domain/notification/notification';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'upgrade-insecure-requests': null,
        },
      },
    }),
  );

  const allowedOriginsStr = configService.get<string>('ALLOWED_ORIGINS', '');
  const allowedOriginsArray = allowedOriginsStr
    .split(',')
    .map((o) => o.trim())
    .filter((o) => o.length > 0);

  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOriginsStr === '*' ||
        allowedOriginsArray.includes(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  app.useGlobalGuards(new JwtAuthGuard(reflector), new RbacGuard(reflector));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const constraintTranslations: Record<string, string> = {
          whitelistValidation: 'Campo não é permitido',
          isEmail: 'E-mail inválido',
          isString: 'Deve ser um texto',
          isNotEmpty: 'Campo obrigatório',
          isNumber: 'Deve ser um número',
          isInt: 'Deve ser um número inteiro',
          isBoolean: 'Deve ser verdadeiro ou falso',
          isUuid: 'Deve ser um ID válido (UUID)',
          isEnum: 'Valor inválido para este campo',
          isArray: 'Deve ser uma lista',
          isDate: 'Deve ser uma data válida',
          isDateString: 'Deve ser uma data válida',
          isISO8601: 'Deve ser uma data válida (ISO 8601)',
          isPositive: 'Deve ser um número positivo',
          isNegative: 'Deve ser um número negativo',
          minLength: 'Comprimento mínimo não atingido',
          maxLength: 'Comprimento máximo excedido',
          min: 'Valor abaixo do mínimo permitido',
          max: 'Valor acima do máximo permitido',
          isOptional: 'Campo opcional inválido',
          isDefined: 'Campo obrigatório',
          isNotEmptyObject: 'Objeto não pode estar vazio',
          isUrl: 'URL inválida',
        };
        const notification = new Notification();
        errors.forEach((error) => {
          if (error.constraints) {
            Object.entries(error.constraints).forEach(([key, message]) => {
              const translated = constraintTranslations[key];
              notification.addError({
                context: error.property,
                message: translated ?? message,
              });
            });
          }
        });
        return new NotificationException(notification.getErrors());
      },
    }),
  );

  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new NotificationExceptionFilter(),
  );

  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  if (nodeEnv === 'development' || nodeEnv === 'staging') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Base Auth API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);
  }

  const port = configService.get<number>('PORT', 5000);
  await app.listen(port, '0.0.0.0');
}
void bootstrap();
