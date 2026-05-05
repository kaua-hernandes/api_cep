import { Address } from '../../domain/entities/address.entity';
import { IAddressRepository } from '../../domain/repositories/address.repository';
import { ICacheService } from '../../domain/repositories/cache.service';
import { IViaCepGateway } from '../../domain/repositories/viacep.gateway';
import { IQueueService } from '../../domain/repositories/queue.service';

export class GetAddressUseCase {
  constructor(
    private readonly cacheService: ICacheService,
    private readonly addressRepository: IAddressRepository,
    private readonly viaCepGateway: IViaCepGateway,
    private readonly queueService: IQueueService,
  ) {}

  async execute(cep: string): Promise<Address> {
    const cleanCep = cep.replace(/\D/g, '');

    // primeiro vai tentar o cache
    const cached = await this.cacheService.get(cleanCep);
    if (cached) {
      console.log(`REDIS: Cache Hit: ${cleanCep}`);
      return cached;
    }

    // segundo tenta o banco de dados
    const dbAddress = await this.addressRepository.findByCep(cleanCep);
    if (dbAddress) {
      console.log(`DATABASE: Encontrado no Postgres: ${cleanCep}`);
      await this.cacheService.set(cleanCep, dbAddress, 3600);
      return dbAddress;
    }

    // depos tenta o viaCEP
    const remoteAddress = await this.viaCepGateway.fetch(cleanCep);
    console.log(`VIA_CEP: CEP não encontrado, buscou na API: ${cleanCep}`);
    if (!remoteAddress) {
      throw new Error('CEP não encontrado');
    }


    /*
      persistencia assincrona
      adiciona na fila e retorna em imediato para o usuario
    */
    console.log(`QUEUE: Enviando CEP ${cleanCep} para fila de persistência...`);
    await this.queueService.addPersistenceJob(remoteAddress);

    return remoteAddress;
  }
}