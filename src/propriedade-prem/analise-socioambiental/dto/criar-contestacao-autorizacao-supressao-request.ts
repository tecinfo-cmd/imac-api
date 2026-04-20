import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsDateString, IsNumber, IsNumberString, IsString, ValidateNested } from 'class-validator';
import { BaseUploadRequest } from '../../../shared/dto/base-upload-request.dto';
import { Type } from 'class-transformer';

export class AutorizacaoSupressaoRequest{
@ApiProperty({
    name: 'dataEmissao',
    example: '1990-01-01',
    required: true,
    type: String
  })
  @IsDateString()
  dataEmissao: string;

  @ApiProperty({
    name: 'dataValidade',
    example: '1990-01-01',
    required: true,
    type: String
  })
  @IsDateString()
  dataValidade: string;

  @ApiProperty({
    name: 'idTipo',
    required: true,
    type: Number
  })
  @IsNumber()
  idTipo: number;

  @ApiProperty({
    name: 'idOrgaoEmissor',
    required: true,
    type: Number
  })
  @IsNumber()
  idOrgaoEmissor: number;

  @ApiProperty({
    name: 'areaAutorizadaParaSupressaoHa',
    required: true,
    type: Number
  })
  @IsNumber()
  areaAutorizadaParaSupressaoHa: number;

  @ApiProperty({
    name: 'nomeArquivo',
    required: true,
    type: 'string',
  })
  nomeArquivo: string;
}

export class CriarContestacaoAutorizacaoSupressaoRequest extends BaseUploadRequest{
  @ApiProperty({
    name: 'motivo',
    required: true,
    type: String
  })
  @IsString()
  motivo: string;

  @ApiProperty({
    name: 'idResponsavelTecnico',
    required: true,
    type: Number
  })
  @IsNumberString()
  idResponsavelTecnico: number;

  @ApiProperty({
    name: 'autorizacoesSupressoes',
    required: true,
    type: 'string',
    description: 'Um array de objetos em string trazendo todos os campos da autorização de supressão, detalhe para o nomeArquivo que deve ser colocado obrigatóriamente para vincular o arquivo enviado a autorização.',
    example: '[{"dataEmissao": "2023-01-01", "dataValidade": "2024-01-01", "idTipo": 1, "idOrgaoEmissor": 1, "areaAutorizadaParaSupressaoHa": 10.5, "nomeArquivo": "arquivo.pdf"}]'
  })
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  @Type(() => AutorizacaoSupressaoRequest)
  autorizacoesSupressoes: AutorizacaoSupressaoRequest[];
}
