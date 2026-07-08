import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as process from 'process';
import { SolicitacaoElegibilidade } from './elegibilidade/entities/solicitacao-elegibilidade.entity';
import { ConfigModule } from '@nestjs/config';
import { Propriedade } from './propriedade-prem/entities/propriedade.entity';
import { Proprietario } from './propriedade-prem/entities/proprietario.entity';
import { Cidade } from './elegibilidade/entities/cidade.entity';
import { Usuario } from './usuario/entities/usuario.entity';
import { Endereco } from './endereco/entities/endereco.entity';
import { PropriedadeConsulta } from './elegibilidade/entities/consulta/propriedade-consulta.entity';
import { ProprietarioConsulta } from './elegibilidade/entities/consulta/proprietario-consulta.entity';
import { Pessoa } from './shared/entity/pessoa.entity';
import { CicloProducao } from './propriedade-prem/entities/ciclo-producao.entity';
import { AtividadePrincipal } from './propriedade-prem/entities/atividade-principal.entity';
import { RetornoAgrotools } from './elegibilidade/entities/retorno-agrotools.entity';
import { DeteccoesAgrotools } from './elegibilidade/entities/deteccoes-agrotools.entity';
import { PagamentoVoucher } from './elegibilidade/entities/pagamento-voucher.entity';
import { Auditoria } from './auditoria/entity/auditoria.entity';
import { Documento } from './shared/entity/documento.entity';
import { TokenRedefinicaoSenha } from './auth/entities/token-redefinicao-senha.entity';
import { Role } from './role/entities/role.entity';
import { TerritorioEntity } from './agrotools/entities/territorio.entity';
import { RetornoAnaliseEntity } from './agrotools/entities/retorno-analise.entity';
import { DeteccoesAnaliseEntity } from './agrotools/entities/deteccoes-analise.entity';
import { TokenPrimeiroAcesso } from './auth/entities/token-primeiro-acesso.entity';
import { ResponsavelTecnico } from './responsavel-tecnico/entities/responsavel-tecnico.entity';
import { AutoVistoriaEntity } from './propriedade-prem/auto-vistoria/entities/auto-vistoria.entity';
import { ContestacaoLaudo } from './propriedade-prem/analise-socioambiental/entities/contestacao-laudo.entity';
import { ContestacaoAutorizacaoSupressao } from './propriedade-prem/analise-socioambiental/entities/contestacao-autorizacao-supressao.entity';
import { OrgaoEmissorAutorizacaoSupressao } from './propriedade-prem/analise-socioambiental/entities/orgao-emissor-autorizacao-supressao.entity';
import { TipoAutorizacaoSupressao } from './propriedade-prem/analise-socioambiental/entities/tipo-autorizacao-supressao.entity';
import { PlanoAdequacao } from './propriedade-prem/analise-socioambiental/entities/plano-adequacao.entity';
import { AutorizacaoSupressao } from './propriedade-prem/analise-socioambiental/entities/autorizacao-supressao.entity';
import { PagamentoMulta } from './cobranca/entities/pagamento-multa.entities';
import { Frigorifico } from './frigorico/entities/frigorifico.entity';
import { VoucherEntity } from './frigorico/entities/voucher.entity';
import { DocumentoOrientativo } from './documento-orientativo/entity/documento-orientativo.entity';
import { ErroFuncionalidade } from './exception/erro-funcionalidade';

ConfigModule.forRoot();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.URL_DB,
  port: process.env.PORT_DB ? parseInt(process.env.PORT_DB, 10) : 25060,
  username: process.env.USER_DB,
  password: process.env.PASSWORD_DB,
  database: process.env.NAME_DB,
  schema: process.env.SCHEMA_DB,
  entities: [
    Auditoria,
    SolicitacaoElegibilidade,
    Propriedade,
    Proprietario,
    Endereco,
    Cidade,
    Usuario,
    Pessoa,
    PropriedadeConsulta,
    ProprietarioConsulta,
    CicloProducao,
    AtividadePrincipal,
    RetornoAgrotools,
    DeteccoesAgrotools,
    PagamentoVoucher,
    Documento,
    TokenRedefinicaoSenha,
    Role,
    TerritorioEntity,
    RetornoAnaliseEntity,
    DeteccoesAnaliseEntity,
    TokenPrimeiroAcesso,
    ResponsavelTecnico,
    ContestacaoAutorizacaoSupressao,
    TipoAutorizacaoSupressao,
    OrgaoEmissorAutorizacaoSupressao,
    ContestacaoLaudo,
    ResponsavelTecnico,
    AutoVistoriaEntity,
    PlanoAdequacao,
    AutorizacaoSupressao,
    PagamentoMulta,
    Frigorifico,
    VoucherEntity,
    DocumentoOrientativo,
    ErroFuncionalidade,
  ],
  migrations: process.env.SET_MIGRATION_PATH
    ? ['src/migrations/*.ts']
    : undefined,
  ssl: {
    ca: fs.readFileSync('ca-certificate.crt'),
  },
  synchronize: false,
  extra: {
    postgis: true,
  },
});
