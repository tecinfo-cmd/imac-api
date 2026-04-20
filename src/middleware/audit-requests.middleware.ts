import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuditoriaService } from 'src/auditoria/auditoria.service';

@Injectable()
export class AuditRequestsMiddleware implements NestMiddleware {
  constructor(private auditoriaService: AuditoriaService) { }

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    const originalSend = res.send.bind(res);
    let responseBody: any;

    res.send = (body: any) => {
      responseBody = body;
      return originalSend(body);
    };

    res.on('finish', () => {
      const duration = Date.now() - start;
      const status = res.statusCode;
      const isError = status >= 400;

      const auditoria = {
        idRequest: req.id.toString(),
        metodo: req.method.toUpperCase(),
        url: req.originalUrl,
        baseUrl: req.baseUrl,
        caminho: req.path,
        statusHttp: status,
        ipOrigem: req.ip,
        userAgent: req.headers['user-agent'],
        tipoConteudo: req.headers['content-type'],
        autorizacao: req.headers['authorization'],
        parametrosQuery: req.query,
        parametrosRota: req.params,
        corpoRequisicao: req.body,
        corpoResposta: responseBody,
        erro: isError ? responseBody : null,
        duracaoMs: duration,
        dataHora: new Date(this.getCuiabaFormattedTimestamp())
      };

      this.auditoriaService.create(auditoria);
    });

    next();
  }

  private filterDataByMaxLength(data: string): string {
    return data.length <= 10000 ? data : '*too long*';
  }

  private safeStringify(data: any): string {
    try {
      return typeof data === 'string' ? data : JSON.stringify(data);
    } catch {
      return '*unserializable*';
    }
  }

  private getCuiabaFormattedTimestamp(): string {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Cuiaba',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const parts = formatter.formatToParts(new Date());
    const data: any = {};

    for (const part of parts) {
      if (part.type !== 'literal') {
        data[part.type] = part.value;
      }
    }

    return `${data.year}-${data.month}-${data.day}T${data.hour}:${data.minute}:${data.second}`;
  }
}
