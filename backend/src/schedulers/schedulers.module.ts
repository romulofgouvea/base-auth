import { Module } from '@nestjs/common';
import { UserModule } from '../users/users.module';
import { UserScheduler } from './users/users.scheduler';

@Module({
  imports: [UserModule],
  providers: [UserScheduler],
})
export class SchedulerModule {}
