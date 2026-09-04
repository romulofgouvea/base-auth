import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RoleRepository } from './roles.repository';
import { Permission } from '../permissions/entities/permission.entity';
import { AuthService } from '../auth/auth.service';
import { RoleResponse } from './responses/role.response';
import { plainToInstance } from 'class-transformer';
import { Notification } from '../common/domain/notification/notification';
import { NotificationException } from '../common/domain/notification/notification.exception';

@Injectable()
export class RoleService {
  constructor(
    private readonly rolesRepository: RoleRepository,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async findAllAsync(): Promise<RoleResponse[]> {
    const roles = await this.rolesRepository.find();
    return roles.map((r) =>
      plainToInstance(RoleResponse, r, { excludeExtraneousValues: true }),
    );
  }

  async findOneAsync(id: string): Promise<RoleResponse> {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) {
      const notification = new Notification();
      notification.addError({
        context: 'role',
        message: `Regra com id "${id}" não encontrada`,
      });
      throw new NotificationException(notification.getErrors());
    }
    return plainToInstance(RoleResponse, role, {
      excludeExtraneousValues: true,
    });
  }

  async findByNameAsync(name: string): Promise<RoleResponse | null> {
    const role = await this.rolesRepository.findByNameAsync(name);
    if (!role) return null;
    return plainToInstance(RoleResponse, role, {
      excludeExtraneousValues: true,
    });
  }

  async assignPermissionAsync(
    roleId: string,
    permissionId: string,
  ): Promise<RoleResponse> {
    const role = await this.rolesRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .where('role.id = :roleId', { roleId })
      .andWhere('role.isActive = :isActive', { isActive: true })
      .getOne();

    if (!role) {
      const notification = new Notification();
      notification.addError({
        context: 'role',
        message: `Regra com id "${roleId}" não encontrada`,
      });
      throw new NotificationException(notification.getErrors());
    }

    const permissionRepository = this.dataSource.getRepository(Permission);
    const permission = await permissionRepository.findOne({
      where: { id: permissionId },
    });

    if (!permission) {
      const notification = new Notification();
      notification.addError({
        context: 'permissionId',
        message: `Permission with id "${permissionId}" not found`,
      });
      throw new NotificationException(notification.getErrors());
    }

    const alreadyAssigned = role.permissions.some((p) => p.id === permissionId);
    if (!alreadyAssigned) {
      role.permissions.push(permission);
      await this.rolesRepository.save(role);
      await this.authService.invalidateMeCacheAsync();
    }

    return plainToInstance(RoleResponse, role, {
      excludeExtraneousValues: true,
    });
  }
}
