import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ConsultaSolicitacaoQueryDto {
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


}
