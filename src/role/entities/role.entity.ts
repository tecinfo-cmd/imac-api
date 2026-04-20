import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ schema: 'IMAC', name: 'TB_ROLE' })
export class Role {
  @ApiProperty()
  @PrimaryGeneratedColumn({
    name: 'ID'
  })
  id: number;

  @Expose()
  @ApiProperty()
  @Column({ name: 'NOME' })
  nome: string;
}