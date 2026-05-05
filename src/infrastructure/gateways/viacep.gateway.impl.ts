import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Address } from '../../domain/entities/address.entity';
import { IViaCepGateway } from '../../domain/repositories/viacep.gateway';

@Injectable()
export class ViaCepGatewayImpl implements IViaCepGateway {
  // pegando url do .env
  private readonly baseUrl = process.env.VIA_CEP_BASE_URL || 'https://viacep.com.br/ws';

  async fetch(cep: string): Promise<Address | null> {
    try {
      console.log('base URL:', this.baseUrl);

      // para remover caracter não numerico
      const cleanCep = cep.replace(/\D/g, '');
      const { data } = await axios.get(`${this.baseUrl}/${cleanCep}/json/`, {
        timeout: 5000
      });

      if (data.erro) return null;

      // retorna a entidade de domínio
      return new Address(
        data.cep.replace('-', ''),
        data.logradouro,
        data.bairro,
        data.localidade,
        data.uf,
      );
    } catch (error) {
      // msg generica de erro
      console.error('Error fetching address from ViaCEP:', error);
      return null;
    }
  }
}