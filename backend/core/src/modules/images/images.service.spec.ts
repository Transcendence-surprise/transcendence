import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ImagesService } from './images.service';
import { Image } from '@transcendence/db-entities/media/image.entity';
import { CreateImageDto } from './dto/create-image.dto';

const mockImage: Image = {
  id: 1,
  url: '/uploads/avatars/test.png',
  filename: 'test.png',
  mimeType: 'image/png',
  size: 1024,
  createdAt: new Date(),
};

const normalizedMockImage: Image = {
  ...mockImage,
  url: '/api/images/1/content',
};

describe('ImagesService', () => {
  let service: ImagesService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        {
          provide: getRepositoryToken(Image),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ImagesService>(ImagesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all images', async () => {
      mockRepository.find.mockResolvedValue([mockImage]);

      const result = await service.findAll();

      expect(result).toEqual([normalizedMockImage]);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return image by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockImage);

      const result = await service.findOne(1);

      expect(result).toEqual(normalizedMockImage);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create an image', async () => {
      const dto = {
        url: '/uploads/avatars/new.png',
        filename: 'new.png',
        mimeType: 'image/png',
        size: 1234,
      };

      mockRepository.create.mockReturnValue(dto as Image);
      mockRepository.save.mockResolvedValue({ ...dto, id: 2, createdAt: new Date() });

      const result = await service.create(dto as CreateImageDto);

      expect(result).toEqual(expect.objectContaining({ url: dto.url }));
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update the image', async () => {
      const updateDto = { filename: 'updated.png' };

      mockRepository.findOne.mockResolvedValue(mockImage);
      mockRepository.save.mockResolvedValue({ ...mockImage, ...updateDto });

      const result = await service.update(1, updateDto as CreateImageDto);

      expect(result.filename).toEqual('updated.png');
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove image', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(result).toEqual({ deleted: true, id: 1 });
      expect(mockRepository.delete).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException when image does not exist', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
