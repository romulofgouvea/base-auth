import { Column, Entity } from 'typeorm';
import { HHBaseEntity } from '../../common/entities/hh-base.entity';

@Entity('permissions')
export class Permission extends HHBaseEntity {
  @Column({ type: 'varchar', nullable: false })
  resource: string;

  @Column({ type: 'varchar', nullable: false })
  action: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  get key(): string {
    return `${this.resource}:${this.action}`;
  }
}
