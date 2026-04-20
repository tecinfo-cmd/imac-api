import { ApiProperty } from '@nestjs/swagger';
import { RetornoAnaliseEntity } from '../entities/retorno-analise.entity';

export  class DeteccoesAnaliseDto {

  @ApiProperty()
  tipo: string;

  @ApiProperty()
  area_ha: string;

  @ApiProperty()
  retornoAnalises?: RetornoAnaliseEntity
}