import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proprietario } from './entities/proprietario.entity';
import { PessoaService } from '../shared/service/pessoa.service';
import { Pessoa } from '../shared/entity/pessoa.entity';
import { plainToInstance } from 'class-transformer';
import { ProprietarioRequest } from './dto/proprietario-request';
import NegocioException from '../exception/negocio-exception';
import { ProprietarioProprietarioRequest } from './request/proprietario-proprietario-request';

@Injectable()
export class ProprietarioPremService {
  constructor(
    @InjectRepository(Proprietario)
    private proprietarioRepository: Repository<Proprietario>,
    private readonly pessoaService: PessoaService,
  ) {
  }

  async cadastraProprietario(data: ProprietarioRequest) {
    try {
      if (!data.pessoa.id) {
        const pessoa = await this.pessoaService.salvaPessoa(data.pessoa);
        data.pessoa = pessoa;
        const proprietario = plainToInstance(Proprietario, data);
        return await this.proprietarioRepository.save(proprietario);
      } else {
        const proprietario = plainToInstance(Proprietario, data);
        return await this.proprietarioRepository.save(proprietario);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async cadastraAtualizaProprietario(
    proprietarioRequest: ProprietarioProprietarioRequest,
  ) {
    try {
      if (!proprietarioRequest.tipoProprietario) {
        throw new NegocioException(422, 'Tipo Proprietario obrigatório');
      }

      if (proprietarioRequest.idProprietario) {
        const proprietarioUpdate = await this.consultaProprietarioPorId(
          proprietarioRequest.idProprietario,
        );
        if (!proprietarioUpdate) {
          throw new NegocioException(
            404,
            'Proprietario não encontradao na base',
          );
        }
        const pessoa = await this.pessoaService.buscaPessoaId(
          proprietarioUpdate.pessoa.id,
        );
        pessoa.telefone = proprietarioRequest.telefone;
        pessoa.nome = proprietarioRequest.nome;
        pessoa.dataNascimento = proprietarioRequest.dataNascimento;
        pessoa.rgInscricaoSocial = proprietarioRequest.rgInscricaoSocial;
        await this.pessoaService.atualizarPessoa(pessoa);
        proprietarioUpdate.tipoProprietario = proprietarioRequest.tipoProprietario;
        proprietarioUpdate.pessoa = pessoa;
        proprietarioUpdate.telefone = proprietarioRequest.telefone;

        await this.proprietarioRepository.update(
          proprietarioUpdate.id,
          proprietarioUpdate,
        );
        return proprietarioUpdate;
      } else {
        const pessoa = await this.pessoaService.buscaPessoaEmailCadastro(
          proprietarioRequest.email,
        );
        if (pessoa) {
          const proprietario = {
            pessoa: pessoa,
            tipoProprietario: proprietarioRequest.tipoProprietario,
          };
          return await this.proprietarioRepository.save(proprietario);
        } else {
          const pessoa = {
            nome: proprietarioRequest.nome,
            email: proprietarioRequest.email,
            telefone: proprietarioRequest.telefone,
            cpfCnpj: this.somenteNumeros(proprietarioRequest.cpfCnpj),
            rgInscricaoSocial: proprietarioRequest.rgInscricaoSocial,
            dataNascimento: proprietarioRequest.dataNascimento,
          } as Pessoa;
          const pessoaSave = await this.pessoaService.salvaPessoa(pessoa);
          const proprietario = {
            pessoa: pessoaSave,
            tipoProprietario: proprietarioRequest.tipoProprietario,
          };
          return await this.proprietarioRepository.save(proprietario);
        }
      }
    } catch (error) {
      throw new NegocioException(422, error?.message);
    }
  }

  async consultaProprietarioPorId(id: number) {
    return await this.proprietarioRepository
      .createQueryBuilder('proprietario')
      .leftJoinAndSelect('proprietario.pessoa', 'pessoa')
      .where('proprietario.id = :id', { id })
      .getOne();
  }

  async consultaProprietario(email: string) {
    return await this.proprietarioRepository
      .createQueryBuilder('proprietario')
      .leftJoinAndSelect('proprietario.pessoa', 'pessoa')
      .where('pessoa.email = :email', { email })
      .getOne();
  }

  async buscarProprietario(email: string) {
    try {
      const proprietario = await this.proprietarioRepository
        .createQueryBuilder('proprietario')
        .leftJoinAndSelect('proprietario.pessoa', 'pessoa')
        .where('pessoa.email = :email', { email })
        .getOne();
      if (!proprietario) {
        throw new BadRequestException('Proprietario não encontrado');
      }
      return proprietario;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  somenteNumeros(cpf) {
    const numeros = cpf.toString().replace(/\.|-/gm, '');
    if (numeros.length === 11) return numeros;

    return 'cpf inválido';
  }
}
