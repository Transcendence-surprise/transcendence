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
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ImagesService, UploadedFile } from './images.service';
import { UpdateImageDto } from './dto/update-image.dto';
import {
  ImagesControllerDocs,
  FindAllImagesDocs,
  FindImageByIdDocs,
  UploadImageDocs,
  UpdateImageDocs,
  RemoveImageDocs,
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
