import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Endereco } from '../endereco/entities/endereco.entity';
import { ResponsavelTecnicoController } from './responsavel-tecnico.controller';
import { ResponsavelTecnicoService } from './responsavel-tecnico.service';
import { ResponsavelTecnico } from './entities/responsavel-tecnico.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Endereco, ResponsavelTecnico]), HttpModule],
  controllers: [ResponsavelTecnicoController],
  providers: [ResponsavelTecnicoService],
})
export class ResponsavelTecnicoModule {}
