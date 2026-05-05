import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetAddressUseCase } from '../../application/use-cases/get-address.use-case';


@ApiTags('Addresses')
@Controller('address')
export class AddressController {
  // injetando o caso de uso
  constructor(private readonly getAddressUseCase: GetAddressUseCase) {}

  /* 
    endpoint para buscar um endereço pelo CEP
  */
  @Get(':cep')
  @ApiOperation({ summary: 'Consulta endereço por CEP com Lazy Load' })
  @ApiResponse({ status: 200, description: 'Endereço encontrado com sucesso!!' })
  @ApiResponse({ status: 404, description: 'CEP não encontrado!!' })
  async getAddress(@Param('cep') cep: string) {
    try {
      const address = await this.getAddressUseCase.execute(cep);
      return address;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}