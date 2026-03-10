import { Expose } from 'class-transformer';
import { Endereco } from '../../endereco/entities/endereco.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ResponsavelTecnicoResponse {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  cpf: string

  @Expose()
  @ApiProperty()
  nome: string;

  @Expose()
  @ApiProperty()
  profissao: string;

  @Expose()
  @ApiProperty()
  registroCrea: string;

  @Expose()
  @ApiProperty()
  telefone: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  endereco: Endereco;
}
