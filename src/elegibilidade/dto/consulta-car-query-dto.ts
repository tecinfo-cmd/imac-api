import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, Validate } from "class-validator";
import { CPFValidator } from "../validators/cpf";
import { CNPJValidator } from "../validators/cnpj";

export class ConsultaCarQueryDto {
  @ApiProperty({ 
    name: 'cpf',
    required: false,
    type: String
  })
  @IsOptional()
  @IsString()
  @Validate(CPFValidator)
  cpf?: string;
  
  @ApiProperty({
    name: 'cnpj',
    required: false,
    type: String
  })
  @IsOptional()
  @IsString()
  @Validate(CNPJValidator)
  cnpj?: string;
  
  @ApiProperty({
    name: 'carEstadual',
    required: false,
    type: String
  })
  @IsOptional()
  @IsString()
  carEstadual?: string;
}
