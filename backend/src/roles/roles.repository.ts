import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleRepository extends BaseRepository<Role> {
  constructor(dataSource: DataSource) {
    super(Role, dataSource);
  }

  async findByNameAsync(name: string): Promise<Role | null> {
    return this.createActiveQueryBuilder('role')
      .andWhere('role.name = :name', { name })
      .getOne();
  }
}
