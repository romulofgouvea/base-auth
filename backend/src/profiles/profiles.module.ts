import { Module } from '@nestjs/common';
import { ProfileController } from './profiles.controller';
import { ProfileService } from './profiles.service';
import { ProfileRepository } from './profiles.repository';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, ProfileRepository],
  exports: [ProfileService, ProfileRepository],
})
export class ProfileModule {}
