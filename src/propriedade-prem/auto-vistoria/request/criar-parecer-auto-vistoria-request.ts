import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { BaseUploadRequest } from '../../../shared/dto/base-upload-request.dto';
import { Vistoria } from '../entities/auto-vistoria.entity';

const statusValidosParaParecer = Object.values(Vistoria).filter(
  (status) => status !== Vistoria.AguardandoVistoria
);
export class CriarParecerAutoVistoriaRequest extends BaseUploadRequest {
  @ApiProperty({
    name: 'status',
    required: true,
    enum: statusValidosParaParecer,
    enumName: 'Vistoria',
    type: String
  })
  @IsString()
  status: Vistoria;
}

