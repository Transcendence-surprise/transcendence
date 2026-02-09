/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { GameHttpService } from './game.service';

/* eslint-disable @typescript-eslint/unbound-method */

describe('GameHttpService', () => {
  let service: GameHttpService;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const mockHttpService = {
      get: jest.fn(),
      post: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameHttpService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<GameHttpService>(GameHttpService);
    httpService = module.get(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should forward GET request and return data', async () => {
      const path = '/api/game/123';
      const response = { id: '123', status: 'active' };
      const axiosResponse: AxiosResponse = {
        data: response,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(axiosResponse));

      const result = await service.get(path);

      expect(httpService.get).toHaveBeenCalledWith(path, undefined);
      expect(result).toEqual(response);
    });
  });

  describe('post', () => {
    it('should forward POST request and return data', async () => {
      const path = '/api/game/create';
      const body = { mode: 'single', level: 1 };
      const response = { gameId: '456', created: true };
      const axiosResponse: AxiosResponse = {
        data: response,
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      };

      httpService.post.mockReturnValue(of(axiosResponse));

      const result = await service.post(path, body);

      expect(httpService.post).toHaveBeenCalledWith(path, body);
      expect(result).toEqual(response);
    });
  });
});
