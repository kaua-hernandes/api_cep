import {Address} from "../entities/address.entity";


// interface para o serviço de cache
export interface ICacheService {
    set(key: string, value: Address, ttl:number): Promise<void>;
    get(key: string): Promise<Address | null>;
}