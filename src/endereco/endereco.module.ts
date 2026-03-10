import { Module } from '@nestjs/common';
import { EnderecoService } from './endereco.service';
import { HttpModule } from '@nestjs/axios';
import { Endereco } from './entities/endereco.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Endereco]), HttpModule],
  controllers: [],
  providers: [EnderecoService],
})
export class EnderecoModule {}
