import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsString } from 'class-validator';
import { BaseUploadRequest } from '../../../shared/dto/base-upload-request.dto';

export class CriarContestacaoLaudoRequest extends BaseUploadRequest {
  @ApiProperty({
    name: 'motivo',
    required: true,
    type: String
  })
  @IsString()
  motivo: string;

  @ApiProperty({
    name: 'idResponsavelTecnico',
    required: true,
    type: Number
  })
  @IsNumberString()
  idResponsavelTecnico: number;
}
