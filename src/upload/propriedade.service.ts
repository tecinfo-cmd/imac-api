import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CsvParserService } from './csv-parser.service';
import { CsvRowDto } from './csv-row.dto';
import * as process from 'process';
import { PropriedadeConsulta } from '../elegibilidade/entities/consulta/propriedade-consulta.entity';
import { ProprietarioConsulta } from '../elegibilidade/entities/consulta/proprietario-consulta.entity';

@Injectable()
export class PropriedadeService {
  private readonly BATCH_SIZE = Number(process.env.BATCH_SIZE) || 50;

  constructor(
    @InjectRepository(PropriedadeConsulta)
    private readonly propriedadeRepository: Repository<PropriedadeConsulta>,
    @InjectRepository(ProprietarioConsulta)
    private readonly proprietarioRepository: Repository<ProprietarioConsulta>,
    private readonly csvParserService: CsvParserService,
  ) {
  }

  async processCsv(filePath: string): Promise<void> {
    try {
      await this.propriedadeRepository.clear();
      const csvRows = await this.csvParserService.parseCsvFile(filePath);
      const propriedades = this.createPropriedadeEntity(csvRows);
      await this.batchInsert(propriedades);
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao processar CSV: ${error.message}`);
    }
  }

  private createPropriedadeEntity(csv: CsvRowDto[]): PropriedadeConsulta[] {
    const propriedades: PropriedadeConsulta[] = [];
    const rejeitados = ["[INDEFERIDO]", "[CANCELADO]","[EM_ANALISE]"]
    let num = 1;
    try {
      for (var row of csv) {
        if (this.getCarFederal(row)== null) {
          console.warn(`Linha inválida ignorada. Faltando valores obrigatórios: ${row.SITUACAO} - ${row.NUMEROESTADUAL} quantidade - ${num}`);
          num++;
        } else {
          propriedades.push(
            {
              carFederal: this.getCarFederal(row),
              carEstadual: this.getCarEstadual(row),
              nomePropriedade: this.getNomePropriedade(row),
              // geometry: this.getGeometria(row),
              moduloFiscal: this.getModuloFiscal(row),
              proprietarios: this.getNomeProprietarios(row),
              codigoMunicipio: this.getCodigoMunicipio(row),
            } as PropriedadeConsulta,
          );
        }
      }
    } catch (error) {
      console.warn(`Linha inválida ignorada. Faltando valores obrigatórios`);
    }
    return propriedades;
  }

  private formatGeometry(geometry: string | null): string | null {
    if (!geometry) return null;
    const match = geometry.match(/\(\((.*)\)\)/);
    if (!match) return null;

    let coordinates = match[1].trim();
    const points = coordinates.split(',').map(point => point.trim());

    if (points[0] !== points[points.length - 1]) {
      points.push(points[0]);
    }

    return `POLYGON((${points.join(', ')}))`;
  }

  private async batchInsert(entities: PropriedadeConsulta[]): Promise<void> {
    if (!entities.length) return;

    for (let i = 0; i < entities.length; i += this.BATCH_SIZE) {
      const propriedades = entities.slice(i, i + this.BATCH_SIZE);

      try {
        await this.propriedadeRepository
          .createQueryBuilder()
          .insert()
          .into(PropriedadeConsulta)
          .values(propriedades)
          .execute();
      } catch (error) {
        Logger.error(error.message);
        for (const propriedade of propriedades) {
          await this.individualInsert(propriedade);
        }
      }
    }
  }

  private async individualInsert(entity: PropriedadeConsulta): Promise<void> {
    try {
      await this.propriedadeRepository
        .createQueryBuilder()
        .insert()
        .into(PropriedadeConsulta)
        .values(entity)
        .execute();
    } catch (error) {
      Logger.error(error.message);
      Logger.error(`Erro no registro: ${JSON.stringify(entity)}`);
    }
  }

  getCarFederal(row: CsvRowDto) {
    try {
      if (row.CODIGO_CAR_FEDERAL && row.CODIGO_CAR_FEDERAL.indexOf('MT-') >= 0) {
        return row.CODIGO_CAR_FEDERAL;
      } else if (row.PROTOCOLO && row.PROTOCOLO.indexOf('MT-') >= 0) {
        return row.PROTOCOLO;
      } else if (row.NOMEPROPRIEDADE.indexOf('MT-') >= 0) {
        return row.NOMEPROPRIEDADE;
      } else {
        return row.NOMEPROPRIEDADE.includes('MT-') ? row.NOMEPROPRIEDADE : null;
      }
    } catch (e) {
      console.error(e);
    }

  }

  getCarEstadual(row: CsvRowDto) {
    try {
      if (row.NUMEROESTADUAL && (row.NUMEROESTADUAL.indexOf('MT') >= 0 && row.NUMEROESTADUAL.length <= 13)) {
        return row.NUMEROESTADUAL;
      } else if (row.CODIGO_CAR_FEDERAL && row.CODIGO_CAR_FEDERAL.length <= 13) {
        return row.CODIGO_CAR_FEDERAL;
      } else if (row.PROTOCOLO && row.PROTOCOLO.length <= 13) {
        return row.PROTOCOLO;
      } else {
        return row.NOMEPROPRIEDADE;
      }
    } catch (e) {
      console.error(e);
    }
  }

  getNomePropriedade(row: CsvRowDto) {
    try {
      if (row.NOMEPROPRIEDADE && row.NOMEPROPRIEDADE.indexOf('MT-') >= 0) {
        return row.ATIVIDADE;
      } else if (row.ATIVIDADE && row.ATIVIDADE.indexOf('MT-') >= 0) {
        return row.PROTOCOLO;
      } else {
        return row.NOMEPROPRIEDADE;
      }
    } catch (e) {
      console.error(e);
    }
  }

  getNomeProprietarios(row: CsvRowDto) {
    try {
      const proprietarios: ProprietarioConsulta [] = [];
      const prop1 = row.NOMESPROPRIETARIOS.split(';');
      const [cpfCnpj, nomeProprietario] = prop1.toString().split(' - ').map((value) => value.trim());
      const propCons1 = {
        cpfCnpj: cpfCnpj,
        nome: nomeProprietario,
      } as ProprietarioConsulta;
      proprietarios.push(propCons1);

      if (row.NUMEROESTADUAL && !row.NUMEROESTADUAL.includes('MT')) {
        const prop2 = row.NUMEROESTADUAL.split(';');
        const [cpfCnpj, nomeProprietario] = prop2.toString().split(' - ').map((value) => value.trim());
        const propCons2 = {
          cpfCnpj: cpfCnpj,
          nome: nomeProprietario,
        } as ProprietarioConsulta;
        proprietarios.push(propCons2);
      }

      if (row.CODIGO_CAR_FEDERAL && !row.CODIGO_CAR_FEDERAL.includes('MT')) {
        const prop2 = row.NUMEROESTADUAL.split(';');
        const [cpfCnpj, nomeProprietario] = prop2.toString().split(' - ').map((value) => value.trim());
        const propCons3 = {
          cpfCnpj: cpfCnpj,
          nome: nomeProprietario,
        } as ProprietarioConsulta;
        proprietarios.push(propCons3);
      }
      return JSON.stringify(proprietarios);

    } catch (e) {
      console.error(e);
    }
  }

  getCodigoMunicipio(row: CsvRowDto) {
    try {
      if (row.MUNICIPIO_CODIGO && row.MUNICIPIO_CODIGO.length == 7 && row.MUNICIPIO_CODIGO.includes('51')) {
        return +row.MUNICIPIO_CODIGO;
      } else if (row.MODULOS_FISCAIS && row.MODULOS_FISCAIS.length == 7 && row.MODULOS_FISCAIS.includes('51')) {
        return +row.MODULOS_FISCAIS;
      } else if (row.CRUZA_TERRA_INDIGENA && row.CRUZA_TERRA_INDIGENA.length == 7 && row.CRUZA_TERRA_INDIGENA.includes('51')) {
        return +row.CRUZA_TERRA_INDIGENA;
      } else if (row.CRUZA_AREA_EMBARGADA && row.CRUZA_AREA_EMBARGADA.length == 7 && row.CRUZA_AREA_EMBARGADA.includes('51')) {
        return +row.CRUZA_AREA_EMBARGADA;
      } else {
        return null;
      }
    } catch (e) {
      console.error(e);
    }
  }

  getModuloFiscal(row: CsvRowDto) {
    try {
      if (row.MODULOS_FISCAIS && row.MODULOS_FISCAIS.length <= 5) {
        return row.MODULOS_FISCAIS
          ? parseFloat(parseFloat(row.MODULOS_FISCAIS).toFixed(2))
          : null;
      } else if (row.CRUZA_TERRA_INDIGENA && row.CRUZA_TERRA_INDIGENA.length <= 5) {
        return row.CRUZA_TERRA_INDIGENA
          ? parseFloat(parseFloat(row.CRUZA_TERRA_INDIGENA).toFixed(2))
          : null;
      } else {
        return 0;
      }
    } catch (e) {
      console.error(e);
    }
  }

  getGeometria(row: CsvRowDto) {
    if (row.GEOMETRY.length > 20) {
      return this.formatGeometry(row.GEOMETRY);
    } else {
      return null;
    }
  }
}
