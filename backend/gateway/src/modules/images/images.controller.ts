import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
  Res,
  HttpCode,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { ImagesHttpService } from './images.service';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesClient: ImagesHttpService) {}

  @Get()
  async findAll(@Res() res: FastifyReply) {
    const result = await this.imagesClient.findAll();
    return res.status(result.statusCode).send(result.data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: FastifyReply) {
    const result = await this.imagesClient.findOne(Number(id));
    return res.status(result.statusCode).send(result.data);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() body: unknown, @Res() res: FastifyReply) {
    const result = await this.imagesClient.create(body);
    return res.status(result.statusCode).send(result.data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: unknown, @Res() res: FastifyReply) {
    const result = await this.imagesClient.update(Number(id), body);
    return res.status(result.statusCode).send(result.data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: FastifyReply) {
    const result = await this.imagesClient.remove(Number(id));
    return res.status(result.statusCode).send(result.data);
  }
}
