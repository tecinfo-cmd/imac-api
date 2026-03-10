import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auditoria } from "./entity/auditoria.entity";

@Injectable()
export class AuditoriaService {
    constructor(
        @InjectRepository(Auditoria)
        private auditoriaRepository: Repository<Auditoria>,
    ) { }

    async create(data: Partial<Auditoria>): Promise<void> {
        await this.auditoriaRepository.save(data);
    }
}