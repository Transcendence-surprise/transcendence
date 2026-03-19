import { Controller, Get, Post, Delete, Param, Query } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import {
  ApiKeyControllerDocs,
  GetApiKeysDocs,
  CreateApiKeyDocs,
  RemoveApiKeyDocs,
  ValidateApiKeyDocs,
} from './api-key.controller.docs';

@ApiKeyControllerDocs()
@Controller('auth/api-keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Get()
  @GetApiKeysDocs()
  getAllApiKeys() {
    return this.apiKeyService.getAllApiKeys();
  }

  @Post()
  @CreateApiKeyDocs()
  createApiKey() {
    return this.apiKeyService.createApiKey();
  }

  @Delete(':id')
  @RemoveApiKeyDocs()
  removeApiKeyById(@Param('id') id: string) {
    return this.apiKeyService.removeApiKeyById(id);
  }

  @Get('validate')
  @ValidateApiKeyDocs()
  validateApiKey(@Query('token') token: string) {
    return this.apiKeyService.validateApiKey(token);
  }
}
