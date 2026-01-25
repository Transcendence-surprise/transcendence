import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthHttpService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { SignupUserDto } from './dto/signup-user.dto';
import { AuthLoginResponse } from './interfaces/service-auth-login-response';
import { AuthSignupResponse } from './interfaces/service-auth-signup-response';

/* eslint-disable @typescript-eslint/unbound-method */

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthHttpService>;

  beforeEach(async () => {
    const mockService = {
      login: jest.fn(),
      signup: jest.fn(),
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
      const response: AuthLoginResponse = { access_token: 'jwt' };

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
      const response: AuthSignupResponse = {
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
});
