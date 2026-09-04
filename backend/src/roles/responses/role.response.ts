import { Expose, Type } from 'class-transformer';
import { PermissionResponse } from '../../permissions/responses/permission.response';

export class RoleResponse {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description?: string;

  @Expose()
  @Type(() => PermissionResponse)
  permissions?: PermissionResponse[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
