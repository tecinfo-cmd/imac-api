import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TermoCooperacaoRequest {

  @ApiProperty({
    description: 'Nome original do arquivo enviado. Deve corresponder ao nome do arquivo na lista de arquivos enviados no campo "arquivos".',
    example: 'documento_identidade.pdf',
  })
  @IsString({ message: 'O nome do arquivo em parametros deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome do arquivo em parametros não pode ser vazio.' })
  nome: string;

  @ApiProperty({
    description: 'TERMO COOPERACAO).',
    example: 'TERMO_COOPERACAO',
  })
  @IsString({ message: 'O tipo do arquivo em parametros deve ser uma string.' })
  @IsNotEmpty({ message: 'O tipo do arquivo em parametros não pode ser vazio.' })
  tipo: string

}