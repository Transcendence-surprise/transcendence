import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersHttpService } from './users.service';
import type { FastifyRequest } from 'fastify';
import { AuthGuard } from '../../common/guards/auth.guard';

/* eslint-disable @typescript-eslint/unbound-method */

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersHttpService>;

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
    it('should call service.findAll', async () => {
      const response: any = [];

      service.findAll.mockResolvedValue(response);

      const result = controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      await expect(result).resolves.toEqual(response);
    });
  });

  // username-based endpoints removed from controller; tests omitted

  describe('findOneById', () => {
    it('should call service.findOneById', async () => {
      const id = '1';
      const response: any = {
        id: 1,
        username: 'test',
        email: 'test@example.com',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      service.findOneById.mockResolvedValue(response);

      const mockReq = {} as unknown as FastifyRequest;
      const result = controller.findOneById(id, mockReq);

      expect(service.findOneById).toHaveBeenCalledWith(1, mockReq);
      await expect(result).resolves.toEqual(response);
    });
  });

  // username-based endpoints removed from controller; tests omitted

  describe('removeById', () => {
    it('should call service.removeById', async () => {
      const id = '1';

      service.removeById.mockResolvedValue(undefined);

      const result = controller.removeById(id);

      expect(service.removeById).toHaveBeenCalledWith(1);
      await expect(result).resolves.toBeUndefined();
    });
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto = {
        username: 'test',
        password: 'pass',
        email: 'test@example.com',
      };
      const response: any = {
        id: 1,
        username: 'test',
        email: 'test@example.com',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      service.create.mockResolvedValue(response);

      const result = controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      await expect(result).resolves.toEqual(response);
    });
  });
});
