import { Address } from "../entities/address.entity";


// interface para o repositorio de endereço
export interface IAddressRepository {
    save(address: Address): Promise<void>;
    findByCep(cep: string): Promise<Address | null>;
}