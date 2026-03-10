import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

interface DeteccoesResponse{
    tipo?: string;
    area_ha: number;
}

export class WebhookElegibilidadeDTO {
  @ApiProperty({ 
    name: 'transactionId',
    required: true,
    type: String
  })
  @IsString()
  transactionId: string;

  @ApiProperty({ 
    name: 'car',
    required: false,
    type: String
  })
  @IsString()
  @IsOptional()
  car?: string;
  
  @ApiProperty({
    name: 'status',
    required: false,
    type: String
  })
  @IsOptional()
  @IsString()
  status?: string;
  
  @ApiProperty({
    name: 'urlCheckout',
    required: false,
    type: String
  })
  @IsOptional()
  @IsString()
  urlCheckout?: string;

  @ApiProperty({
    name: 'createdAt',
    required: true,
    type: String
  })
  @IsString()
  createdAt: string;

  @ApiProperty({
    name: 'isElegible',
    required: false,
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  isElegible?: boolean;

  @ApiProperty({
    name: 'hasDocuments',
    required: true,
    type: Boolean
  })
  @IsBoolean()
  hasDocuments: boolean;

  @ApiProperty({
    name: 'errors',
    required: false,
    type: [String]
  })
  @IsArray()
  @IsOptional()
  errors?: string[];

  @ApiProperty({
    name: 'deteccoes',
    required: false,
    type: [Object]
  })
  @IsArray()
  @IsOptional()
  deteccoes?: DeteccoesResponse[];

  @ApiProperty({
    name: 'areas_desmatamento_total',
    required: true,
    type: Number
  })
  @IsNumber()
  areas_desmatamento_total: number;

  @ApiProperty({
    name: 'modulo_fiscal',
    required: true,
    type: Number
  })
  @IsNumber()
  modulo_fiscal: number;

  @ApiProperty({
    name: 'vlr_multa',
    required: false,
    type: Number
  })
  @IsNumber()
  @IsOptional()
  vlr_multa?: number;

  @ApiProperty({
    name: 'desconto_perc',
    required: false,
    type: Number
  })
  @IsNumber()
  @IsOptional()
  desconto_perc?: number;
}
