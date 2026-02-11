/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@transcendence/db-entities';
import * as bcrypt from 'bcrypt';

// Mock bcrypt module
jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
    userType: 'registered',
  };

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
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [mockUser];
      mockRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no users exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOneByUsername', () => {
    it('should return a user by username', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOneByUsername('testuser');

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneByUsername('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOneByUsername('nonexistent')).rejects.toThrow(
        "User 'nonexistent' not found",
      );
    });
  });

  describe('findOneById', () => {
    it('should return a user by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOneById(1);

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneById(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOneById(999)).rejects.toThrow(
        "User '999' not found",
      );
    });
  });

  describe('removeByUsername', () => {
    it('should delete user by username', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      const result = await service.removeByUsername('testuser');

      expect(result).toEqual({ deleted: true, username: 'testuser' });
      expect(mockRepository.delete).toHaveBeenCalledWith({
        username: 'testuser',
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0, raw: [] });

      await expect(service.removeByUsername('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeById', () => {
    it('should delete user by id', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      const result = await service.removeById(1);

      expect(result).toEqual({ deleted: true, id: 1 });
      expect(mockRepository.delete).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0, raw: [] });

      await expect(service.removeById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const createUserDto = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'plainPassword',
      };

      const createdUser = {
        ...mockUser,
        username: createUserDto.username,
        email: createUserDto.email,
        password: createUserDto.password, // Use plain password initially
      };

      mockRepository.create.mockReturnValue(createdUser);
      mockRepository.save.mockResolvedValue({
        ...createdUser,
        password: 'hashedPassword', // After save, password is hashed
      });

      // Mock bcrypt.hash
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.create(createUserDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', 10);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });
});
