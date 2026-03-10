import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsString, Validate } from 'class-validator';
import { CPFValidator } from '../../elegibilidade/validators/cpf';
import { UsuarioTipo } from '../enums/usuario-tipo';
import { UsuarioRole } from '../dto/usuario-role.dto';

export enum Cargo {
  ADMIN = 'ADMIN',
  ANALISTA = 'ANALISTA',
  GERENTE_DE_PROJETOS = 'GERENTE DE PROJETOS',
  PRODUTOR = 'PRODUTOR',
}

export class UsuarioFrigoficoRequest {

  @ApiProperty({ required: true })
  @IsString()
  nome: string;

  @ApiProperty({ required: true })
  @IsString()
  @Validate(CPFValidator)
  cpf: string;

  @ApiProperty()
  @ApiProperty({ example: 'email@example.com', required: true })
  @IsString()
  @IsNotEmpty({ message: 'O email não pode estar vazio' })
  @IsEmail({}, { message: 'O email deve ser válido' })
  email: string;

}
