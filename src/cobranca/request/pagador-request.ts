import { TipoPessoa } from './beneficiario-request';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { MaxLength } from 'class-validator';



export class PagadorRequest {

  @ApiProperty({ example:71695882, required: true, maxLength: 8})
  @MaxLength(8,  { message: 'Cep invalido' })
  @Expose()
  cep:string;

  @ApiProperty({ example:'Cuiaba', required: true })
  @Expose()
  cidade:string;

  @ApiProperty({ example:'57107266000155', required: true })
  @Expose()
  documento:string;

  @ApiProperty({ example:'Fulano da Silva', required: true })
  @Expose()
  nome:string;

  @ApiProperty({ example:TipoPessoa.PESSOA_JURIDICA, required: true })
  @Expose()
  tipoPessoa:TipoPessoa;

  @ApiProperty({ example:'Ruda do endereço', required: true })
  @Expose()
  endereco:string;

  @ApiProperty({ example:'MT', required: true })
  @Expose()
  uf:string;
}