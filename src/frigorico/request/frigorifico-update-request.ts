import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Validate } from 'class-validator';
import { CNPJValidator } from '../../elegibilidade/validators/cnpj';
import { Expose } from 'class-transformer';

export class  FrigorificoUpdateRequest {

  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  nomeFantasia: string;

  @Expose()
  @ApiProperty()
  telefone: string;

  @Expose()
  @ApiProperty()
  cep: string;

  @Expose()
  @ApiProperty()
  endereco: string;

  @Expose()
  @ApiProperty()
  municipio: string;

  @Expose()
  @ApiProperty()
  quantidadeVoucher: number;

  @Expose()
  @ApiProperty({example:'2025-01-01'})
  dataInicioVigencia: string;

  @Expose()
  @ApiProperty({example:'2025-11-01'})
  dataFimVigencia: string;



}
