import { ApiProperty } from '@nestjs/swagger';

export class CarAgrotoolsResponse {

  @ApiProperty()
  codigoMunicipio?: string;
  codImovel: string;
  numArea: number;
  codEstado: string;
  nomeMunicipio: string;
  situacao: string;
  condicao: string;
  centroidLongitude: number;
  centroidLatitude: number;
  geom: string;

}
