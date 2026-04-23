import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  Req,
  BadRequestException,
  Res,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { createReadStream } from 'fs';
import { ImagesService, UploadedFile } from './images.service';
import { UpdateImageDto } from './dto/update-image.dto';
import {
  ImagesControllerDocs,
  FindAllImagesDocs,
  FindImageByIdDocs,
  UploadImageDocs,
  UpdateImageDocs,
  RemoveImageDocs,
  GetImageContentDocs,
} from './images.controller.docs';

type MaybeMultipartRequest = FastifyRequest & {
  file?: () => Promise<UploadedFile | undefined>;
};

@ImagesControllerDocs()
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @FindAllImagesDocs()
  @Get()
  findAll() {
    return this.imagesService.findAll();
  }

  @FindImageByIdDocs()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.imagesService.findOne(id);
  }

  @GetImageContentDocs()
  @Get(':id/content')
  async getContent(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: FastifyReply,
  ) {
    return this.sendImageContent(id, res);
  }

  private async sendImageContent(id: number, res: FastifyReply) {
    const fileInfo = await this.imagesService.getContentFileInfo(id);

    res.header('Content-Type', fileInfo.mimeType);
    res.header(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(fileInfo.filename)}"`,
    );
    res.header('Cache-Control', 'public, max-age=31536000, immutable');

    return res.send(createReadStream(fileInfo.absolutePath));
  }

  @UploadImageDocs()
  @Post()
  async uploadFile(@Req() req: MaybeMultipartRequest) {
    if (!req.isMultipart || !req.isMultipart()) {
      throw new BadRequestException('Expected multipart/form-data');
    }

    const file = await req.file();
    if (!file || !file.filename) {
      throw new BadRequestException('Missing file in form-data');
    }

    return this.imagesService.createFromUpload(file);
  }

  @UpdateImageDocs()
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateImageDto: UpdateImageDto,
  ) {
    return this.imagesService.update(id, updateImageDto);
  }

  @RemoveImageDocs()
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.imagesService.remove(id);
  }
}
