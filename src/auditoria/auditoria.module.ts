import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auditoria } from './entity/auditoria.entity';
import { AuditoriaService } from './auditoria.service';
import { AuditRequestsMiddleware } from 'src/middleware/audit-requests.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Auditoria]), HttpModule],
  controllers: [],
  providers: [AuditoriaService, AuditRequestsMiddleware],
  exports: [AuditoriaService, AuditRequestsMiddleware],
})
export class AuditoriaModule {}
