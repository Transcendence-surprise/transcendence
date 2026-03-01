import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersHttpService } from './users.service';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { AuthGuard } from '../../common/guards/auth.guard';

/* eslint-disable @typescript-eslint/unbound-method */

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersHttpService>;
  let mockRes: jest.Mocked<FastifyReply>;

  beforeEach(async () => {
    const mockAuthGuard = { canActivate: jest.fn(() => true) };
    const mockService = {
      findAll: jest.fn(),
      validateCredentials: jest.fn(),
      findOneByUsername: jest.fn(),
      findOneById: jest.fn(),
      removeByUsername: jest.fn(),
      removeById: jest.fn(),
      create: jest.fn(),
      findUserByHisToken: jest.fn(),
    };

    // Mock Fastify reply object
    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersHttpService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersHttpService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll and send response', async () => {
      const data: any = [];

      service.findAll.mockResolvedValue({ statusCode: 200, data });

      await controller.findAll(mockRes);

      expect(service.findAll).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith(data);
    });
  });

  // username-based endpoints removed from controller; tests omitted

  describe('findOneById', () => {
    it('should call service.findOneById and send response', async () => {
      const id = '1';
      const data: any = {
        id: 1,
        username: 'test',
        email: 'test@example.com',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      service.findOneById.mockResolvedValue({ statusCode: 200, data });

      const mockReq = {} as unknown as FastifyRequest;
      await controller.findOneById(id, mockReq, mockRes);

      expect(service.findOneById).toHaveBeenCalledWith(1, mockReq);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith(data);
    });
  });

  // username-based endpoints removed from controller; tests omitted

  describe('removeById', () => {
    it('should call service.removeById and send response', async () => {
      const id = '1';

      service.removeById.mockResolvedValue({ statusCode: 200, data: undefined });

      await controller.removeById(id, mockRes);

      expect(service.removeById).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith(undefined);
    });
  });

  describe('create', () => {
    it('should call service.create and send response', async () => {
      const dto = {
        username: 'test',
        password: 'pass',
        email: 'test@example.com',
      };
      const data: any = {
        id: 1,
        username: 'test',
        email: 'test@example.com',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      service.create.mockResolvedValue({ statusCode: 200, data });

      await controller.create(dto, mockRes);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith(data);
    });
  });
});
