import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RbacGuard } from './guards/rbac.guard';
import { LoginRateLimitGuard } from './guards/login-rate-limit.guard';
import { UserModule } from '../users/users.module';
import { RoleModule } from '../roles/roles.module';
import { ProfileModule } from '../profiles/profiles.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRATION') ?? '1h') as any,
        },
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 900000, limit: 10 }]),
    UserModule,
    forwardRef(() => RoleModule),
    ProfileModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RbacGuard,
    LoginRateLimitGuard,
  ],
  exports: [AuthService, JwtAuthGuard, RbacGuard],
})
export class AuthModule {}
