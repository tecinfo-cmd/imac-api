import { Expose } from "class-transformer";
import { Documento } from "../../../shared/entity/documento.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ schema: 'IMAC', name: 'TB_ORGAOS_EMISSORES_AUTORIZACAO_SUPRESSAO' })
export class OrgaoEmissorAutorizacaoSupressao{
  @Expose()
  @PrimaryGeneratedColumn({
    name: 'ID',
  })
  id: number;

  @Expose()
  @Column({ name: 'NOME' })
  nome: string;
}