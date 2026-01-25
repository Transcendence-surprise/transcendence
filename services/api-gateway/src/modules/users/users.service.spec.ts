import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';
import { UsersHttpService } from './users.service';
import { ValidateCredDto } from './dto/validate-credentials.dto';
import {
  UserResponse,
  UsersListResponse,
} from './interfaces/service-user-response';

/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment */

describe('UsersHttpService', () => {
  let service: UsersHttpService;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const mockHttpService = {
      get: jest.fn(),
      post: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersHttpService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<UsersHttpService>(UsersHttpService);
    httpService = module.get(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should call get and return data', async () => {
      const response: UsersListResponse = [];
      const axiosResponse: AxiosResponse = {
        data: response,
        status: 200,
        statusText: 'OK',
        headers: {},

        config: {} as any,
      };

      httpService.get.mockReturnValue(of(axiosResponse));

      const result = await service.findAll();

      expect(httpService.get).toHaveBeenCalledWith('/api/users', undefined);
      expect(result).toEqual(response);
    });
  });

  describe('validateCredentials', () => {
    it('should call post and return data', async () => {
      const dto: ValidateCredDto = { identifier: 'test', password: 'pass' };
      const response: UserResponse = {
        id: 1,
        username: 'test',
        email: 'test@example.com',
        userType: 'registered',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };
      const axiosResponse: AxiosResponse = {
        data: response,
        status: 200,
        statusText: 'OK',
        headers: {},

        config: {} as any,
      };

      httpService.post.mockReturnValue(of(axiosResponse));

      const result = await service.validateCredentials(dto);

      expect(httpService.post).toHaveBeenCalledWith(
        '/api/users/validate-credentials',
        dto,
      );
      expect(result).toEqual(response);
    });
  });

  describe('findOneByUsername', () => {
    it('should call get and return data', async () => {
      const username = 'test';
      const response: UserResponse = {
        id: 1,
        username: 'test',
        email: 'test@example.com',
        userType: 'registered',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };
      const axiosResponse: AxiosResponse = {
        data: response,
        status: 200,
        statusText: 'OK',
        headers: {},

        config: {} as any,
      };

      httpService.get.mockReturnValue(of(axiosResponse));

      const result = await service.findOneByUsername(username);

      expect(httpService.get).toHaveBeenCalledWith(
        '/api/users/test',
        undefined,
      );
      expect(result).toEqual(response);
    });
  });

  describe('findOneById', () => {
    it('should call get and return data', async () => {
      const id = 1;
      const response: UserResponse = {
        id: 1,
        username: 'test',
        email: 'test@example.com',
        userType: 'registered',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };
      const axiosResponse: AxiosResponse = {
        data: response,
        status: 200,
        statusText: 'OK',
        headers: {},

        config: {} as any,
      };

      httpService.get.mockReturnValue(of(axiosResponse));

      const result = await service.findOneById(id);

      expect(httpService.get).toHaveBeenCalledWith(
        '/api/users/id/1',
        undefined,
      );
      expect(result).toEqual(response);
    });
  });

  describe('removeByUsername', () => {
    it('should call delete', async () => {
      const username = 'test';
      const axiosResponse: AxiosResponse = {
        data: undefined,
        status: 200,
        statusText: 'OK',
        headers: {},

        config: {} as any,
      };

      httpService.delete.mockReturnValue(of(axiosResponse));

      const result = await service.removeByUsername(username);

      expect(httpService.delete).toHaveBeenCalledWith(
        '/api/users/test',
        undefined,
      );
      expect(result).toBeUndefined();
    });
  });

  describe('removeById', () => {
    it('should call delete', async () => {
      const id = 1;
      const axiosResponse: AxiosResponse = {
        data: undefined,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
      httpService.delete.mockReturnValue(of(axiosResponse));

      const result = await service.removeById(id);

      expect(httpService.delete).toHaveBeenCalledWith(
        '/api/users/id/1',
        undefined,
      );
      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should call post and return data', async () => {
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
      const axiosResponse: AxiosResponse = {
        data: response,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
      httpService.post.mockReturnValue(of(axiosResponse));

      const result = await service.create(dto);

      expect(httpService.post).toHaveBeenCalledWith('/api/users', dto);
      expect(result).toEqual(response);
    });
  });

  describe('request (error handling)', () => {
    it('should throw HttpException on axios error', async () => {
      const axiosError = new AxiosError('error', '500', undefined, undefined, {
        status: 500,
        data: { message: 'error' },
      } as AxiosResponse<any, any>);
      httpService.get.mockReturnValue(throwError(() => axiosError));

      await expect(service.findAll()).rejects.toThrow('error');
    });
  });
});
