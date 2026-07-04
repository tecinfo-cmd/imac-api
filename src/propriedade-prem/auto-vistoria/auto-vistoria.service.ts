import {
  BadRequestException,
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MensagemResponse } from '../response/mensagem-response';
import { PropriedadePremService } from '../propriedade-prem.service';
import NegocioException from '../../exception/negocio-exception';
import {
  AutoVistoriaEntity,
  StatusVistoria,
  Vistoria,
} from './entities/auto-vistoria.entity';
import { AutoVistoriaRequest } from './request/auto-vistoria.request';
import { plainToInstance } from 'class-transformer';
import * as moment from 'moment';
import { AgrotoolsService } from '../../agrotools/agrotools.service';
import { VistoriaAgrotools } from '../../agrotools/request/vistoria-agrotools';
import { PessoaService } from '../../shared/service/pessoa.service';
import { EmailService } from '../../email/email.service';
import { AutoVistoriaAgendadaTemplate } from '../../email/templates/auto-vistoria-agendada.template';
import { InformacaoVistoriaRequest } from './request/informacao-vistoria.request';
import { FormularioVistoriaResponse } from './response/formulario-vistoria-response';
import { DocumentoUploadService } from '../../upload/documento-upload.service';
import { UploadPayloadType } from '../../shared/types/upload-payload.type';
import { CriarParecerAutoVistoriaRequest } from './request/criar-parecer-auto-vistoria-request';
import { AuthenticatedRequest } from '../../shared/interfaces/authenticated-request.interface';
import { MensagemService } from '../../message/mensagem.service';

@Injectable()
export class AutoVistoriaService {
  constructor(
    @InjectRepository(AutoVistoriaEntity)
    private readonly autoVistoriaRepository: Repository<AutoVistoriaEntity>,
    private readonly propriedadeService: PropriedadePremService,
    private readonly pessoaService: PessoaService,
    @Inject(forwardRef(() => AgrotoolsService))
    private readonly agrotoolsService: AgrotoolsService,
    private readonly emailService: EmailService,
    private readonly documentoUploadService: DocumentoUploadService,
    private readonly mensagemService: MensagemService,
  ) {}

  async cadastrarAutoVistoria(
    request: AutoVistoriaRequest,
    usuarioLogado: AuthenticatedRequest,
  ): Promise<MensagemResponse> {
    const propriedade = await this.propriedadeService.consultaPropriedadePorId(
      request.idPropriedade,
      usuarioLogado,
    );
    let pessoa = await this.pessoaService.buscaPessoaEmail(
      usuarioLogado.user.email,
    );

    if (!propriedade) {
      throw new NegocioException(
        HttpStatus.NOT_FOUND,
        'Propriedade não cadastrada.',
      );
    }

    if (!propriedade.territorios || propriedade.territorios.length == 0) {
      throw new NegocioException(
        HttpStatus.NOT_FOUND,
        'Propriedade sem territorio cadastrado.',
      );
    }

    const emails = propriedade.proprietarios.map((p) => p.pessoa.email);
    const proprietarios = propriedade.proprietarios.filter(
      (p) => p.tipoProprietario == 'PROPRIETARIO',
    );

    if (proprietarios.length > 0) {
      const pessoas = proprietarios.map((p) => p.pessoa);
      if (pessoas.length > 0) {
        pessoa = pessoas[0];
      }
    }

    const autoVistoriaAgendada = await this.autoVistoriaRepository.findOne({
      where: {
        idPropriedade: request.idPropriedade,
        // statusVistoria: StatusVistoria.Agendado,
      },
    });
    try {
      if (autoVistoriaAgendada) {
        if (autoVistoriaAgendada.codigoEvidencia) {
          throw new NegocioException(
            HttpStatus.BAD_REQUEST,
            'Já existe uma auto vistoria agendada para esta propriedade.',
          );
        } else {
          const vistoriaRequest = {
            territoryId: propriedade.territorios[0].codigoTerritorio,
            userId: pessoa.idUsuarioAgrotools,
            externalCode: autoVistoriaAgendada.id.toString(),
            dateStart: autoVistoriaAgendada.dataInicio,
            dateEnd: autoVistoriaAgendada.dataTermino,
            scheduleName: propriedade.nomePropriedade,
          } as unknown as VistoriaAgrotools;

          const autoVistoriaResponse =
            await this.agrotoolsService.solicitarVistoria(vistoriaRequest);
          autoVistoriaAgendada.codigoEvidencia =
            autoVistoriaResponse.cdEvidence;
          await this.autoVistoriaRepository.save(autoVistoriaAgendada);

          const nomePropriedade = propriedade?.nomePropriedade;
          const proprietario = propriedade?.proprietarios[0].pessoa.nome;
          const telefone = propriedade?.proprietarios[0].pessoa.telefone;

          const dados = {
            produtor: proprietario,
            propriedade: nomePropriedade,
            carFederal: propriedade?.carFederal,
            telefone: telefone,
          };
          await this.mensagemService.enviarMensagemAutoVistoria(dados);

          await this.emailService.enviarEmailTemplate({
            recipients: [
              emails.length > 0 ? emails[0] : usuarioLogado.user.email,
            ],
            subject: 'Autovistoria agendada',
            template: new AutoVistoriaAgendadaTemplate({
              dataLimite: new Date(autoVistoriaAgendada.dataTermino),
            }),
          });
        }
      } else {
        const data: Date = new Date(request.dataInicio);
        const dataFim = await this.adicionarDias(data, 10);
        const autoVistoria = plainToInstance(AutoVistoriaEntity, {
          idPropriedade: request.idPropriedade,
          dataInicio: moment(data).format('YYYY-MM-DDTHH:mm:ssZ'),
          dataTermino: moment(dataFim).format('YYYY-MM-DDTHH:mm:ssZ'),
          statusVistoria: StatusVistoria.Agendado,
          vistoria: Vistoria.AguardandoVistoria,
        });
        const entity = await this.autoVistoriaRepository.save(autoVistoria);
        const vistoriaRequest = {
          territoryId: propriedade.territorios[0].codigoTerritorio,
          userId: pessoa.idUsuarioAgrotools,
          externalCode: entity.id.toString(),
          dateStart: entity.dataInicio,
          dateEnd: entity.dataTermino,
          scheduleName: propriedade.nomePropriedade,
        } as unknown as VistoriaAgrotools;

        const autoVistoriaResponse =
          await this.agrotoolsService.solicitarVistoria(vistoriaRequest);
        entity.codigoEvidencia = autoVistoriaResponse.cdEvidence;
        await this.autoVistoriaRepository.save(entity);

        const nomePropriedade = propriedade?.nomePropriedade;
        const proprietario = propriedade?.proprietarios[0].pessoa.nome;
        const telefone = propriedade?.proprietarios[0].pessoa.telefone;

        const dados = {
          produtor: proprietario,
          propriedade: nomePropriedade,
          carFederal: propriedade?.carFederal,
          telefone: telefone,
        };
        await this.mensagemService.enviarMensagemAutoVistoria(dados);

        await this.emailService.enviarEmailTemplate({
          recipients: [
            emails.length > 0 ? emails[0] : usuarioLogado.user.email,
          ],
          subject: 'Autovistoria agendada',
          template: new AutoVistoriaAgendadaTemplate({
            dataLimite: new Date(entity.dataTermino),
          }),
        });
      }
    } catch (error) {
      throw new NegocioException(error.status, error.message);
    }

    return {
      sucesso: true,
      mensagem: 'Dados atualizados com sucesso',
    };
  }

  async consultaInformacao(request: InformacaoVistoriaRequest) {
    const autoVistoria = await this.autoVistoriaRepository.findOne({
      where: { codigoEvidencia: request.id },
    });

    if (!autoVistoria) {
      throw new NegocioException(
        HttpStatus.NOT_FOUND,
        'Vistoria não encontrada.',
      );
    }

    const formulario: FormularioVistoriaResponse = JSON.parse(
      <string>autoVistoria.formulario,
    );
    if (formulario) {
      formulario.reportUrl = request.reportUrl;
      autoVistoria.formulario = JSON.stringify(formulario);
      await this.autoVistoriaRepository.save(autoVistoria);
    }

    return { sucesso: true, mensagem: 'Dados atualizados com sucesso' };
  }

  async consultaAutoVistoria(idPropriedade: number, user: any) {
    const query = this.autoVistoriaRepository.createQueryBuilder('at');
    query.innerJoinAndSelect('at.propriedade', 'propriedade');
    query.leftJoinAndSelect('at.documentos', 'documentos');
    query.leftJoinAndSelect('propriedade.proprietarios', 'proprietarios');
    query.leftJoinAndSelect('proprietarios.pessoa', 'pessoa');
    query.where('at.idPropriedade = :idPropriedade', {
      idPropriedade: idPropriedade,
    });

    if (user.roles.includes('PRODUTOR')) {
      query.andWhere('pessoa.email =:email', { email: user.email });
    }

    return await query.getMany();
  }

  async listarAutovistoria() {
    return await this.autoVistoriaRepository
      .createQueryBuilder('autoVistoria')
      .where('autoVistoria.formulario is NULL')
      .andWhere('autoVistoria.codigoEvidencia is NOT NULL')
      .getMany();
  }

  async atualizar(autoVistoria: AutoVistoriaEntity) {
    return await this.autoVistoriaRepository.update(
      autoVistoria.id,
      autoVistoria,
    );
  }

  async adicionarDias(data: Date, dias: number): Promise<Date> {
    const novaData = new Date(data);
    novaData.setDate(novaData.getDate() + dias);
    return novaData;
  }

  async criarParecerAutoVistoria(
    id: number,
    payload: UploadPayloadType<CriarParecerAutoVistoriaRequest>,
  ): Promise<AutoVistoriaEntity> {
    const autoVistoria = await this.autoVistoriaRepository.findOne({
      where: {
        id,
      },
    });

    if (!autoVistoria) {
      throw new BadRequestException('Auto vistoria não encontrada.');
    }

    if (autoVistoria.vistoria !== Vistoria.AguardandoVistoria) {
      throw new BadRequestException(
        'Não é possível criar um parecer para uma vistoria que não esteja com o status Aguardando Vistoria.',
      );
    }

    const documentos = await this.documentoUploadService.uploadFiles(
      payload.arquivos,
    );
    const documentosAutoVistoria = documentos.map((documento) => ({
      nomeArquivo: documento.filename,
      urlArquivo: documento.url,
      nomeArquivoOriginal: documento.originalName,
      tipo: payload.body.parametros.find(
        (param) => param.nome === documento.originalName,
      )?.tipo,
    }));

    const autoVistoriaAtualizado = await this.autoVistoriaRepository.save({
      ...autoVistoria,
      statusVistoria: StatusVistoria.Realizado,
      vistoria: payload.body.status,
      documentos: documentosAutoVistoria,
    });

    return autoVistoriaAtualizado;
  }
}
