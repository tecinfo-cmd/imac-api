import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ConsultaResponsavelTecnicoRequest {
  @ApiProperty({
    name: 'cpf',
    required: false,
    type: String
  })
  @IsOptional()
  @IsString()
  cpf?: string;

  @ApiProperty({
    name: 'email',
    required: false,
    type: String
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    name: 'municipio',
    required: false,
    type: String
  })
  @IsOptional()
  @IsString()
  municipio?: string;

  @ApiProperty({
    name: 'profissao',
    required: false,
    type: String
  })
  @IsOptional()
  @IsString()
  profissao?: string;
}
