import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SolicitacaoElegibilidade } from './solicitacao-elegibilidade.entity';
import { ApiProperty } from '@nestjs/swagger';
import { StatusPagamento } from '../../shared/enums/enums';

@Entity({ schema: 'IMAC', name: 'TB_PAGAMENTO_VOUCHER' })
export class PagamentoVoucher {

  @ApiProperty()
  @PrimaryGeneratedColumn({
    name: 'ID'
  })
  id: number;

  @ApiProperty()
  @Column({ name: 'STATUS' })
  status: StatusPagamento;

  @ApiProperty()
  @Column({ name: 'VOUCHER_CODE' })
  voucherCode: string;

  @ApiProperty()
  @Column({ name: 'TRANSACTION_ID' })
  transactionId: string;


  @Column({ name: 'ID_SOLICITACAO' })
  idSolicitacao: number;

  @ApiProperty()
  @OneToOne(() => SolicitacaoElegibilidade)
  @JoinColumn({ name: 'ID_SOLICITACAO' })
  solicitacaoElegibilidade: SolicitacaoElegibilidade;

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
  @Column({ name: 'DATA_PAGAMENTO' })
  dataPagamento: string;

  @ApiProperty()
  @Column({ name: 'DATA_VENCIMENTO' })
  dataVencimento: string;

  @ApiProperty()
  @Column({ name: 'VALOR' })
  valor: number;

}
