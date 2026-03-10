import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { StatusUsuario } from '../enums/usuario-status';


export class UpdateUsuarioFrigorifico {

  @ApiProperty({ required: true })
  @IsString()
  nome: string;


  @ApiProperty({ example:StatusUsuario.ATIVO  , required: true })
  status: StatusUsuario;


}
