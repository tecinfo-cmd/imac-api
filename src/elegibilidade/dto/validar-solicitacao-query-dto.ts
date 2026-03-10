import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class validarSolicitacoesDto {
  @ApiProperty({ 
    name: 'id',
    required: true,
    type: Number
  })
  id: number;

  @ApiProperty({
    name: 'token',
    required: true,
    type: String
  })
  @IsOptional()
  @IsString()
  token: string;


}
