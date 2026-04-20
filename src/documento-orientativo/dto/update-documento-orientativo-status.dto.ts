import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateDocumentoOrientativoStatusDto {
  @ApiProperty({ description: 'Indica se o conteúdo está ativo.', type: Boolean })
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  ativo: boolean;
}