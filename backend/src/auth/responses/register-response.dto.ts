import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({ description: 'The unique identifier of the user' })
  id: string;

  @ApiProperty({ description: 'The user username' })
  username: string;

  @ApiProperty({ description: 'The user email address' })
  email: string;

  @ApiProperty({
    description: 'List of role IDs assigned to the user',
    type: [String],
  })
  roles: string[];
}
