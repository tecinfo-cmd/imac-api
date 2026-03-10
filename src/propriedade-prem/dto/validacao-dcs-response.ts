import { ApiProperty } from '@nestjs/swagger';

export enum DCSStatus {
  Suspenso = 'SUSPENSO',
  Apto = 'APTO',
  Bloqueado = 'BLOQUEADO'
}

export class ValidacaoDCSResponse {

  @ApiProperty()
  id: number;

  @ApiProperty()
  status: DCSStatus;

  @ApiProperty()
  carFederal: string;

  @ApiProperty()
  nomePropriedade: string;

  @ApiProperty()
  cpfCnpj: string;

  @ApiProperty()
  dataAdesaoPrem: string;

  @ApiProperty({ type: [Object] })
  deteccoes: { tipo: string, areaHa: string }[];

  @ApiProperty()
  urlDcs: string;
}
