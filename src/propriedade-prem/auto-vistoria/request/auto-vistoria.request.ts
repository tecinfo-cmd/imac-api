import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AutoVistoriaRequest {

  @ApiProperty({example: '2025-05-01'})
  @IsNotEmpty({ message: 'Data inicio é obrigatorio' })
  dataInicio: string;

  @ApiProperty()
  idPropriedade: number;
}