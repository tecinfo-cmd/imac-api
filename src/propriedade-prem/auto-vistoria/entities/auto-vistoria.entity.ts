import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Propriedade } from '../../entities/propriedade.entity';
import { ApiProperty } from '@nestjs/swagger';
import { FormularioVistoriaResponse } from '../response/formulario-vistoria-response';
import { Documento } from '../../../shared/entity/documento.entity';

export enum StatusVistoria {
  Agendado = 'AGENDADO',
  Realizado = 'REALIZADO',
  NaoRealizado = "NAO_REALIZADO"
}

export enum Vistoria {
  AguardandoVistoria = 'AGUARDANDO_VISTORIA',
  Deferido = 'DEFERIDO',
  Indeferido = 'INDEFERIDO',
}

@Entity({ schema: 'IMAC', name: 'TB_AUTO_VISTORIA' })
export class AutoVistoriaEntity {
  @PrimaryGeneratedColumn({
    name: 'ID'
  })
  id: number;

  @ApiProperty()
  @Column({ name: 'DATA_INICIO' })
  dataInicio: string;

  @ApiProperty()
  @Column({ name: 'DATA_TERMINO' })
  dataTermino: string;

  @ApiProperty()
  @Column({ name: 'STATUS_VISTORIA', default: () => StatusVistoria.Agendado })
  statusVistoria: string;

  @ApiProperty()
  @Column({ name: 'VISTORIA' , default: () => Vistoria.AguardandoVistoria })
  vistoria: string;

  @ApiProperty()
  @Column({ name: 'SURVEY_ID' })
  surveyId?: string;

  @ApiProperty()
  @Column({ name: 'ID_PROPRIEDADE' })
  idPropriedade: number;

  @ApiProperty()
  @ManyToOne(() => Propriedade)
  @JoinColumn({ name: 'ID_PROPRIEDADE' })
  propriedade: Propriedade;

  @ApiProperty()
  @Column({ name: 'FORMULARIO' })
  formulario?: string;

  @ApiProperty()
  @Column({ name: 'CODIGO_EVIDENCIA' })
  codigoEvidencia: number;

  @ApiProperty()
  formularios: FormularioVistoriaResponse[];

  @ApiProperty()
  @ManyToMany(() => Documento, { cascade: true })
  @JoinTable(
    {
      name: 'TB_DOCUMENTOS_AUTO_VISTORIAS',
      joinColumn: { name: 'ID_AUTO_VISTORIA' },
      inverseJoinColumn: { name: 'ID_DOCUMENTO' }
    }
  )
  documentos: Documento[];
}