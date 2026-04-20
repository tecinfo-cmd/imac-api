import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEnderecoDto } from './dto/create-endereco.dto';
import { UpdateEnderecoDto } from './dto/update-endereco.dto';
import { Endereco } from './entities/endereco.entity';

@Injectable()
export class EnderecoService {
  constructor(
    @InjectRepository(Endereco)
    private enderecoRepository: Repository<Endereco>,
  ) {}

  async create(data: CreateEnderecoDto): Promise<Endereco> {
    const endereco = this.enderecoRepository.create(data);
    return this.enderecoRepository.save(endereco);
  }

  async findAll(): Promise<Endereco[]> {
    return this.enderecoRepository.find();
  }

  async findOne(id: number): Promise<Endereco> {
    const endereco = await this.enderecoRepository.findOne({ where: { id } });
    if (!endereco) {
      throw new NotFoundException(`Endereço com ID ${id} não encontrado`);
    }
    return endereco;
  }

  async update(id: number, data: UpdateEnderecoDto): Promise<Endereco> {
    await this.enderecoRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.enderecoRepository.delete(id);
  }
}
