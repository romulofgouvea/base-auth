import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { HHBaseEntity } from '../../common/entities/hh-base.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('users')
export class User extends HHBaseEntity {
  @Column({ type: 'varchar', unique: true, nullable: false })
  username: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar' })
  passwordHash: string;

  @Column({ name: 'is_email_verified', type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ name: 'is_remove_permanent', type: 'boolean', default: false })
  isRemovePermanent: boolean;

  @Column({ name: 'remove_requested_at', type: 'timestamp', nullable: true })
  removeRequestedAt: Date | null;

  @ManyToMany(() => Role, { eager: false })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];
}
