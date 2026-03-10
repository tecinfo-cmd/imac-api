import { ApiProperty } from '@nestjs/swagger';

export class UploadDocumentosResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nomeArquivo: string;

  @ApiProperty()
  urlArquivo: string;

  @ApiProperty()
  tipo: string;
}
