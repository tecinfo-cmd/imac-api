import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SolicitacaoRedefinicaoSenhaDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsEmail()
  email: string;
}
