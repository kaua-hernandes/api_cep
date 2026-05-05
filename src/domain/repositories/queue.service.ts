import { Address } from '../entities/address.entity';

/* 
    interface para o serviço de fila
*/
export interface IQueueService {
  addPersistenceJob(address: Address): Promise<void>;
}