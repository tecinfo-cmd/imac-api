import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';

export class DocumentoResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  nomeArquivo: string;

  @Expose()
  @ApiProperty()
  nomeArquivoOriginal: string;

  @Expose()
  @ApiProperty()
  urlArquivo: string;

  @Expose()
  @ApiProperty()
  tipo: string;

  @Expose()
  @ApiProperty()
  dataUpload: Date;

  @Expose()
  @ApiProperty()
  idUsuarioUpload: number;

  @Expose({ name: 'enviadoPorAnalista' })
  @ApiProperty({ description: 'Indica se o documento foi enviado por um analista.' })
  enviadoPorAnalista: boolean;
}