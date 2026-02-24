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

  it('should forward POST request', async () => {
    const response = { ok: true };
    const axiosResponse: AxiosResponse = {
      data: response,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };

    httpService.post.mockReturnValue(of(axiosResponse));

    const result = await service.createGame({ hostId: 'test', settings: {} });

    expect(httpService.post).toHaveBeenCalled();
    expect(result).toEqual(response);
  });

  it('should forward GET request', async () => {
    const response = { id: '123' };
    const axiosResponse: AxiosResponse = {
      data: response,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };

    httpService.get.mockReturnValue(of(axiosResponse));

    const result = await service.getGameState('123');

    expect(httpService.get).toHaveBeenCalled();
    expect(result).toEqual(response);
  });
});
