import { ApiProperty } from '@nestjs/swagger';

export class DocumentoRequest{
  @ApiProperty()
  type: string;
  @ApiProperty()
  number: string;

}
