import { HttpClient, apiClient } from './ApiClient';
import type { ProfileData, UpdateProfileRequest } from '../models/ProfileModel';

export class ProfileService {
  private readonly apiClient: HttpClient;

  constructor(apiClient: HttpClient) {
    this.apiClient = apiClient;
  }

  async get(): Promise<ProfileData> {
    return await this.apiClient.get<ProfileData>('/profiles');
  }

  async update(data: UpdateProfileRequest): Promise<ProfileData> {
    return await this.apiClient.patch<ProfileData>('/profiles', data);
  }
}

export const profileService = new ProfileService(apiClient);
