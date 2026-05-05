export class Address {
  constructor(
    public readonly cep: string,
    public readonly logradouro: string,
    public readonly bairro: string,
    public readonly localidade: string,
    public readonly uf: string,
  ) {

    // verificando se cep é valido
    if (!/^\d{8}$/.test(cep)) {
      throw new Error('CEP inválido');
    }
  }
}