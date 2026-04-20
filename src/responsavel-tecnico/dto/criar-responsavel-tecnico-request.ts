import { IsEmail, IsNotEmpty, IsString, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TelefoneValidator } from '../../elegibilidade/validators/telefone';
import { CreateEnderecoDto } from '../../endereco/dto/create-endereco.dto';
import { IsCpf } from '../../shared/decorators/is-cpf.decorator';

export class CriarResponsavelTecnicoRequest {
  @ApiProperty({
  name: 'cpf',
  required: true,
  type: String
  })
  @IsString()
  @IsNotEmpty({ message: 'O cpf não pode estar vazio' })
  @IsCpf({ message: 'O cpf deve ser válido' })
  cpf: string
  
  @ApiProperty({
  name: 'nome',
  required: true,
  type: String
  })
  @IsNotEmpty({ message: 'O nome não pode estar vazio' })
  nome: string;
  
  @ApiProperty({
  name: 'profissao',
  required: true,
  type: String
  })
  @IsNotEmpty({ message: 'A profissão não pode estar vazia' })
  profissao: string;
  
  @ApiProperty({
  name: 'registroCrea',
  required: true,
  type: String
  })
  @IsNotEmpty({ message: 'O registro do crea não pode estar vazio' })
  registroCrea: string;
  
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
  
  @ApiProperty({ required: true })
  @IsNotEmpty({ message: 'O endereco não pode estar vazio' })
  endereco: CreateEnderecoDto;
}
