/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
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
    roles: ['user'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
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
    mockQueryBuilder.where.mockReturnThis();
    mockQueryBuilder.addSelect.mockReturnThis();
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

  describe('findOneByEmail', () => {
    it('should return a user by email', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOneByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOneByEmail('nonexistent@example.com'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.findOneByEmail('nonexistent@example.com'),
      ).rejects.toThrow("User with email 'nonexistent@example.com' not found");
    });
  });

  describe('findByIdentifierWithPassword', () => {
    it('should return user with password by username', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);

      const result = await service.findByIdentifierWithPassword('testuser');

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user.username = :identifier OR user.email = :identifier',
        { identifier: 'testuser' },
      );
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith('user.password');
      expect(result).toEqual(mockUser);
    });

    it('should return user with password by email', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);

      const result = await service.findByIdentifierWithPassword(
        'test@example.com',
      );

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user.username = :identifier OR user.email = :identifier',
        { identifier: 'test@example.com' },
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      const result = await service.findByIdentifierWithPassword('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByIdentifier', () => {
    it('should return user by username', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);

      const result = await service.findByIdentifier('testuser');

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user.username = :identifier OR user.email = :identifier',
        { identifier: 'testuser' },
      );
      expect(mockQueryBuilder.addSelect).not.toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      const result = await service.findByIdentifier('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('validateCredentials', () => {
    it('should return user without password when credentials are valid', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateCredentials({
        identifier: 'testuser',
        password: 'plainPassword',
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'plainPassword',
        'hashedPassword',
      );
      expect(result).toEqual({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user'],
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(
        service.validateCredentials({
          identifier: 'nonexistent',
          password: 'password',
        }),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.validateCredentials({
          identifier: 'nonexistent',
          password: 'password',
        }),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException when password is null', async () => {
      const userWithoutPassword = { ...mockUser, password: null };
      mockQueryBuilder.getOne.mockResolvedValue(userWithoutPassword);

      await expect(
        service.validateCredentials({
          identifier: 'testuser',
          password: 'password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateCredentials({
          identifier: 'testuser',
          password: 'wrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
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
        password: createUserDto.password,
      };

      const savedUser = {
        ...createdUser,
        password: 'hashedPassword',
      };

      mockRepository.findOne.mockResolvedValue(null); // No existing user
      mockRepository.create.mockReturnValue(createdUser);
      mockRepository.save.mockResolvedValue(savedUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.create(createUserDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: [
          { email: createUserDto.email },
          { username: createUserDto.username },
        ],
      });
      expect(mockRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', 10);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password');
      expect(result.username).toBe('newuser');
    });

    it('should create user without password when password is null', async () => {
      const createUserDto = {
        username: 'newuser',
        email: 'new@example.com',
        password: null,
      };

      const createdUser = {
        ...mockUser,
        username: createUserDto.username,
        email: createUserDto.email,
        password: null,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(createdUser);
      mockRepository.save.mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password');
    });

    it('should throw ConflictException when username already exists', async () => {
      const createUserDto = {
        username: 'testuser',
        email: 'new@example.com',
        password: 'plainPassword',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        'Username or email already exists',
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      const createUserDto = {
        username: 'newuser',
        email: 'test@example.com',
        password: 'plainPassword',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
