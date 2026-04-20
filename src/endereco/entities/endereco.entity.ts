import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

@Entity({ name: 'TB_ENDERECOS', schema: 'IMAC' })
export class Endereco {

  @ApiProperty()
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @Expose()
  @ApiProperty()
  @Column({ name: 'CEP' })
  cep: string;

  @ApiProperty()
  @Column({
    name: 'LONGITUDE',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  longitude?: number;

  @ApiProperty()
  @Column({
    name: 'LATITUDE',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  latitude?: number;


  @Expose()
  @ApiProperty()
  @Column({ name: 'MUNICIPIO' })
  municipio: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'ESTADO' })
  estado: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'CAIXA_POSTAL', nullable: true })
  caixaPostal?: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'LOGRADOURO' })
  logradouro: string;

  @ApiProperty()
  @Column({ name: 'COMPLEMENTO', nullable: true })
  complemento?: string;

}
