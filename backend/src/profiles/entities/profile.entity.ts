import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { HHBaseEntity } from '../../common/entities/hh-base.entity';
import { User } from '../../users/entities/user.entity';
import { Gender } from '../../common/enums/gender.enum';

@Entity('profiles')
export class Profile extends HHBaseEntity {
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'first_name', type: 'varchar' })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar' })
  lastName: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  /** URL for the user's avatar image, hosted wherever the consuming app stores files */
  @Column({ type: 'varchar', nullable: true })
  avatar: string | null;

  /** CPF, RG ou outro documento de identificação */
  @Column({ type: 'varchar', nullable: true })
  document: string | null;

  @Column({ name: 'birth_date', type: 'timestamptz', nullable: true })
  birthDate: Date | null;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender | null;
}
