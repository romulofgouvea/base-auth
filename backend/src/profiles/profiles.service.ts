import { Injectable, Inject } from '@nestjs/common';
import { ProfileRepository } from './profiles.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponse } from './responses/profile.response';
import { plainToInstance } from 'class-transformer';
import { Notification } from '../common/domain/notification/notification';
import { NotificationException } from '../common/domain/notification/notification.exception';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class ProfileService {
  constructor(
    private readonly profilesRepository: ProfileRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findByUserIdAsync(userId: string): Promise<ProfileResponse> {
    const profile = await this.profilesRepository.findByUserIdAsync(userId);

    if (!profile) {
      const notification = new Notification();
      notification.addError({
        context: 'profile',
        message: `Profile for user "${userId}" not found`,
      });
      throw new NotificationException(notification.getErrors());
    }

    return plainToInstance(ProfileResponse, profile, {
      excludeExtraneousValues: true,
    });
  }

  async findByUserIdCachedAsync(userId: string): Promise<ProfileResponse> {
    const cacheKey = `profile:${userId}`;
    const cached = await this.cacheManager.get<ProfileResponse>(cacheKey);
    if (cached) return cached;

    const profile = await this.findByUserIdAsync(userId);
    await this.cacheManager.set(cacheKey, profile);
    return profile;
  }

  async updateAsync(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<ProfileResponse> {
    const profile = await this.profilesRepository.findByUserIdAsync(userId);
    if (!profile) {
      const notification = new Notification();
      notification.addError({
        context: 'profile',
        message: `Profile for user "${userId}" not found`,
      });
      throw new NotificationException(notification.getErrors());
    }

    Object.assign(profile, dto);
    profile.updatedBy = userId;

    await this.profilesRepository.save(profile);

    await this.invalidateProfileCacheAsync(userId);

    return plainToInstance(ProfileResponse, profile, {
      excludeExtraneousValues: true,
    });
  }

  async invalidateProfileCacheAsync(userId?: string): Promise<void> {
    if (userId) {
      await this.cacheManager.del(`profile:${userId}`);
    } else {
      await this.cacheManager.clear();
    }
  }
}
