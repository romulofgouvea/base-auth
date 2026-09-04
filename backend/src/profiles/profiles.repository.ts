import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { Profile } from './entities/profile.entity';

@Injectable()
export class ProfileRepository extends BaseRepository<Profile> {
  constructor(dataSource: DataSource) {
    super(Profile, dataSource);
  }

  async findByUserIdAsync(userId: string): Promise<Profile | null> {
    return this.createActiveQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .andWhere('profile.userId = :userId', { userId })
      .getOne();
  }
}
