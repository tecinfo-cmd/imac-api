import { Endereco } from '../../endereco/entities/endereco.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ProprietarioRequest } from './proprietario-request';
import { CicloProducao } from '../entities/ciclo-producao.entity';
import { AtividadePrincipal } from '../entities/atividade-principal.entity';


export class PropriedadeRequest {

  @ApiProperty()
  carFederal: string;

  @ApiProperty({ type: [ProprietarioRequest] })
  proprietarios: ProprietarioRequest[]

  @ApiProperty()
  nomePropriedade: string;

  @ApiProperty()
  situacaoCar: string;

  @ApiProperty()
  endereco: Endereco;

  @ApiProperty()
  voucher: string;

  @ApiProperty()
  moduloFiscal: number;

  @ApiProperty()
  cicloProducao: CicloProducao;

  @ApiProperty()
  atividadePrincipal: AtividadePrincipal;
}
