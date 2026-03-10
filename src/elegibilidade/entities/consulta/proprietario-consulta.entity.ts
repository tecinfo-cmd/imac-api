import { ApiProperty } from '@nestjs/swagger';

export class ProprietarioConsulta {

  @ApiProperty()
  id: number;

  @ApiProperty()
  cpfCnpj: string;

  @ApiProperty()
  nome: string;

}
