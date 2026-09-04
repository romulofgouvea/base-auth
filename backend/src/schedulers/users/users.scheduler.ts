import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UserRepository } from '../../users/users.repository';
import { LessThan } from 'typeorm';
import { CRON_JOBS } from '../cron.constants';

@Injectable()
export class UserScheduler {
  private readonly logger = new Logger(UserScheduler.name);

  constructor(private readonly usersRepository: UserRepository) {}

  @Cron(CRON_JOBS.DELETE_USERS)
  async handlePermanentDeletionsAsync() {
    this.logger.log(
      `Iniciando rotina de exclusão permanente de usuários vencidos (${CRON_JOBS.DELETE_USERS_RETENTION_DAYS} dias)`,
    );

    const retentionLimitDate = new Date();
    retentionLimitDate.setDate(
      retentionLimitDate.getDate() - CRON_JOBS.DELETE_USERS_RETENTION_DAYS,
    );

    const usersToDelete = await this.usersRepository.findAllIncludingInactive({
      where: {
        isRemovePermanent: true,
        removeRequestedAt: LessThan(retentionLimitDate),
      },
    });

    if (usersToDelete.length === 0) {
      this.logger.log(
        'Nenhum usuário agendado para exclusão permanente encontrado hoje.',
      );
      return;
    }

    this.logger.log(
      `Foram encontrados ${usersToDelete.length} usuários para exclusão definitiva.`,
    );

    for (const user of usersToDelete) {
      try {
        await this.usersRepository.remove(user); // Hard delete
        this.logger.log(`Usuário ID: ${user.id} excluído permanentemente.`);
      } catch (error: unknown) {
        this.logger.error(
          `Falha ao excluir o usuário ID: ${user.id}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }

    this.logger.log('Rotina de exclusão permanente finalizada.');
  }
}
