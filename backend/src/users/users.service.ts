import { Injectable } from '@nestjs/common';
import { UserRepository } from './users.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponse } from './responses/user.response';
import { plainToInstance } from 'class-transformer';
import { Notification } from '../common/domain/notification/notification';
import { NotificationException } from '../common/domain/notification/notification.exception';

@Injectable()
export class UserService {
  constructor(private readonly usersRepository: UserRepository) {}

  async findAllAsync(): Promise<UserResponse[]> {
    const users = await this.usersRepository.findAllActiveAsync();
    return users.map((u) =>
      plainToInstance(UserResponse, u, { excludeExtraneousValues: true }),
    );
  }

  async findOneAsync(id: string): Promise<UserResponse> {
    const user = await this.usersRepository.findByIdWithRolesAsync(id);
    if (!user) {
      const notification = new Notification();
      notification.addError({
        context: 'user',
        message: `Usuário com id "${id}" não encontrado`,
      });
      throw new NotificationException(notification.getErrors());
    }
    return plainToInstance(UserResponse, user, {
      excludeExtraneousValues: true,
    });
  }

  async updateAsync(
    id: string,
    dto: UpdateUserDto,
    updatedBy: string,
  ): Promise<UserResponse> {
    const user = await this.usersRepository.findByIdWithRolesAsync(id);
    if (!user) {
      const notification = new Notification();
      notification.addError({
        context: 'user',
        message: `Usuário com id "${id}" não encontrado`,
      });
      throw new NotificationException(notification.getErrors());
    }

    const notification = new Notification();

    if (dto.email && dto.email !== user.email) {
      const existing = await this.usersRepository.findByEmailAsync(dto.email);
      if (existing) {
        notification.addError({
          context: 'email',
          message: 'Email already in use',
        });
      }
    }

    if (dto.username && dto.username !== user.username) {
      const existing = await this.usersRepository.findByUsernameAsync(
        dto.username,
      );
      if (existing) {
        notification.addError({
          context: 'username',
          message: 'Username already in use',
        });
      }
    }

    if (notification.hasErrors()) {
      throw new NotificationException(notification.getErrors());
    }

    Object.assign(user, dto);
    user.updatedBy = updatedBy;
    const saved = await this.usersRepository.save(user);
    return plainToInstance(UserResponse, saved, {
      excludeExtraneousValues: true,
    });
  }

  async removeAsync(id: string, _deletedBy: string): Promise<UserResponse> {
    const user = await this.usersRepository.findByIdWithRolesAsync(id);
    if (!user) {
      const notification = new Notification();
      notification.addError({
        context: 'user',
        message: `Usuário com id "${id}" não encontrado`,
      });
      throw new NotificationException(notification.getErrors());
    }
    const removed = await this.usersRepository.remove(user);
    return plainToInstance(UserResponse, removed, {
      excludeExtraneousValues: true,
    });
  }

  async removeUserPermanentAsync(
    id: string,
    _deletedBy: string,
  ): Promise<UserResponse> {
    const user = await this.usersRepository.findByIdWithRolesAsync(id);
    if (!user) {
      const notification = new Notification();
      notification.addError({
        context: 'user',
        message: `Usuário com id "${id}" não encontrado`,
      });
      throw new NotificationException(notification.getErrors());
    }
    user.isRemovePermanent = true;
    user.removeRequestedAt = new Date();
    const saved = await this.usersRepository.save(user);
    return plainToInstance(UserResponse, saved, {
      excludeExtraneousValues: true,
    });
  }
}
