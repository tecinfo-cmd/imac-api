import { ApiProperty } from '@nestjs/swagger';

export class AcoesRequest {
  @ApiProperty()
  idPropriedade: number;

  @ApiProperty()
  contestarDeteccoes: boolean;

  @ApiProperty()
  confirmarDeteccoes: boolean;

  @ApiProperty()
  termoAssinado: boolean;

  @ApiProperty()
  proporNovaArea: boolean;

  @ApiProperty()
  confirmarEstrategia: boolean;
}
