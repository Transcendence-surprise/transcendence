/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

// Mock bcrypt module
jest.mock('bcrypt');

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserWithPassword = {
    ...mockUser,
    password: '$2b$10$hashedPassword',
  };

  const mockUsersService = {
    findAll: jest.fn(),
    // findOneByUsername: jest.fn(),
    findOneById: jest.fn(),
    findByIdentifier: jest.fn(),
    validateCredentials: jest.fn(async (validateCredDto: { identifier: string; password: string }) => {
      const user = await mockUsersService.findByIdentifier(validateCredDto.identifier);
      if (!user) throw new UnauthorizedException('Invalid credentials');
      if (!user.password) throw new UnauthorizedException('Invalid credentials');
      const passwordCorrect = await (bcrypt.compare as jest.Mock)(
        validateCredDto.password,
        user.password,
      );
      if (!passwordCorrect) throw new UnauthorizedException('Invalid credentials');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }),
    // removeByUsername: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return an array of users', async () => {
      const users = [mockUser];
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.getUsers();

      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('validateCredentials', () => {
    it('should validate correct credentials and return user without password', async () => {
      const dto = { identifier: 'testuser', password: 'correctPassword' };
      mockUsersService.findByIdentifier.mockResolvedValue(mockUserWithPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await controller.validateCredentials(dto);

      expect(result).toEqual(mockUser);
      expect(result).not.toHaveProperty('password');
      expect(service.findByIdentifier).toHaveBeenCalledWith('testuser');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const dto = { identifier: 'nonexistent', password: 'password' };
      mockUsersService.findByIdentifier.mockResolvedValue(null);

      await expect(controller.validateCredentials(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.validateCredentials(dto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const dto = { identifier: 'testuser', password: 'wrongPassword' };
      mockUsersService.findByIdentifier.mockResolvedValue(mockUserWithPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(controller.validateCredentials(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // describe('getUserByUsername', () => {
  //   it('should return user by username', async () => {
  //     mockUsersService.findOneByUsername.mockResolvedValue(mockUser);

  //     const result = await controller.getUserByUsername('testuser');

  //     expect(result).toEqual(mockUser);
  //     expect(service.findOneByUsername).toHaveBeenCalledWith('testuser');
  //   });
  // });

  describe('getUserById', () => {
    it('should return user by id when user owns the id', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);

      const result = await controller.getUserById(1);

      expect(result).toEqual(mockUser);
      expect(service.findOneById).toHaveBeenCalledWith(1);
    });
  });

  // describe('removeByUsername', () => {
  //   it('should delete user by username', async () => {
  //     const deleteResult = { deleted: true, username: 'testuser' };
  //     mockUsersService.removeByUsername.mockResolvedValue(deleteResult);

  //     const result = await controller.removeByUsername('testuser');

  //     expect(result).toEqual(deleteResult);
  //     expect(service.removeByUsername).toHaveBeenCalledWith('testuser');
  //   });
  // });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      };
      const createdUser = { ...mockUser, ...createUserDto };
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(createdUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });
});
