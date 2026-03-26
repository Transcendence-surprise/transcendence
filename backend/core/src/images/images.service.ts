import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '@transcendence/db-entities/media/image.entity';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { pipeline } from 'stream/promises';

export interface UploadedFile {
  fieldname: string;
  filename: string;
  encoding: string;
  mimetype: string;
  file: NodeJS.ReadableStream;
}

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  async findAll(): Promise<Image[]> {
    return this.imageRepository.find();
  }

  async findOne(id: number): Promise<Image> {
    const image = await this.imageRepository.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException(`Image ${id} not found`);
    }
    return image;
  }

  async create(createImageDto: CreateImageDto): Promise<Image> {
    const image = this.imageRepository.create(createImageDto);
    return this.imageRepository.save(image);
  }

  async createFromUpload(uploadedFile: UploadedFile): Promise<Image> {
    const uploadDir = '/app/uploads';
    await mkdir(uploadDir, { recursive: true });

    const safeFilename = `${Date.now()}-${uploadedFile.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const targetPath = join(uploadDir, safeFilename);

    let size = 0;
    uploadedFile.file.on('data', (chunk: Buffer) => {
      size += chunk.length;
    });

    await pipeline(uploadedFile.file, createWriteStream(targetPath));

    const publicUri = `/uploads/${safeFilename}`;

    const image = this.imageRepository.create({
      url: publicUri,
      filename: uploadedFile.filename,
      mimeType: uploadedFile.mimetype,
      size,
    });

    return this.imageRepository.save(image);
  }

  async update(id: number, updateImageDto: UpdateImageDto): Promise<Image> {
    const image = await this.findOne(id);
    Object.assign(image, updateImageDto);
    return this.imageRepository.save(image);
  }

  async remove(id: number): Promise<{ deleted: boolean; id: number }> {
    const res = await this.imageRepository.delete({ id });
    if (!res.affected) {
      throw new NotFoundException(`Image ${id} not found`);
    }
    return { deleted: true, id };
  }
}
