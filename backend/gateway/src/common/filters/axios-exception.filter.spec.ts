/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { AxiosError } from 'axios';
import { AxiosExceptionFilter } from './axios-exception.filter';

describe('AxiosExceptionFilter', () => {
  let filter: AxiosExceptionFilter;
  let mockReply: any;
  let mockHost: ArgumentsHost;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AxiosExceptionFilter],
    }).compile();

    filter = module.get<AxiosExceptionFilter>(AxiosExceptionFilter);

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockReply),
      }),
    } as any;
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('HttpException handling', () => {
    it('should forward HttpException with correct status and response', () => {
      const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

      filter.catch(exception, mockHost);

      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith('Not Found');
    });

    it('should handle HttpException with object response', () => {
      const response = { message: 'Bad Request', errors: ['field error'] };
      const exception = new HttpException(response, HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith(response);
    });
  });

  describe('AxiosError handling', () => {
    it('should forward upstream error with status and data', () => {
      const axiosError: Partial<AxiosError> = {
        response: {
          status: 404,
          data: { message: 'User not found' },
          statusText: 'Not Found',
          headers: {},
          config: {} as any,
        },
        isAxiosError: true,
      };

      filter.catch(axiosError as AxiosError, mockHost);

      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 502 for network errors without response', () => {
      const axiosError: Partial<AxiosError> = {
        message: 'Network Error',
        isAxiosError: true,
      };

      filter.catch(axiosError as AxiosError, mockHost);

      expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.BAD_GATEWAY);
      expect(mockReply.send).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_GATEWAY,
        message: 'Service unavailable',
        error: 'Bad Gateway',
      });
    });

    it('should handle upstream error with empty data', () => {
      const axiosError: Partial<AxiosError> = {
        response: {
          status: 500,
          data: null,
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as any,
        },
        isAxiosError: true,
      };

      filter.catch(axiosError as AxiosError, mockHost);

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({ message: 'Upstream error' });
    });
  });

  describe('Unknown error handling', () => {
    it('should return 500 for unknown errors', () => {
      const unknownError = new Error('Something went wrong');

      filter.catch(unknownError, mockHost);

      expect(mockReply.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockReply.send).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: 'Internal Server Error',
      });
    });
  });
});
