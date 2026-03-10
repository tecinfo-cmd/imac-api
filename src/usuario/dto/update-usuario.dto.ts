import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { UsuarioRole } from './usuario-role.dto';
import { UsuarioTipo } from '../enums/usuario-tipo';
import { StatusUsuario } from '../enums/usuario-status';

export class UpdateUsuarioDto {


  @ApiProperty({ type: () => [UsuarioRole], required: false })
  roles?: UsuarioRole[];

  @ApiProperty({ example: '(79)99999-9999', required: false})
  telefone?: string

  @ApiProperty({ enum: UsuarioTipo, required: false })
  tipo?: UsuarioTipo;

  @ApiProperty({ required: false })
  profissao?: string;

  @ApiProperty({ required: false })
  status?: StatusUsuario;
}
