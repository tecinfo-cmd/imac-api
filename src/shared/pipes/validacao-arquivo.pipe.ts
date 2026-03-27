import { BadRequestException, PipeTransform, Injectable } from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance, ClassConstructor } from 'class-transformer';

@Injectable()
export class ValidacaoArquivoPipe implements PipeTransform {
  async transform(valor: {
    body: any;
    arquivos: Express.Multer.File[];
    dtoClass: ClassConstructor<unknown>;
  }) {
    const { arquivos, body, dtoClass } = valor;

    const parsedBody = this.parseStringJsonFields(body);

    const dtoInstance = plainToInstance(dtoClass, parsedBody);
    const errors: ValidationError[] = await validate(dtoInstance as object);

    if (errors.length > 0) {
      const errorMessages = this.formatErrors(errors);
      throw new BadRequestException(errorMessages);
    }

    parsedBody.poligonos.forEach(p => {
      if (p.tipoDeteccao == 2 && (p.wkt == null || p.wkt == '')){
        throw new BadRequestException(
          'Wkt obrigatório para o tipo Detecção Parcial ',
        );
      }
    })

    if (!arquivos || arquivos.length === 0) {
      throw new BadRequestException(
        'Nenhum arquivo enviado. Por favor, inclua pelo menos um arquivo.',
      );
    }

    const parametros = parsedBody.parametros;

    if (!parametros || !Array.isArray(parametros) || parametros.length === 0) {
      throw new BadRequestException(
        'Os parâmetros dos arquivos (JSON) são obrigatórios e devem ser um array não vazio.',
      );
    }

    const parametrosValidos = parametros.every(
      (p) =>
        typeof p.nome === 'string' &&
        p.nome.trim() !== '' &&
        typeof p.tipo === 'string' &&
        p.tipo.trim() !== '',
    );

    if (!parametrosValidos) {
      throw new BadRequestException(
        'Cada parâmetro de arquivo deve conter um "nome" e um "tipo" válidos.',
      );
    }

    const parametrosComNomeDuplicado = parametros.some((p, index) => {
      return parametros.slice(index + 1).some((p2) => p2.nome === p.nome);
    });

    if (parametrosComNomeDuplicado) {
      throw new BadRequestException(
        'Não pode haver parâmetros de arquivos com nomes duplicados.',
      );
    }

    const arquivosTemTipo = arquivos.every((arquivo) =>
      parametros.some(
        (parametro) =>
          this.getnome(parametro.nome).toUpperCase() ==
          this.getnome(arquivo.originalname).toUpperCase(),
      ),
    );

    if (!arquivosTemTipo) {
      const arquivosSemParametro = arquivos.filter(
        (arquivo) =>
          !parametros.some((param) => param.nome === arquivo.originalname),
      );
      throw new BadRequestException(
        `Um ou mais arquivos não possuem parâmetros correspondentes: ${arquivosSemParametro.map((f) => f.originalname).join(', ')}`,
      );
    }

    return {
      body: dtoInstance,
      arquivos,
    };
  }

  private parseStringJsonFields(body: any) {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const newBody = { ...body };

    for (const key in newBody) {
      if (Object.prototype.hasOwnProperty.call(newBody, key)) {
        const value = newBody[key];
        if (typeof value === 'string') {
          try {
            const parsedValue = JSON.parse(value);
            if (typeof parsedValue === 'object' || Array.isArray(parsedValue)) {
              newBody[key] = parsedValue;
            }
          } catch (e) {}
        }
      }
    }

    return newBody;
  }

  private formatErrors(errors: ValidationError[], parent = ''): string[] {
    let errorMessages: string[] = [];
    for (const error of errors) {
      if (error.constraints) {
        errorMessages = errorMessages.concat(Object.values(error.constraints));
      }
      if (error.children && error.children.length > 0) {
        const newParent = parent
          ? `${parent}.${error.property}`
          : error.property;
        errorMessages = errorMessages.concat(
          this.formatErrors(error.children, newParent),
        );
      }
    }
    return errorMessages;
  }

  getnome(valor: string): string {
    const formatado = valor
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace('pdf', '')
      .replace('png', '')
      .replace('jpg', '');
    return formatado.replace('pdf', '').replace('png', '').replace('jpg', '');
  }
}
