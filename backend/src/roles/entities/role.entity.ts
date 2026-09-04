import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { HHBaseEntity } from '../../common/entities/hh-base.entity';
import { Permission } from '../../permissions/entities/permission.entity';

@Entity('roles')
export class Role extends HHBaseEntity {
  @Column({ type: 'varchar', unique: true, nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @ManyToMany(() => Permission, { eager: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];
}
