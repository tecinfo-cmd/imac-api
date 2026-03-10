import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Propriedade } from '../../propriedade-prem/entities/propriedade.entity';
import { Frigorifico } from './frigorifico.entity';
import { Expose } from 'class-transformer';

export enum StatusVoucher{
  ATIVO = 'ATIVO',
  PENDENTE = 'PENDENTE',
}

@Entity({ schema: 'IMAC', name: 'TB_VOUCHER' })
export class VoucherEntity {

  @Expose()
  @PrimaryGeneratedColumn({
    name: 'ID'
  })
  id: number;

  @Expose()
  @ApiProperty()
  @Column({ name: 'VOUCHER' })
  voucher: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'STATUS' })
  status: StatusVoucher;

  @Column({ name: 'ID_PROPRIEDADE' })
  idPropriedade: number;


  @Column({ name: 'ID_FRIGORIFICO' })
  idFrigorifico: number;

  @ApiProperty()
  @Column({ name: 'DATA_ATUALIZACAO' })
  dataAtualizacao: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'DATA_CRIACAO' })
  dataCriacao: string;

  @ManyToOne(() => Propriedade, (propriedade) => propriedade.vouches)
  @JoinColumn({ name: 'ID_PROPRIEDADE' })
  propriedade?: Propriedade;

  @Expose()
  @ManyToOne(() => Frigorifico, (frigorifico) => frigorifico.vouches)
  @JoinColumn({ name: 'ID_FRIGORIFICO' })
  frigorifico?: Frigorifico;

}
