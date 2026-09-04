import { ApiProperty } from '@nestjs/swagger';

export class AuthMeResponseDto {
  @ApiProperty({ description: 'ID do usuário' })
  id: string;

  @ApiProperty({
    description: 'Lista de nomes de roles do usuário',
    type: [String],
  })
  roles: string[];

  @ApiProperty({
    description: 'Lista de permission keys do usuário',
    type: [String],
  })
  permissions: string[];
}
