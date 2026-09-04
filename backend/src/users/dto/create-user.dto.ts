import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Nome de usuário único', example: 'joaosilva' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'E-mail do usuário',
    example: 'joao@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Senha (mínimo 8 caracteres)', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
