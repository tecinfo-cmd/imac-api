import { ApiProperty } from '@nestjs/swagger';


export class ItensContestacao {

  @ApiProperty()
  idTad: number;

  @ApiProperty()
  wkt: string;

  @ApiProperty()
  technicalReportUrl: string;


}
