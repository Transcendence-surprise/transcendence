import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Req
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { MatchesHttpService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesClient: MatchesHttpService) {}

  @Get()
  async getMatches(@Req() req: FastifyRequest) {
    return this.matchesClient.findAll(req);
  }

  @Get(':id')
  async getMatch(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.matchesClient.findOne(Number(id), req);
  }

  @Post()
  async createMatch(@Body() body: unknown, @Req() req: FastifyRequest) {
    return this.matchesClient.create(body, req);
  }

  @Put(':id')
  async updateMatch(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() req: FastifyRequest,
  ) {
    return this.matchesClient.update(Number(id), body, req);
  }

  @Patch(':id')
  async partialUpdateMatch(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() req: FastifyRequest,
  ) {
    return this.matchesClient.partialUpdate(Number(id), body, req);
  }

  @Delete(':id')
  async removeMatch(@Param('id') id: string, @Req() req: FastifyRequest) {
    return this.matchesClient.remove(Number(id), req);
  }
}
