import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersHttpService } from './users.service';
import {
  UserResponse,
  UsersListResponse,
} from './interfaces/service-user-response';

/* eslint-disable @typescript-eslint/unbound-method */

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersHttpService>;

  beforeEach(async () => {
    const mockService = {
      findAll: jest.fn(),
      validateCredentials: jest.fn(),
      findOneByUsername: jest.fn(),
      findOneById: jest.fn(),
      removeByUsername: jest.fn(),
      removeById: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersHttpService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersHttpService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      const response: UsersListResponse = [];

      service.findAll.mockResolvedValue(response);

      const result = controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      await expect(result).resolves.toEqual(response);
    });
  });

  describe('validateCredentials', () => {
    it('should call service.validateCredentials', async () => {
      const dto = { identifier: 'test', password: 'pass' };
      const response: UserResponse = {
        id: 1,
        username: 'test',
        email: 'test@example.com',
        userType: 'registered',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      service.validateCredentials.mockResolvedValue(response);

      const result = controller.validateCredentials(dto);

      expect(service.validateCredentials).toHaveBeenCalledWith(dto);
      await expect(result).resolves.toEqual(response);
    });
  });

  describe('findOneByUsername', () => {
    it('should call service.findOneByUsername', async () => {
      const username = 'test';
      const response: UserResponse = {
        id: 1,
        username: 'test',
        email: 'test@example.com',
        userType: 'registered',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      service.findOneByUsername.mockResolvedValue(response);

      const result = controller.findOneByUsername(username);

      expect(service.findOneByUsername).toHaveBeenCalledWith(username);
      await expect(result).resolves.toEqual(response);
    });
  });

  describe('findOneById', () => {
    it('should call service.findOneById', async () => {
      const id = '1';
      const response: UserResponse = {
        id: 1,
        username: 'test',
        email: 'test@example.com',
        userType: 'registered',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      service.findOneById.mockResolvedValue(response);

      const result = controller.findOneById(id);

      expect(service.findOneById).toHaveBeenCalledWith(1);
      await expect(result).resolves.toEqual(response);
    });
  });

  describe('removeByUsername', () => {
    it('should call service.removeByUsername', async () => {
      const username = 'test';

      service.removeByUsername.mockResolvedValue(undefined);

      const result = controller.removeByUsername(username);

      expect(service.removeByUsername).toHaveBeenCalledWith(username);
      await expect(result).resolves.toBeUndefined();
    });
  });

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
      const response: UserResponse = {
        id: 1,
        username: 'test',
        email: 'test@example.com',
        userType: 'registered',
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
