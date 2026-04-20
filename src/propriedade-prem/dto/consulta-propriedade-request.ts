import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ConsultaPropriedadeRequest {
  @ApiProperty({
    name: 'nomePropriedade',
    required: false,
    type: String
  })
  @IsOptional()
  @IsString()
  nomePropriedade?: string;

  @ApiProperty({
    name: 'codigoMunicipio',
    required: false
  })
  @IsOptional()
  @IsString()
  codigoMunicipio?: number;

  @ApiProperty({
    name: 'carFederal',
    required: false,
    type: String
  })
  @IsOptional()
  @IsString()
  carFederal?: string;

  @ApiProperty({
    name: 'statusVoucher',
    required: false,
    type: Boolean
  })
  @IsOptional()
  @IsString()
  statusVoucher?: boolean;

  @ApiProperty({
    name: 'analista',
    required: false,
    type: String
  })
  @IsOptional()
  @IsString()
  analista?: string;
}
