import { ApiProperty } from '@nestjs/swagger';
import { DeteccoesAnaliseEntity } from '../entities/deteccoes-analise.entity';

export class RetornoAnaliseDto {

  @ApiProperty()
  urlRelatorio: string;

  @ApiProperty()
  areaDesmatadaTotal: number;

  @ApiProperty()
  moduloFiscal: number;

  @ApiProperty()
  valorMulta: number;

  @ApiProperty()
  descontoPercentual: number;

  @ApiProperty()
  deteccoes: DeteccoesAnaliseEntity[] = new Array();

  @ApiProperty()
  dataCriacao: string;
}