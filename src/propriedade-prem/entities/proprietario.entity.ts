import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Pessoa } from '../../shared/entity/pessoa.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Expose } from 'class-transformer';

@Entity({ schema: 'IMAC', name: 'TB_PROPRIETARIOS' })
export class Proprietario {

  @Expose()
  @ApiProperty()
  @PrimaryGeneratedColumn({
    name: 'ID'
  })
  id: number;

  @Expose()
  @ApiProperty()
  @OneToOne(() => Pessoa)
  @JoinColumn({ name: 'ID_PESSOA' })
  pessoa: Pessoa;

  @Expose()
  @ApiProperty()
  @Column({ name: 'TIPO_PROPRIETARIO' })
  tipoProprietario: string;

  @Expose()
  @Column({ name: 'TELEFONE' })
  telefone: string;

  @Column({ name: 'DATA_CRIACAO', default: () => 'CURRENT_TIMESTAMP' })
  dataCriacao: string;

  @Column({ name: 'DATA_ATUALIZACAO', default: () => 'CURRENT_TIMESTAMP' })
  dataAtualizacao: string;
}
