import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';

interface OpcoesValidarUploadArquivos {
  fieldName?: string;
  maxCount?: number;
}

export function ValidarUploadTermo(opcoes?: OpcoesValidarUploadArquivos) {
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
              description: 'Arquivo a ser enviado.',
            },
          },
          parametros: {
            type: 'string',
            description: `dados do frigorifico' {
                'razaoSocial': 'nome frigorifico',
                'nomeFantasia': 'nome fantasia',
                'ie': 'codigo ie',
                'cnpj': '000003332211',
                'telefone': '6192468859',
                'cep': '71680384',
                'endereco': 'Q 04',
                'municipio': 'Cuiaba',
                'quantidadeVoucher': 100,
                'email':'frigorifico@gmail.com',
                'dataInicioVigencia':'2025-01-01',
                'dataFimVigencia':'2025-12-30'
              },`,
            example:
              {
                'razaoSocial': 'nome frigorifico',
                'nomeFantasia': 'nome fantasia',
                'ie': 'codigo ie',
                'cnpj': '000003332211',
                'telefone': '6192468859',
                'cep': '71680384',
                'endereco': 'Q 04',
                'municipio': 'Cuiaba',
                'quantidadeVoucher': 100,
                'email':'frigorifico@gmail.com',
                'dataInicioVigencia':'2025-01-01',
                'dataFimVigencia':'2025-12-30'
              },
          },
        },
        required: [fieldName, 'parametros'],
      },
    }),
  );
}
