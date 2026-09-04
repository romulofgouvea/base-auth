import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { User } from './entities/user.entity';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource);
  }

  async findByEmailAsync(email: string): Promise<User | null> {
    return this.createActiveQueryBuilder('user')
      .andWhere('user.email = :email', { email })
      .getOne();
  }

  async findByUsernameAsync(username: string): Promise<User | null> {
    return this.createActiveQueryBuilder('user')
      .andWhere('user.username = :username', { username })
      .getOne();
  }

  async findByIdWithRolesAsync(id: string): Promise<User | null> {
    return this.createActiveQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .andWhere('user.id = :id', { id })
      .getOne();
  }

  async findAllActiveAsync(): Promise<User[]> {
    return this.createActiveQueryBuilder('user').getMany();
  }
}
