import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Validate } from 'class-validator';
import { TelefoneValidator } from '../validators/telefone';
import { CarFederalValidator } from '../validators/car-federal';
import { CPFValidator } from '../validators/cpf';

export class CreateElegibilidadeRequestDto {
  @ApiProperty({ example: 'MT-1302405-E6D3395B6D274F42AE22DD56GHIJDD52', required: true })
  @IsString()
  @IsNotEmpty({ message: 'O CAR Federal não pode estar vazio' })
  @Length(43, 43, {
    message: 'O CAR Federal deve conter entre 43 caracteres',
  })
  @Validate(CarFederalValidator)
  carFederal: string;

  @ApiProperty({ example: '(55) 1198765-4321', required: true })
  @IsString()
  @IsNotEmpty({ message: 'O telefone não pode estar vazio' })
  @Validate(TelefoneValidator)
  telefone: string;

  @ApiProperty({ example: 'email@example.com', required: true })
  @IsString()
  @IsNotEmpty({ message: 'O email não pode estar vazio' })
  @IsEmail({}, { message: 'O email deve ser válido' })
  email: string;

  @ApiProperty({
    name: 'cpfCnpj',
    required: false,
    type: String
  })
  @IsOptional()
  @IsString()
  @Validate(CPFValidator)
  cpfCnpj?: string;
}
