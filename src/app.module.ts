import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';

// import da pasta de infraestrutura
import { AddressSchema } from './infrastructure/database/address.schema';
import { AddressRepositoryImpl } from './infrastructure/database/address.repository.impl';
import { RedisServiceImpl } from './infrastructure/cache/redis.service.impl';
import { ViaCepGatewayImpl } from './infrastructure/gateways/viacep.gateway.impl';
import { BullMQQueueServiceImpl } from './infrastructure/queue/bullmq-queue.service.impl';
import { AddressProcessor } from './infrastructure/queue/address.processor';
import { AddressController } from './infrastructure/http/address.controller';

// Importações de Aplicação
import { GetAddressUseCase } from './application/use-cases/get-address.use-case';

@Module({
  imports: [
    ConfigModule.forRoot(),
    // config do banco relacional
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      username: 'user',
      password: 'password',
      database: 'cep_database',
      entities: [AddressSchema],
      synchronize: true, // apanas para o teste, cria as tabelas automaticamente
    }),
    TypeOrmModule.forFeature([AddressSchema]),
    // config do redis/fila
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'address-persistence',
    }),
  ],
  controllers: [AddressController],
  providers: [
    {
      provide: 'IAddressRepository',
      useClass: AddressRepositoryImpl,
    },
    {
      provide: 'ICacheService',
      useClass: RedisServiceImpl,
    },
    {
      provide: 'IViaCepGateway',
      useClass: ViaCepGatewayImpl,
    },
    {
      provide: 'IQueueService',
      useClass: BullMQQueueServiceImpl,
    },
    {
      provide: GetAddressUseCase,
      useFactory: (cache, repo, viacep, queue) => 
        new GetAddressUseCase(cache, repo, viacep, queue),
      inject: ['ICacheService', 'IAddressRepository', 'IViaCepGateway', 'IQueueService'],
    },
    AddressProcessor,
  ],
})
export class AppModule {}