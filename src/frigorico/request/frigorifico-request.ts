import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Validate } from 'class-validator';
import { CNPJValidator } from '../../elegibilidade/validators/cnpj';
import { Expose } from 'class-transformer';

export class  FrigorificoRequest {

  @Expose()
  @ApiProperty()
  razaoSocial: string;

  @Expose()
  @ApiProperty()
  nomeFantasia: string;

  @Expose()
  @ApiProperty()
  ie: string;

  @Expose()
  @ApiProperty()
  @Validate(CNPJValidator)
  cnpj: string;

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

  @ApiProperty({ example: 'email@example.com', required: true })
  @IsString()
  @IsNotEmpty({ message: 'O email não pode estar vazio' })
  @IsEmail({}, { message: 'O email deve ser válido' })
  email: string;

  @Expose()
  @ApiProperty()
  dataInicioVigencia: string;

  @Expose()
  @ApiProperty()
  dataFimVigencia: string;

  parametros: any;

}
