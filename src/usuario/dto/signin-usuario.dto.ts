import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEmail, IsNotEmpty, IsString, IsStrongPassword, Validate } from 'class-validator';
import { CPFValidator } from '../../elegibilidade/validators/cpf';
import { UsuarioRole } from './usuario-role.dto';
import { Expose } from 'class-transformer';
import { UsuarioTipo } from '../enums/usuario-tipo';

export enum Cargo {
  ADMIN = 'ADMIN',
  ANALISTA = 'ANALISTA',
  GERENTE_DE_PROJETOS = 'GERENTE DE PROJETOS',
  PRODUTOR = 'PRODUTOR',
}

export class SigninUsuarioDto {

  @ApiProperty({ required: true })
  @IsString()
  nome: string;

  @ApiProperty({ required: true })
  @IsString()
  @Validate(CPFValidator)
  cpf: string;

  @ApiProperty({ example:'1990-01-01', required: true })
  @IsDateString()
  @IsNotEmpty({ message: 'A data de nascimento não pode estar vazia' })
  dataNascimento: string

  @ApiProperty()
  @ApiProperty({ example: 'email@example.com', required: true })
  @IsString()
  @IsNotEmpty({ message: 'O email não pode estar vazio' })
  @IsEmail({}, { message: 'O email deve ser válido' })
  email: string;

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
  confirmacaoSenha: string;

  @ApiProperty({ required: true })
  @IsBoolean()
  aceitouTermos: boolean;

  @ApiProperty()
  @IsString()
  cep: string;

  @ApiProperty({ required: true })
  @IsString()
  uf: string;

  @ApiProperty({ required: true })
  @IsString()
  logradouro: string;

  @ApiProperty({ required: true })
  @IsString()
  numero: string;

  @ApiProperty({ required: false })
  @IsString()
  bairro: string;

  @ApiProperty({ required: false })
  @IsString()
  cidade: string;

  @ApiProperty({ type: () => [UsuarioRole], required: false })
  roles: UsuarioRole[];

  @ApiProperty({ example: '(79)99999-9999', required: true })
  @IsString()
  @IsNotEmpty({ message: 'O telefone não pode estar vazio' })
  @ApiProperty()
  telefone: string

  @ApiProperty({ enum: UsuarioTipo, required: false })
  tipo?: UsuarioTipo;
}
