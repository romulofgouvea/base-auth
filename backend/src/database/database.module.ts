import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ActiveFilterSubscriber } from '../common/subscribers/active-filter.subscriber';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('DB_HOST'),
        port: config.getOrThrow<number>('DB_PORT'),
        username: config.getOrThrow<string>('DB_USERNAME'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_NAME'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [
          __dirname + '/migrations/*{.ts,.js}',
          __dirname + '/seeds/*{.ts,.js}',
        ],
        migrationsRun: true,
        synchronize: false,
        logging: config.get('NODE_ENV') === 'development',
        subscribers: [ActiveFilterSubscriber],
      }),
    }),
  ],
})
export class DatabaseModule {}
