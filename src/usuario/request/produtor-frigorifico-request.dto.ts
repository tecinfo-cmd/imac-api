import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsString, Validate } from 'class-validator';
import { CPFValidator } from '../../elegibilidade/validators/cpf';
import { UsuarioTipo } from '../enums/usuario-tipo';
import { UsuarioRole } from '../dto/usuario-role.dto';
import { UsuarioFrigoficoRequest } from './usuario-frigorifico-request.dto';

export enum Cargo {
  ADMIN = 'ADMIN',
  ANALISTA = 'ANALISTA',
  GERENTE_DE_PROJETOS = 'GERENTE DE PROJETOS',
  PRODUTOR = 'PRODUTOR',
}

export class ProdutorFrigoficoRequest extends UsuarioFrigoficoRequest{

 
  @ApiProperty({ example: '(79)99999-9999', required: true })
  @IsString()
  @IsNotEmpty({ message: 'O telefone não pode estar vazio' })
  telefone: string

  @ApiProperty({ example: '12', required: true })
  idSolicitacao: number;

  @ApiProperty({ example: '8', required: true })
  idFrogorifico: number;

}
