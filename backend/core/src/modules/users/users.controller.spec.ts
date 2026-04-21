/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ImagesService } from '../images/images.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@transcendence/db-entities';

type MockUsersService = jest.Mocked<UsersService>;

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    rankNumber: 1000,
    winStreak: 0,
    totalGames: 0,
    totalWins: 0,
    roles: ['user'],
    twoFactorEnabled: false,
    avatarImageId: null,
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService: MockUsersService = {
    findAll: jest.fn<Promise<User[]>, []>(),
    findOneById: jest.fn<Promise<User>, [number]>(),
    validateCredentials: jest.fn<Promise<Omit<User, 'password'>>, [{ identifier: string; password: string }]>(),
    create: jest.fn(),
  } as unknown as MockUsersService;

  const mockImagesService = {
    createFromUpload: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ImagesService,
          useValue: mockImagesService,
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
      mockUsersService.validateCredentials.mockResolvedValue(mockUser);

      const result = await controller.validateCredentials(dto);

      expect(result).toEqual(mockUser);
      expect(result).not.toHaveProperty('password');
      expect(service.validateCredentials).toHaveBeenCalledWith(dto);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const dto = { identifier: 'nonexistent', password: 'password' };
      mockUsersService.validateCredentials.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.validateCredentials(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.validateCredentials(dto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const dto = { identifier: 'testuser', password: 'wrongPassword' };
      mockUsersService.validateCredentials.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.validateCredentials(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getUserById', () => {
    it('should return user by id when user owns the id', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);

      const result = await controller.getUserById(1);

      expect(result).toEqual(mockUser);
      expect(service.findOneById).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      };
      const createdUser = {
        ...mockUser,
        username: createUserDto.username,
        email: createUserDto.email,
      };
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(createdUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });
});
