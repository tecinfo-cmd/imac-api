import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ schema: 'IMAC', name: 'TB_CIDADES' })
export class Cidade {

  @PrimaryGeneratedColumn({
    name: 'ID'
  })
  id: number;

  @ApiProperty()
  @Column({ name: 'CODIGO' })
  codigo: number;

  @ApiProperty()
  @Column({ name: 'NOME' })
  nome: string;

  @ApiProperty()
  @Column({ name: 'UF' })
  uf: string;
}
