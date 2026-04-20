import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pessoa } from '../entity/pessoa.entity';
import { SolicitacaoElegibilidade } from '../../elegibilidade/entities/solicitacao-elegibilidade.entity';
import { Propriedade } from '../../propriedade-prem/entities/propriedade.entity';
import { PropriedadeConsulta } from '../../elegibilidade/entities/consulta/propriedade-consulta.entity';
import { Proprietario } from '../../propriedade-prem/entities/proprietario.entity';
import { ProprietarioConsulta } from '../../elegibilidade/entities/consulta/proprietario-consulta.entity';

@Injectable()
export class PessoaService {

  constructor(
    @InjectRepository(Pessoa)
    private pessoaRepository: Repository<Pessoa>
  ){}

  async salvaPessoa(pessoa: Pessoa): Promise<Pessoa> {
    return await this.pessoaRepository.save(pessoa);
  }

  async buscaPessoaEmail(email: string): Promise<Pessoa> {
    const pessoa = await this.pessoaRepository.findOne({ where: { email }});
    if (!pessoa) {
      throw new NotFoundException('Pessoa não encontrado');
    }
    return pessoa;
  }

  async buscaPessoaEmailCadastro(email: string): Promise<Pessoa | null> {
    const pessoa = await this.pessoaRepository.findOne({ where: { email }});
    if (!pessoa) {
      return null;
    }
    return pessoa;
  }

  async buscaPessoaId(id: number): Promise<Pessoa> {
    const pessoa = await this.pessoaRepository.findOne({ where: { id }});
    if (!pessoa) {
      throw new NotFoundException('Pessoa não encontrado');
    }
    return pessoa;
  }

  async atualizarPessoa(pessoa: Pessoa){
    await this.pessoaRepository.update(pessoa.id, pessoa)
  }

  async buscaOuCadastra(solicitacao: SolicitacaoElegibilidade, proprietarios: ProprietarioConsulta[]): Promise<Pessoa> {
    const email = solicitacao.email;
    const pessoa = await this.pessoaRepository.findOne({ where: { email }});
    if (!pessoa) {
        const proprietario = proprietarios.find(p=> solicitacao.cpfCnpj.includes(p.cpfCnpj.replace("XXX",'')
          .replace("XX",'')))
        if(!proprietario){
          const pessoaCadastro = {cpf: solicitacao.cpfCnpj, email: email, nome: solicitacao.email.split('@')[0] }
          return await this.pessoaRepository.save(pessoaCadastro);
        }else{
          const pessoaCadastro = {cpf: solicitacao.cpfCnpj, email: email, nome: proprietario?.nome }
          return await this.pessoaRepository.save(pessoaCadastro);
        }

    }
    return pessoa;
  }


  async buscaOuCadastraPessoa(solicitacao: SolicitacaoElegibilidade): Promise<Pessoa> {
    const email = solicitacao.email;
    const pessoa = await this.pessoaRepository.findOne({ where: { email }});
    if (!pessoa) {
      const pessoaCadastro = {cpf: solicitacao.cpfCnpj, email: email, nome: email.split('@')[0]}
      return await this.pessoaRepository.save(pessoaCadastro);
    }
    return pessoa;
  }



}
