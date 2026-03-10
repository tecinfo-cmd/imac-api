import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';


@Entity({ schema: 'IMAC', name: 'TB_CICLO_PRODUCAO' })
export class CicloProducao {

  @Expose()
  @ApiProperty()
  @PrimaryColumn({
    name: 'ID'
  })
  id: number;

  @Expose()
  @ApiProperty()
  @Column({ name: 'DESCRICAO' })
  descricao: string;

}
