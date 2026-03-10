import { ApiProperty } from '@nestjs/swagger';


export class CreateEnderecoDto {
  @ApiProperty()
  cep: string;
  @ApiProperty({ required: false })
  longitude?: number;
  @ApiProperty({ required: false })
  latitude?: number;
  @ApiProperty()
  municipio: string;
  @ApiProperty()
  estado: string;
  @ApiProperty({ required: false })
  codigoPostal?: string;
  @ApiProperty()
  logradouro: string;
  @ApiProperty({ required: false })
  complemento?: string;
}
