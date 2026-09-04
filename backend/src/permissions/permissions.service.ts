import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { BaseRepository } from '../common/repositories/base.repository';
import { PermissionResponse } from './responses/permission.response';
import { plainToInstance } from 'class-transformer';
import { Notification } from '../common/domain/notification/notification';
import { NotificationException } from '../common/domain/notification/notification.exception';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionsRepository: BaseRepository<Permission>,
  ) {}

  async findAllAsync(): Promise<PermissionResponse[]> {
    const permissions = await this.permissionsRepository.find();
    return permissions.map((p) =>
      plainToInstance(PermissionResponse, p, { excludeExtraneousValues: true }),
    );
  }

  async findOneAsync(id: string): Promise<PermissionResponse> {
    const permission = await this.permissionsRepository.findOne({
      where: { id },
    });

    if (!permission) {
      const notification = new Notification();
      notification.addError({
        context: 'permission',
        message: `Permissão com id "${id}" não encontrada`,
      });
      throw new NotificationException(notification.getErrors());
    }

    return plainToInstance(PermissionResponse, permission, {
      excludeExtraneousValues: true,
    });
  }

  async findByKeyAsync(
    resource: string,
    action: string,
  ): Promise<PermissionResponse | null> {
    const permissions = await this.permissionsRepository.find();
    const found = permissions.find((p) => p.key === `${resource}:${action}`);
    if (!found) return null;
    return plainToInstance(PermissionResponse, found, {
      excludeExtraneousValues: true,
    });
  }
}
