import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Address } from '../../domain/entities/address.entity';
import { IQueueService } from '../../domain/repositories/queue.service';

/**
 * implementação do serviço de mensageria utilizando bullMQ
 * gerencia a fila de persistencia para garantir processamento assincrono
 */
@Injectable()
export class BullMQQueueServiceImpl implements IQueueService {
  constructor(
    @InjectQueue('address-persistence') private readonly addressQueue: Queue
  ) {}

  /**
   * adiciona um endereço à fila para ser persistido no banco de dados
   * config com retries e backoff para lidar com falhas temporarias 
   */
  async addPersistenceJob(address: Address): Promise<void> {
    await this.addressQueue.add('save-address', address, {
      attempts: 3, // tenta processar ate 3 vezes em caso de erro
      backoff: {
        type: 'exponential', // aumenta o tempo de espera entre cada tentativa
        delay: 1000, // tempo inicial de 1 segundo
      },
      removeOnComplete: true, // remove o job da lista de completados para economizar mmemoria no redis
      removeOnFail: false, // mantem no redis em caso de falha total para auditoria
    });
  }
}