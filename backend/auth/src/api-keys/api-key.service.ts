import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHmac, randomBytes } from 'node:crypto';

import { ApiKey } from '@transcendence/db-entities';
import { CreateApiKeyResDto } from './dto/api-key/create-api-key-res.dto';
import authConfig from '../config/auth.config';
import type { ConfigType } from '@nestjs/config';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
  ) {}

  async getAllApiKeys(): Promise<ApiKey[]> {
    return this.apiKeyRepo.find();
  }

  async createApiKey(): Promise<CreateApiKeyResDto> {
    const token = randomBytes(32).toString('hex');
    const prefixedToken = `tr_${token}`;
    const hash = createHmac('sha256', this.config.apiKey.secret)
      .update(prefixedToken)
      .digest('hex');

    const expiresAt = new Date(Date.now() + Number(this.config.apiKey.expirySeconds) * 1000);

    const apiKey = this.apiKeyRepo.create({
      hash,
      expiresAt,
    });

    await this.apiKeyRepo.save(apiKey);

    return {
      id: apiKey.id,
      token: prefixedToken,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
    };
  }

  async validateApiKey(token: string): Promise<boolean> {
    const hash = createHmac('sha256', this.config.apiKey.secret)
      .update(token)
      .digest('hex');

    const apiKey = await this.apiKeyRepo.findOne({ where: { hash } });
    if (!apiKey) {
      return false;
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  async removeApiKeyById(id: string): Promise<{ deleted: true; id: string }> {
    const res = await this.apiKeyRepo.delete({ id });

    if (!res.affected) {
      throw new NotFoundException(`Api-key ${id} not found`);
    }

    return { deleted: true, id };
  }
}
