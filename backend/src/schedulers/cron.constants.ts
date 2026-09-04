import { CronExpression } from '@nestjs/schedule';

export const CRON_JOBS = {
  DELETE_USERS: CronExpression.EVERY_DAY_AT_3AM,
  DELETE_USERS_RETENTION_DAYS: 30,
};
