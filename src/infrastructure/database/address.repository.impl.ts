import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../../domain/entities/address.entity';
import { IAddressRepository } from '../../domain/repositories/address.repository';
import { AddressSchema } from './address.schema';

@Injectable()
export class AddressRepositoryImpl implements IAddressRepository {
  constructor(
    @InjectRepository(AddressSchema)
    private readonly repository: Repository<AddressSchema>,
  ) {}

  async findByCep(cep: string): Promise<Address | null> {
    const found = await this.repository.findOne({ where: { cep } });
    if (!found) return null;

    // converte de schema para entity(dominio)
    return new Address(
      found.cep,
      found.logradouro,
      found.bairro,
      found.localidade,
      found.uf,
    );
  }

  async save(address: Address): Promise<void> {
    // criando O objeto do banco a partir do domínio
    const schema = this.repository.create(address);
    await this.repository.save(schema);
  }
}