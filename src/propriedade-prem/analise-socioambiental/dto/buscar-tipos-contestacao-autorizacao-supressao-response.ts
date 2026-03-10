import { ApiProperty } from '@nestjs/swagger';

export class BuscarTiposAutorizacaoSupressaoResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome: string;
}
