import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsStrongPassword } from 'class-validator';

export class PrimeiroAcessoDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsStrongPassword({
      minUppercase: 1,
      minLowercase:1,
      minNumbers:1,
      minLength:11,
      minSymbols:1,
    }, {message: 'Senha invalida, a senha deve conter no minimo 11 caracteres, sendo eles no minimo 1 maiusculo, 1 minusculo, 1 numero, 1 caractere especial'})
  senha: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsStrongPassword({
      minUppercase: 1,
      minLowercase:1,
      minNumbers:1,
      minLength:11,
      minSymbols:1,
    }, {message: 'Senha invalida, a senha deve conter no minimo 11 caracteres, sendo eles no minimo 1 maiusculo, 1 minusculo, 1 numero, 1 caractere especial'})
    confirmacaoSenha: string;

  @ApiProperty({ required: true })
  @IsString()
  token: string;
}
