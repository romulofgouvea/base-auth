export interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatar: string | null;
  document: string | null;
  birthDate: string | null;
  email: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
}
