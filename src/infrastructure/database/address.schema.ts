import { Entity, Column, PrimaryColumn } from 'typeorm';

/*
    schema para a entidade de endereço
*/

@Entity('addresses')
export class AddressSchema {
  @PrimaryColumn()
  cep: string;

  @Column()
  logradouro: string;

  @Column()
  bairro: string;

  @Column()
  localidade: string;

  @Column()
  uf: string;
}