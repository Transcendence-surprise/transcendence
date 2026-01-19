/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    const mockExecutionContext = (authHeader?: string): ExecutionContext => {
      return {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: authHeader,
            },
          }),
        }),
      } as ExecutionContext;
    };

    it('should return true for valid token', async () => {
      const payload = { sub: 1, username: 'testuser' };
      mockJwtService.verifyAsync.mockResolvedValue(payload);

      const context = mockExecutionContext('Bearer validToken123');
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('validToken123');
    });

    it('should throw UnauthorizedException when no token provided', async () => {
      const context = mockExecutionContext();

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token format is invalid', async () => {
      const context = mockExecutionContext('InvalidFormat');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token is not Bearer type', async () => {
      const context = mockExecutionContext('Basic token123');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token verification fails', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      const context = mockExecutionContext('Bearer invalidToken');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should attach user payload to request on successful validation', async () => {
      const payload = { sub: 1, username: 'testuser' };
      mockJwtService.verifyAsync.mockResolvedValue(payload);

      const mockRequest = {
        headers: { authorization: 'Bearer validToken' },
      };
      const context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await guard.canActivate(context);

      expect(mockRequest['user']).toEqual(payload);
    });
  });
});
