import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { Address } from '../../domain/entities/address.entity';
import { ICacheService } from '../../domain/repositories/cache.service';


/* 
    implementando o serviço de cache usando o redis
*/
@Injectable()
export class RedisServiceImpl implements ICacheService {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    });
  }

  // implementando o metodo de busca
  async get(key: string): Promise<Address | null> {
    // buscando o valor no redis
    const data = await this.redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as Address;
  }

  // implementando o metodo de persistencia
  async set(key: string, value: Address, ttl: number): Promise<void> {
    // armazenando o valor no redis com um tempo de expiração
    await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
  }
}