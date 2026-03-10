import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'IMAC', name: 'TB_ERRO_FUNCIONALIDADE' })
export class ErroFuncionalidade {

  @ApiProperty()
  @PrimaryGeneratedColumn({
    name: 'ID'
  })
  id: number;

  @ApiProperty()
  @Column({ name: 'FUNCIONALIDADE' })
  funcionalidade: string;

  @ApiProperty()
  @Column({ name: 'ERRO' })
  erro: string;

  @ApiProperty()
  @Column({ name: 'DATA_CRIACAO' })
  dataErro?: string

}
