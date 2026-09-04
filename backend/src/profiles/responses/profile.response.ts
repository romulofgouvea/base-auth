import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../common/enums/gender.enum';
import { Expose, Transform } from 'class-transformer';

export class ProfileResponse {
  @ApiProperty({ description: 'The unique identifier of the profile' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'First name of the user' })
  @Expose()
  firstName: string;

  @ApiProperty({ description: 'Last name of the user' })
  @Expose()
  lastName: string;

  @ApiProperty({
    description: 'Email address of the user',
    required: false,
    nullable: true,
  })
  @Expose()
  @Transform(({ obj }) => obj.user?.email || null)
  email: string | null;

  @ApiProperty({ description: 'Phone number', required: false, nullable: true })
  @Expose()
  phone: string | null;

  @ApiProperty({ description: 'Avatar URL', required: false, nullable: true })
  @Expose()
  avatar: string | null;

  @ApiProperty({
    description: 'Document identifier',
    required: false,
    nullable: true,
  })
  @Expose()
  document: string | null;

  @ApiProperty({ description: 'Birth date', required: false, nullable: true })
  @Expose()
  birthDate: Date | null;

  @ApiProperty({
    enum: Gender,
    description: 'Gender of the user',
    required: false,
    nullable: true,
  })
  @Expose()
  gender: Gender | null;
}
