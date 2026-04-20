import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn, IsBoolean, IsOptional, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

export enum TipoDocumentoOrientativo {
  PDF = 'pdf',
  VIDEO = 'video',
}

export class CreateDocumentoOrientativoDto {
  @ApiProperty({ description: 'Título do documento orientativo.' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ description: 'Descrição sobre o documento.' })
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiProperty({ enum: TipoDocumentoOrientativo, description: 'Tipo do conteúdo (pdf ou video).' })
  @IsIn(Object.values(TipoDocumentoOrientativo))
  @IsNotEmpty()
  tipo: TipoDocumentoOrientativo;

  @ApiProperty({ description: 'Indica se o conteúdo está ativo.', type: Boolean })
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  ativo: boolean;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Arquivo de capa (obrigatório).' })
  @IsOptional() // Opcional para o class-validator, pois o arquivo não vem no body
  capaArquivo?: any;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Arquivo PDF. Obrigatório se o tipo for "pdf".', required: false })
  @IsOptional() // Opcional para o class-validator
  arquivo?: any;

  @ApiProperty({
    description: 'URL do vídeo do Youtube. Obrigatório se o tipo for "video".',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'URL do vídeo inválida.' })
  urlVideo?: string;
}