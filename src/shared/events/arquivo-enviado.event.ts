export class ArquivoEnviadoEvent{
  constructor(
    readonly produtorEmail: string,
    readonly produtorNome: string,
    readonly analistaEmail: string,
    readonly analistaNome: string,
    readonly nomeArquivo: string,
    readonly tipoArquivo: string,
    readonly remetente: 'PRODUTOR' | 'ANALISTA',
    readonly nomePropriedade?: string
  ){}
}

