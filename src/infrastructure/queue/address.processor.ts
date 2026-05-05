import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Address } from '../../domain/entities/address.entity';
import type { IAddressRepository } from '../../domain/repositories/address.repository';
import type { ICacheService } from '../../domain/repositories/cache.service';
import { Inject } from '@nestjs/common';

@Processor('address-persistence')
export class AddressProcessor extends WorkerHost {
  constructor(
    @Inject('IAddressRepository') private readonly addressRepository: IAddressRepository,
    @Inject('ICacheService') private readonly cacheService: ICacheService,
  ) {
    super();
  }

  async process(job: Job<Address>): Promise<void> {
    const addressData = job.data;

    // regra de idempotência, verifica se já existe
    const existing = await this.addressRepository.findByCep(addressData.cep);
    
    if (!existing) {
      // salva no banco (Fonte da verdade)
      await this.addressRepository.save(addressData);
    }

    // atualiza e garante o cache com um TTL de 1h (1 hora = 3600s)
    await this.cacheService.set(addressData.cep, addressData, 3600);
    
    console.log(`CEP ${addressData.cep} processado com sucesso.`);
  }
}