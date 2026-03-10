import { TipoProprietatioEnum } from '../enum/tipo-proprietatio-enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Validate } from 'class-validator';
import { TelefoneValidator } from '../../elegibilidade/validators/telefone';

export class ProprietarioProprietarioRequest {
  @ApiProperty()
  idProprietario?: number;

  @ApiProperty()
  nome: string

  @ApiProperty({
    name: 'cpfCnpj',
    required: false,
    type: String
  })
  @ApiProperty()
  cpfCnpj: string

  @ApiProperty()
  rgInscricaoSocial: string

  @ApiProperty({example: '1990-05-01'})
  dataNascimento: string

  @ApiProperty({ example: '(55) 1198765-4321', required: true })
  @IsString()
  @IsNotEmpty({ message: 'O telefone não pode estar vazio' })
  @Validate(TelefoneValidator)
  @ApiProperty()
  telefone: string

  @ApiProperty({ example: 'email@example.com', required: true })
  @IsString()
  @IsNotEmpty({ message: 'O email não pode estar vazio' })
  @IsEmail({}, { message: 'O email deve ser válido' })
  @ApiProperty()
  email: string;

  @ApiProperty({ example: 'PROPRIETARIO OU COPROPRIETARIO', required: true })
  @IsNotEmpty({ message: 'Tipo proprietario obrigatorio' })
  tipoProprietario: TipoProprietatioEnum

}
