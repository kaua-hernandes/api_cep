import {Address} from "../entities/address.entity";

/* 
    interface para o gateway de consulta ao ViaCEP
*/
export interface IViaCepGateway {
    fetch(cep: string): Promise<Address | null>;
}