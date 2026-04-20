import { Param } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ValidarConsultaQueryDto {
  @ApiProperty({
    name: 'token',
    required: true,
    type: String
  })
  @IsString()
  token: string;
}
