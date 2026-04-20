export const Etapas = {
  Credenciamento: "Credenciamento",
  Cadastro: "Cadastro",
  AnaliseSocioambiental: "Análise Socioambiental",
  Contestacao: "Contestação",
  Estrategia: "Estratégia",
  Plano: "Plano",
  Termo: "Termo",
  Multa: "Multa",
  Autovistoria: "Autovistoria",
  AutorizacaoDeComercializacao: "Autorização de Comercialização",
  Desativada: "Desativada"
} as const;

export const StatusEtapas = {
  Credenciamento: {
    VoucherPendente: "Voucher Crendenciamento pendente",
  },
  Cadastro: {
    CadastroIncompleto: "Cadastro incompleto",
    CadastroCompleto: "Cadastro completo",
  },
  AnaliseSocioambiental: {
    AnaliseSolicitada: "Análise solicitada",
    AnaliseDisponivel: "Análise disponível",
  },
  Contestacao: {
    ContestacaoSolicitada: "Contestação Solicitada",
    ContestacaoPendente: "Contestação Pendente",
    ContestacaoAnalisada: "Contestação Analisada",
  },
  Estrategia: {
    Solicitada: "Estratégia Solicitada",
    Pendente: "Estratégia Pendente",
    Analisada: "Estratégia Analisada",
  },
  Plano: {
    Solicitado: "Plano Solicitado",
    Disponivel: "Plano Disponível",
  },
  Termo: {
    Enviado: "Termo Enviado",
    Assinado: "Termo Assinado",
  },
  Multa: {
    MultaDisponivel: "Multa disponível",
  },
  Autovistoria: {
    Disponivel: "Autovistoria Disponível",
    Realizado: "Autovistoria Realizado",
    NaoRealizado: "Autovistoria Não realizado",
  },
  AutorizacaoDeComercializacao: {
    Vigente: "Autorização de Comercialização Vigente",
    Expirada: "Autorização de Comercialização Expirada",
  },
  Frigorifico: {
    Pendente: "Voucher Frigorifico pendente",
    Ativado: "Ativado Frigorifico",
  },
  Desativada: {
    Inativa: "Inativa",
  }
} as const;

export type Etapa = keyof typeof Etapas;
export type StatusPorEtapa<E extends Etapa> = typeof StatusEtapas[E][keyof typeof StatusEtapas[E]];
