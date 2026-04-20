import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponsavelTecnico } from './entities/responsavel-tecnico.entity';
import { ConsultaResponsavelTecnicoRequest } from './dto/consulta-responsavel-tecnico-request';
import { CriarResponsavelTecnicoRequest } from './dto/criar-responsavel-tecnico-request';

@Injectable()
export class ResponsavelTecnicoService {
    constructor(
        @InjectRepository(ResponsavelTecnico)
        private responsavelTecnicoRepository: Repository<ResponsavelTecnico>,
    ) {
    }

    async criar(responsavelTecnico: CriarResponsavelTecnicoRequest): Promise<ResponsavelTecnico> {
        const responsavelTecnicoEncontrado = await this.responsavelTecnicoRepository.findOneBy([{ cpf: responsavelTecnico.cpf }, { email: responsavelTecnico.email }])

        if (responsavelTecnicoEncontrado) {
            throw new BadRequestException("Responsável Técnico já cadastrado")
        }

        return this.responsavelTecnicoRepository.save(responsavelTecnico);
    }

    async consultaResponsavelTecnicoFiltro(
        filtro: ConsultaResponsavelTecnicoRequest,
        page = 1,
        size = 10
    ) {
        const query = this.responsavelTecnicoRepository.createQueryBuilder('rt');

        query.orderBy('rt.nome', 'ASC');

        query.leftJoinAndSelect('rt.endereco', 'endereco');

        if (filtro.cpf) {
            query.where('LOWER(rt.cpf) LIKE :cpf', {
                cpf: `%${filtro.cpf}%`,
            });
        }

        if (filtro.email) {
            query.andWhere('LOWER(rt.email) LIKE :email', {
                email: `%${filtro.email.toLowerCase()}%`,
            });
        }

        if (filtro.municipio) {
            query.andWhere('LOWER(endereco.municipio) LIKE :municipio', {
                municipio: `%${filtro.municipio.toLowerCase()}%`,
            });
        }

        if (filtro.profissao) {
            query.andWhere('LOWER(rt.profissao) LIKE :profissao', {
                profissao: `%${filtro.profissao.toLowerCase()}%`,
            });
        }

        query.skip((page - 1) * size).take(size);

        try {
            return query.getManyAndCount();
        } catch (e) {
            throw new InternalServerErrorException(e.message)
        }
    }
}
