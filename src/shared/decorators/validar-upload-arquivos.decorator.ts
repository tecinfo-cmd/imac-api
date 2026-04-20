import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';

interface OpcoesValidarUploadArquivos {
  fieldName?: string;
  maxCount?: number;
}

export function ValidarUploadArquivos(opcoes?: OpcoesValidarUploadArquivos) {
  const fieldName = opcoes?.fieldName || 'arquivos';
  const maxCount = opcoes?.maxCount || 10;

  return applyDecorators(
    UseInterceptors(FilesInterceptor(fieldName, maxCount)),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fieldName]: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
              description: 'Arquivos a serem enviados (múltiplos arquivos permitidos).'
            },
          },
          parametros: {
            type: 'string',
            description: `String JSON representando um array de objetos. Cada objeto deve ter "nome" (string, nome original do arquivo) e "tipo" (string).
                          A ordem dos objetos no array JSON deve corresponder à ordem dos arquivos enviados no campo '${fieldName}'.
                          Exemplo de valor: '[{"nome": "documento1.pdf", "tipo": "CONTRATO"}, {"nome": "imagem_rg.jpg", "tipo": "RG_FRENTE"}]'`,
            example: '[{"nome": "escritura.pdf", "tipo": "ESCRITURA"}, {"nome": "rg_frente.jpg", "tipo": "RG_FRENTE"}]',
          },
        },
        required: [fieldName, 'parametros'],
      },
    }),
  );
}