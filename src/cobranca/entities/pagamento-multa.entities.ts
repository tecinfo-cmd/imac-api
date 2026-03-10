import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { StatusPagamento } from '../../shared/enums/enums';
import { Propriedade } from '../../propriedade-prem/entities/propriedade.entity';

@Entity({ schema: 'IMAC', name: 'TB_PAGAMENTO_MULTA' })
export class PagamentoMulta {

  @ApiProperty()
  @PrimaryGeneratedColumn({
    name: 'ID'
  })
  id: number;

  @ApiProperty()
  @Column({ name: 'STATUS' })
  status: StatusPagamento;

  @ApiProperty()
  @Column({ name: 'TRANSACTION_ID' })
  transactionId: string;

  @Column({ name: 'ID_PROPRIEDADE' })
  idPropriedade: number;

  @ManyToOne(() => Propriedade, (propriedade) => propriedade.pagamentoMultas)
  @JoinColumn({ name: 'ID_PROPRIEDADE' })
  propriedade: Propriedade;

  @ApiProperty()
  @Column({ name: 'QRCODE' })
  qrCode: string;

  @ApiProperty()
  @Column({ name: 'CODIGO_BARRAS' })
  codigoBarras: string;

  @ApiProperty()
  @Column({ name: 'NOSSO_NUMERO' })
  nossoNumero: string;

  @ApiProperty()
  @Column({ name: 'COOPERATIVA' })
  cooperativa: string;

  @ApiProperty()
  @Column({ name: 'LINHA_DIGITAVEL' })
  linhaDigitavel: string;

  @ApiProperty()
  @Column({ name: 'TX_ID' })
  txId: string;

  @ApiProperty()
  @Column({ name: 'POSTO' })
  posto: string;

  @ApiProperty()
  @Column({ name: 'STATUS_COMANDO' })
  statusComando: string;

  @ApiProperty()
  @Column({ name: 'DATA_HORA_REGISTRO' })
  dataHoraComando: string;

  @ApiProperty()
  @Column({ name: 'TIPO_MENSAGEM' })
  tipoMensagem: string;

  @ApiProperty()
  @Column({ name: 'SEU_NUMERO' })
  numeroBoleto: string;

  @ApiProperty()
  @Column({ name: 'PARCELA' })
  parcela: number;

  @ApiProperty()
  @Column({ name: 'DATA_VENCIMENTO' })
  dataVencimento: string;

  @ApiProperty()
  @Column({ name: 'DATA_PAGAMENTO' })
  dataPagamento: string

  @ApiProperty()
  @Column({ name: 'VALOR' })
  valor: number;

}
