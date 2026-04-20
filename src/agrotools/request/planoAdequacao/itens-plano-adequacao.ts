import { ApiProperty } from '@nestjs/swagger';

export class ItensPlanoAdequacao {

  @ApiProperty()
  idTad: number;

  @ApiProperty()
  wkt: string;

  @ApiProperty()
  technicalReportUrl: string;

  @ApiProperty()
  typeContestation: number;
}
