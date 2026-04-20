import { ApiProperty } from '@nestjs/swagger';

export class BuscarOrgaosEmissoresAutorizacaoSupressaoResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome: string;
}
