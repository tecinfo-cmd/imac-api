import { Expose, Type } from 'class-transformer';
import { Pessoa } from '../../shared/entity/pessoa.entity';
import { ApiProperty } from '@nestjs/swagger';
import { UsuarioRole } from '../dto/usuario-role.dto';

export class UsuarioResponse {

  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty({ type: () => Pessoa})
  pessoa: Pessoa;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  aceitouTermos: boolean;

  @Expose()
  @ApiProperty()
  cargo: string;

  @Expose()
  @ApiProperty()
  dataCriacao: string;

  @Expose()
  @ApiProperty()
  accessToken?: string;

  @Expose()
  @ApiProperty()
  roles: UsuarioRole[];
}
