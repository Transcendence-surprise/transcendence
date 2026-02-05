/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthHttpService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { SignupUserDto } from './dto/signup-user.dto';

/* eslint-disable @typescript-eslint/unbound-method */

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthHttpService>;

  beforeEach(async () => {
    const mockService = {
      login: jest.fn(),
      signup: jest.fn(),
      intra42AuthRedirect: jest.fn(),
      intra42AuthCallback: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthHttpService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthHttpService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call service.login and return result', async () => {
      const dto: LoginUserDto = { identifier: 'test', password: 'pass' };
      const response: any = { access_token: 'jwt' };

      service.login.mockResolvedValue(response);

      const result = await controller.login(dto);

      expect(service.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(response);
    });
  });

  describe('signup', () => {
    it('should call service.signup and return result', async () => {
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

      service.signup.mockResolvedValue(response);

      const result = await controller.signup(dto);

      expect(service.signup).toHaveBeenCalledWith(dto);
      expect(result).toEqual(response);
    });
  });

  describe('intra42Auth', () => {
    it('should return redirect URL', async () => {
      const redirectResponse = {
        status: 302,
        location: 'https://api.intra.42.fr/oauth/authorize?...',
      };

      service.intra42AuthRedirect.mockResolvedValue(redirectResponse);

      const result = await controller.intra42Auth();

      expect(service.intra42AuthRedirect).toHaveBeenCalled();
      expect(result).toEqual({
        url: 'https://api.intra.42.fr/oauth/authorize?...',
        statusCode: 302,
      });
    });

    it('should throw error if no redirect location', async () => {
      service.intra42AuthRedirect.mockResolvedValue({
        status: 200,
        location: undefined,
      });

      await expect(controller.intra42Auth()).rejects.toThrow(
        'No redirect from auth-service',
      );
    });
  });

  describe('intra42AuthCallback', () => {
    it('should forward callback and set cookies', async () => {
      const params = { code: 'auth_code', state: 'state_value' };
      const callbackResponse = {
        status: 302,
        location: 'http://localhost:3000/',
        cookies: ['auth_payload=xyz; HttpOnly'],
      };

      const mockReply: any = {
        header: jest.fn().mockReturnThis(),
        redirect: jest.fn(),
      };

      service.intra42AuthCallback.mockResolvedValue(callbackResponse);

      await controller.intra42AuthCallback(params, mockReply);

      expect(service.intra42AuthCallback).toHaveBeenCalledWith(
        'auth_code',
        'state_value',
      );
      expect(mockReply.header).toHaveBeenCalledWith('set-cookie', [
        'auth_payload=xyz; HttpOnly',
      ]);
      expect(mockReply.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/',
        302,
      );
    });

    it('should throw error if no redirect location', async () => {
      const params = { code: 'auth_code', state: 'state_value' };
      const mockReply: any = {
        header: jest.fn().mockReturnThis(),
        redirect: jest.fn(),
      };

      service.intra42AuthCallback.mockResolvedValue({
        status: 200,
        location: undefined,
      });

      await expect(
        controller.intra42AuthCallback(params, mockReply),
      ).rejects.toThrow('No redirect from auth-service');
    });
  });
});
