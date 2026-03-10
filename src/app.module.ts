import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ElegibilidadeModule } from './elegibilidade/elegibilidade.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { RequestsLogMiddleware } from './middleware/requests-log-middleware';
import { randomUUID } from 'crypto';
import { AppDataSource } from './app.data-source';
import { EmailService } from './email/email.service';
import { PropriedadeModule } from './upload/propriedade.module';
import { AgrotoolsModule } from './agrotools/agrotools.module';
import { UsuarioModule } from './usuario/usuario.module';
import { AuthModule } from './auth/auth.module';
import { EnderecoModule } from './endereco/endereco.module';
import { PropriedadePremModule } from './propriedade-prem/propriedade-prem.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AuditRequestsMiddleware } from './middleware/audit-requests.middleware';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { RoleModule } from './role/role.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TimeoutInterceptor } from './interceptor/timeout-interceptor';
import { ResponsavelTecnicoModule } from './responsavel-tecnico/responsavel-tecnico.module';
import { CobrancaModule } from './cobranca/cobranca.module';
import { FrigorificoModule } from './frigorico/frigorifico.module';
import { PdfModule } from './pdf/pdf.module';
import { AssinaturaModule } from './assinatura/assinatura.module';
import { DocumentosOrientativosModule } from './documento-orientativo/documentos-orientativos.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventListener } from './shared/event-listener';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      useFactory: async () => ({
        pinoHttp: {
          autoLogging: false,
          base: null,
          quietReqLogger: true,
          genReqId: () => randomUUID().toString(),
          level: 'debug',
        },
      }),
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    HttpModule.register({
      timeout: 60000,
      maxRedirects: 5
    }),
    ElegibilidadeModule,
    TypeOrmModule.forRoot(AppDataSource.options),
    PropriedadeModule,
    AgrotoolsModule,
    UsuarioModule,
    AuthModule,
    EnderecoModule,
    AuditoriaModule,
    PropriedadePremModule,
    ScheduleModule.forRoot(),
    RoleModule,
    CobrancaModule,
    ResponsavelTecnicoModule,
    FrigorificoModule,
    ResponsavelTecnicoModule,
    PdfModule,
    AssinaturaModule,
    DocumentosOrientativosModule,
    SharedModule
  ],
  providers: [AppService, Logger, EmailService,
    {
      provide: APP_INTERCEPTOR,
      useFactory: (configService: ConfigService) => {
        const timeoutInMilliseconds: number = parseInt(configService.get<any>('TIMEOUT_IN_MILLISECONDS', 60000));
        return new TimeoutInterceptor(timeoutInMilliseconds);
      },
      inject: [ConfigService],
    }
  ],
})
export class AppModule {
  constructor(private readonly auditMiddleware: AuditRequestsMiddleware) {}
  
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestsLogMiddleware).forRoutes('*');
    consumer.apply(this.auditMiddleware.use.bind(this.auditMiddleware)).forRoutes('*');
  }
}
