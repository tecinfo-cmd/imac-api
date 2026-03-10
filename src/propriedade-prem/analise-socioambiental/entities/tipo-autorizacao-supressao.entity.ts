import { Expose } from "class-transformer";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ schema: 'IMAC', name: 'TB_TIPOS_AUTORIZACAO_SUPRESSAO' })
export class TipoAutorizacaoSupressao{
  @Expose()
  @PrimaryGeneratedColumn({
    name: 'ID',
  })
  id: number;

  @Expose()
  @Column({ name: 'NOME' })
  nome: string;
}