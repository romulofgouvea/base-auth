import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { PermissionModule } from './permissions/permissions.module';
import { RoleModule } from './roles/roles.module';
import { UserModule } from './users/users.module';
import { ProfileModule } from './profiles/profiles.module';
import { MailModule } from './mail/mail.module';
import { SchedulerModule } from './schedulers/schedulers.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10 }]),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
          },
          ttl: 1000 * 60 * 60, // 1 hour default
        }),
      }),
    }),
    DatabaseModule,
    AuthModule,
    PermissionModule,
    RoleModule,
    UserModule,
    ProfileModule,
    MailModule,
    SchedulerModule,
  ],
})
export class AppModule {}
