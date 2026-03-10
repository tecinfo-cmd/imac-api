import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UsuarioResponse } from '../../usuario/response/usuario-response';
import { SolicitacaoElegibilidadeResponse } from '../../propriedade-prem/response/solicitacao-elegibilidade-response';

export class FrigorificoResponse {

  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  razaoSocial: string;

  @ApiProperty()
  @Expose()
  nomeFantasia: string;

  @ApiProperty()
  @Expose()
  ie: string;

  @ApiProperty()
  @Expose()
  cnpj: string;

  @ApiProperty()
  @Expose()
  telefone: string;

  @ApiProperty()
  @Expose()
  dataCriacao: string;

  @ApiProperty()
  @Expose()
  cep: string;

  @ApiProperty()
  @Expose()
  endereco: string;

  @ApiProperty()
  @Expose()
  municipio: string;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  urlTermoCooperacao: string;

  @ApiProperty()
  @Expose()
  quantidadeVoucher: number;

  @ApiProperty({type: UsuarioResponse })
  @Expose()
  @Type(()  => UsuarioResponse)
  usuario: UsuarioResponse[];


}
