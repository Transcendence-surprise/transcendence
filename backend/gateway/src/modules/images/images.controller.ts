import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
  Res,
  Req,
  HttpCode,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ImagesHttpService } from './images.service';
import { Auth, AuthType } from 'src/common/decorator/auth-type.decorator';
import { Roles } from 'src/common/decorator/roles.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

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

  @Get(':id/content')
  async getContent(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: FastifyReply,
  ) {
    return this.proxyContent(id, res);
  }

  private async proxyContent(id: number, res: FastifyReply) {
    const upstream = await this.imagesClient.getContent(id);
    const upstreamHeaders = upstream.headers as Record<string, unknown>;

    const allowedHeaders = [
      'content-type',
      'content-length',
      'content-disposition',
      'cache-control',
      'etag',
      'last-modified',
    ];

    for (const header of allowedHeaders) {
      const value = upstreamHeaders[header];
      if (typeof value === 'string') {
        res.header(header, value);
      }
    }

    return res.status(upstream.status).send(upstream.data);
  }

  @Post()
  @Auth(AuthType.JWT_OR_API_KEY)
  @Roles(['user', 'admin'])
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(201)
  async create(
    @Body() body: unknown,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    const result = await this.imagesClient.create(body, req);
    return res.status(result.statusCode).send(result.data);
  }

  @Patch(':id')
  @Auth(AuthType.JWT_OR_API_KEY)
  @Roles(['admin'])
  @UseGuards(AuthGuard, RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    const result = await this.imagesClient.update(Number(id), body, req);
    return res.status(result.statusCode).send(result.data);
  }

  @Delete(':id')
  @Auth(AuthType.JWT_OR_API_KEY)
  @Roles(['admin'])
  @UseGuards(AuthGuard, RolesGuard)
  async remove(@Param('id') id: string, @Res() res: FastifyReply) {
    const result = await this.imagesClient.remove(Number(id));
    return res.status(result.statusCode).send(result.data);
  }
}
