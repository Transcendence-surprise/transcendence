import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';
import { AuthHttpService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { SignupUserDto } from './dto/signup-user.dto';
import { AuthLoginResponse } from './interfaces/service-auth-login-response';
import { AuthSignupResponse } from './interfaces/service-auth-signup-response';

/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment */

describe('AuthHttpService', () => {
  let service: AuthHttpService;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const mockHttpService = {
      post: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthHttpService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<AuthHttpService>(AuthHttpService);
    httpService = module.get(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should call post and return data', async () => {
      const dto: LoginUserDto = { identifier: 'test', password: 'pass' };
      const response: AuthLoginResponse = { access_token: 'jwt' };
      const axiosResponse: AxiosResponse = {
        data: response,
        status: 200,
        statusText: 'OK',
        headers: {},

        config: {} as any,
      };

      httpService.post.mockReturnValue(of(axiosResponse));

      const result = await service.login(dto);

      expect(httpService.post).toHaveBeenCalledWith('/api/auth/login', dto);
      expect(result).toEqual(response);
    });

    it('should throw HttpException on axios error', async () => {
      const dto: LoginUserDto = { identifier: 'test', password: 'pass' };

      const axiosError = new AxiosError('error', '500', undefined, undefined, {
        status: 500,
        data: { message: 'error' },
      } as any);

      httpService.post.mockReturnValue(throwError(() => axiosError));

      await expect(service.login(dto)).rejects.toThrow('error');
    });
  });

  describe('signup', () => {
    it('should call post and return data', async () => {
      const dto: SignupUserDto = {
        username: 'test',
        password: 'pass',
        email: 'test@example.com',
      };
      const response: AuthSignupResponse = {
        access_token: 'jwt',
        user: {
          id: 1,
          username: 'test',
          email: 'test@example.com',
        },
      };
      const axiosResponse: AxiosResponse = {
        data: response,
        status: 200,
        statusText: 'OK',
        headers: {},

        config: {} as any,
      };

      httpService.post.mockReturnValue(of(axiosResponse));

      const result = await service.signup(dto);

      expect(httpService.post).toHaveBeenCalledWith('/api/auth/signup', dto);
      expect(result).toEqual(response);
    });
  });
});
