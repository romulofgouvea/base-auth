import {
  IsString,
  IsNotEmpty,
  IsStrongPassword,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Senha atual do usuário' })
  @IsString({ message: 'Senha atual deve ser um texto' })
  @IsNotEmpty({ message: 'Senha atual é obrigatória' })
  currentPassword: string;

  @ApiProperty({
    description: 'A senha deve ser forte',
    example: 'StrongP@ssw0rd!',
  })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    { message: 'A nova senha não é forte o suficiente' },
  )
  newPassword: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Token de refresh deve ser um texto' })
  refreshToken?: string;
}
