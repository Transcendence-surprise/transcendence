import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';
import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';
import { AuthHttpService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { SignupUserDto } from './dto/signup-user.dto';
import gatewayConfig from '../../common/config/gateway.config';

// Load .env from project root
dotenvConfig({ path: resolve(__dirname, '../../../../../.env') });

/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment */

describe('AuthHttpService', () => {
  let service: AuthHttpService;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const mockHttpService = {
      get: jest.fn(),
      post: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [gatewayConfig],
        }),
      ],
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
      const response: any = { access_token: 'jwt' };
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
      const response: any = {
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

  describe('intra42AuthRedirect', () => {
    it('should return redirect status and location', async () => {
      const axiosResponse: AxiosResponse = {
        data: {},
        status: 302,
        statusText: 'Found',
        headers: { location: 'https://api.intra.42.fr/oauth/authorize?...' },
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(axiosResponse));

      const result = await service.intra42AuthRedirect();

      expect(httpService.get).toHaveBeenCalledWith('/api/auth/intra42', {
        maxRedirects: 0,
        validateStatus: expect.any(Function),
      });
      expect(result).toEqual({
        status: 302,
        location: 'https://api.intra.42.fr/oauth/authorize?...',
      });
    });
  });

  describe('intra42AuthCallback', () => {
    it('should forward callback and return status, location, and cookies', async () => {
      const code = 'auth_code_123';
      const state = 'state_456';
      const axiosResponse: AxiosResponse = {
        data: {},
        status: 302,
        statusText: 'Found',
        headers: {
          location: 'http://localhost:3000/',
          'set-cookie': ['auth_payload=xyz; HttpOnly'],
        },
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(axiosResponse));

      const result = await service.intra42AuthCallback(code, state);

      expect(httpService.get).toHaveBeenCalledWith(
        '/api/auth/intra42/callback',
        {
          maxRedirects: 0,
          validateStatus: expect.any(Function),
          params: { code, state },
        },
      );
      expect(result).toEqual({
        status: 302,
        location: 'http://localhost:3000/',
        cookies: ['auth_payload=xyz; HttpOnly'],
      });
    });

    it('should handle array of set-cookie headers', async () => {
      const axiosResponse: AxiosResponse = {
        data: {},
        status: 302,
        statusText: 'Found',
        headers: {
          location: 'http://localhost:3000/',
          'set-cookie': ['cookie1=value1', 'cookie2=value2'],
        },
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(axiosResponse));

      const result = await service.intra42AuthCallback('code', 'state');

      expect(result.cookies).toEqual(['cookie1=value1', 'cookie2=value2']);
    });
  });
});
