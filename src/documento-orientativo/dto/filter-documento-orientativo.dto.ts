import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsBoolean, IsDateString, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { TipoDocumentoOrientativo } from './create-documento-orientativo.dto';

export class FilterDocumentoOrientativoDto {
  @ApiPropertyOptional({ description: 'Filtrar por título do documento.' })
  @IsOptional()
  @IsString()
  titulo?: string;

  @ApiPropertyOptional({ description: 'Filtrar por descrição do documento.' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ enum: TipoDocumentoOrientativo, description: 'Filtrar por tipo de conteúdo (pdf ou video).' })
  @IsOptional()
  @IsIn(Object.values(TipoDocumentoOrientativo))
  tipo?: TipoDocumentoOrientativo;

  @ApiPropertyOptional({ description: 'Filtrar por status (ativo/inativo).', type: Boolean })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  ativo?: boolean;

  @ApiPropertyOptional({ description: 'Data de criação inicial para filtro (YYYY-MM-DD).' })
  @IsOptional()
  @IsDateString()
  dataCriacaoInicio?: string;

  @ApiPropertyOptional({ description: 'Data de criação final para filtro (YYYY-MM-DD).' })
  @IsOptional()
  @IsDateString()
  dataCriacaoFim?: string;

  @ApiPropertyOptional({ description: 'Data de atualização inicial para filtro (YYYY-MM-DD).' })
  @IsOptional()
  @IsDateString()
  dataAtualizacaoInicio?: string;

  @ApiPropertyOptional({ description: 'Data de atualização final para filtro (YYYY-MM-DD).' })
  @IsOptional()
  @IsDateString()
  dataAtualizacaoFim?: string;
}