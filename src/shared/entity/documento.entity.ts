import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Propriedade } from '../../propriedade-prem/entities/propriedade.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity({ schema: 'IMAC', name: 'TB_DOCUMENTOS' })
export class Documento {

  @Expose()
  @ApiProperty()
  @PrimaryGeneratedColumn({
    name: 'ID'
  })
  id: number;

  @Expose()
  @ApiProperty()
  @Column({ name: 'NOME_ARQUIVO' })
  nomeArquivo: string;

  @Expose()
  @ApiProperty()
  @Column({ name: "NOME_ARQUIVO_ORIGINAL" })
  nomeArquivoOriginal: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'URL_ARQUIVO' })
  urlArquivo: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'TIPO'})
  tipo: string;

  @Expose()
  @ManyToMany(() => Propriedade, (propriedade) => propriedade.documentos, { cascade: true })
  @JoinTable({
    name: 'TB_DOCUMENTOS_PROPRIEDADES',
    joinColumn: { name: 'ID_DOCUMENTO' },
    inverseJoinColumn: { name: 'ID_PROPRIEDADE' }
  })
  propriedades?: Propriedade[];

  @Expose()
  @ApiProperty()
  @Column({ name: 'DATA_UPLOAD', default: () => 'CURRENT_TIMESTAMP' })
  dataUpload: Date;

  @Expose()
  @Column({ name: 'ID_USUARIO_UPLOAD', nullable: true })
  idUsuarioUpload?: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'ID_USUARIO_UPLOAD' })
  usuarioUpload?: Usuario;
}
