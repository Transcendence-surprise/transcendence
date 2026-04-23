import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '@transcendence/db-entities/media/image.entity';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { createWriteStream } from 'fs';
import { access, mkdir } from 'fs/promises';
import { constants } from 'fs';
import { basename, join } from 'path';
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
  private readonly uploadDir = '/app/uploads';

  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  async findAll(): Promise<Image[]> {
    const images = await this.imageRepository.find();
    return images.map((image) => this.asPublicImage(image));
  }

  async findOne(id: number): Promise<Image> {
    const image = await this.findOneRaw(id);
    return this.asPublicImage(image);
  }

  private async findOneRaw(id: number): Promise<Image> {
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
    await mkdir(this.uploadDir, { recursive: true });

    const safeFilename = `${Date.now()}-${uploadedFile.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const targetPath = join(this.uploadDir, safeFilename);

    let size = 0;
    uploadedFile.file.on('data', (chunk: Buffer) => {
      size += chunk.length;
    });

    await pipeline(uploadedFile.file, createWriteStream(targetPath));

    const image = this.imageRepository.create({
      url: '',
      filename: uploadedFile.filename,
      mimeType: uploadedFile.mimetype,
      size,
    });

    const savedImage = await this.imageRepository.save(image);
    savedImage.url = `/api/images/${savedImage.id}/content/${safeFilename}`;
    const persisted = await this.imageRepository.save(savedImage);
    return this.asPublicImage(persisted);
  }

  async getContentFileInfo(id: number): Promise<{
    absolutePath: string;
    mimeType: string;
    filename: string;
  }> {
    const image = await this.findOneRaw(id);
    const storageName = this.resolveStorageName(image.url);
    const absolutePath = join(this.uploadDir, storageName);

    try {
      await access(absolutePath, constants.R_OK);
    } catch {
      throw new NotFoundException(`Image file for ${id} not found`);
    }

    return {
      absolutePath,
      mimeType: image.mimeType ?? 'application/octet-stream',
      filename: image.filename ?? storageName,
    };
  }

  private resolveStorageName(url: string): string {
    const directUploadPrefix = '/uploads/';
    if (url.startsWith(directUploadPrefix)) {
      const name = basename(url.slice(directUploadPrefix.length));
      if (!name) {
        throw new NotFoundException('Invalid image URL format');
      }
      return name;
    }

    const apiMatch = url.match(/^\/api\/images\/\d+\/content\/([^/?#]+)$/);
    if (apiMatch?.[1]) {
      const decoded = decodeURIComponent(apiMatch[1]);
      const name = basename(decoded);
      if (!name || name !== decoded) {
        throw new NotFoundException('Invalid image storage name');
      }
      return name;
    }

    throw new NotFoundException('Image content path is not resolvable');
  }

  private asPublicImage(image: Image): Image {
    return {
      ...image,
      url: `/api/images/${image.id}/content`,
    };
  }

  async update(id: number, updateImageDto: UpdateImageDto): Promise<Image> {
    const image = await this.findOneRaw(id);
    Object.assign(image, updateImageDto);
    const saved = await this.imageRepository.save(image);
    return this.asPublicImage(saved);
  }

  async remove(id: number): Promise<{ deleted: boolean; id: number }> {
    const res = await this.imageRepository.delete({ id });
    if (!res.affected) {
      throw new NotFoundException(`Image ${id} not found`);
    }
    return { deleted: true, id };
  }
}
