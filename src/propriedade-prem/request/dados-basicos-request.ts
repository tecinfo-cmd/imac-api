import { CreateEnderecoDto } from '../../endereco/dto/create-endereco.dto';
import { ApiProperty } from '@nestjs/swagger';

export class DadosBasicosRequest{
  @ApiProperty()
  endereco: CreateEnderecoDto
  @ApiProperty()
  idAtividadePrincipal: number
  @ApiProperty()
  idCicloProducao: number
  @ApiProperty()
  tamanhoPropriedade: number
  @ApiProperty()
  numeroProprietarios: number
}
