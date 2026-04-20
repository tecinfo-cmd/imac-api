import { Proprietario } from '../entities/proprietario.entity';
import { Endereco } from '../../endereco/entities/endereco.entity';
import { ApiProperty } from '@nestjs/swagger';
import { PropriedadeRequest } from './propriedade-request';
import { Pessoa } from '../../shared/entity/pessoa.entity';


export class ProprietarioRequest {

  @ApiProperty()
  telefone: string;

  @ApiProperty()
  pessoa: Pessoa;

}
