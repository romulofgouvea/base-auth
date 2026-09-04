import { Expose, Type } from 'class-transformer';
import { RoleResponse } from '../../roles/responses/role.response';

export class UserResponse {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  isEmailVerified: boolean;

  @Expose()
  isRemovePermanent: boolean;

  @Expose()
  removeRequestedAt?: Date;

  @Expose()
  @Type(() => RoleResponse)
  roles?: RoleResponse[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
