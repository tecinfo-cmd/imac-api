import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventListener } from './event-listener';
import { Usuario } from '../usuario/entities/usuario.entity';
import { EmailService } from '../email/email.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
  ],
  providers: [EventListener, EmailService],
  exports: [EventListener],
})
export class SharedModule {}