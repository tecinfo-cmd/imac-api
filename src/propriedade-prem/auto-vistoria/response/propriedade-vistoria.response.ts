import { ApiProperty } from '@nestjs/swagger';
import { Column } from 'typeorm';
import { Expose, Type } from 'class-transformer';
import { Cidade } from '../../../elegibilidade/entities/cidade.entity';
import { Endereco } from '../../../endereco/entities/endereco.entity';
import { RetornoAnaliseEntity } from '../../../agrotools/entities/retorno-analise.entity';
import { SolicitacaoElegibilidade } from '../../../elegibilidade/entities/solicitacao-elegibilidade.entity';
import { CicloProducao } from '../../entities/ciclo-producao.entity';
import { AtividadePrincipal } from '../../entities/atividade-principal.entity';
import { PagamentoMulta } from '../../../cobranca/entities/pagamento-multa.entities';
import { ProprietarioVoucherResponse } from '../../../frigorico/response/proprietario-voucher.response';

export class PropriedadeVistoriaResponse {
  id: number;

  @ApiProperty()
  @Expose()
  carFederal: string;

  @ApiProperty({type: ProprietarioVoucherResponse })
  @Expose()
  @Type(() => ProprietarioVoucherResponse)
  proprietarios: ProprietarioVoucherResponse[];

  @ApiProperty()
  @Expose()
  nomePropriedade: string;

  @ApiProperty()
  @Expose()
  cidade: Cidade;

  @ApiProperty()
  @Expose()
  endereco?: Endereco;

  @ApiProperty()
  @Expose()
  analise?: RetornoAnaliseEntity;

  @ApiProperty()
  @Expose()
  solicitacaoElegibilidade?: SolicitacaoElegibilidade;

  @ApiProperty()
  @Expose()
  cicloProducao?: CicloProducao;

  @ApiProperty()
  @Expose()
  atividadePrincipal?: AtividadePrincipal;

  @ApiProperty()
  @Expose()
  geometry?: string;

  @ApiProperty()
  @Expose()
  tamanhoPropriedade: number;

  @ApiProperty()
  @Expose()
  statusVoucher: boolean;

  @ApiProperty()
  @Expose()
  moduloFiscal: number;

  @ApiProperty()
  @Expose()
  termoAdequacaoAceito: boolean;

  @ApiProperty()
  @Expose()
  etapa?: string;

  @ApiProperty()
  @Expose()
  status?: string;

  @Column({ name: 'DATA_CRIACAO', default: () => 'CURRENT_TIMESTAMP' })
  dataCriacao?: string;

  @Column({ name: 'DATA_ATUALIZACAO', default: () => 'CURRENT_TIMESTAMP' })
  dataAtualizacao?: string;

  @ApiProperty()
  @Expose()
  pagamentoMultas: PagamentoMulta[];


}
