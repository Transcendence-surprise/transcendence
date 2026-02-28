import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';
import { GameHttpService } from './game.service';
import type { FastifyRequest } from 'fastify';
import { AuthGuard } from '../../common/guards/auth.guard';

/* eslint-disable @typescript-eslint/unbound-method */

describe('GameController', () => {
  let controller: GameController;
  let service: jest.Mocked<GameHttpService>;

  beforeEach(async () => {
    const mockService = {
      createGame: jest.fn(),
      startGame: jest.fn(),
      joinGame: jest.fn(),
      leaveGame: jest.fn(),
      getGameState: jest.fn(),
      getSinglePlayerLevels: jest.fn(),
      getMultiplayerGames: jest.fn(),
      checkPlayerAvailability: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameController],
      providers: [
        {
          provide: GameHttpService,
          useValue: mockService,
        },
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<GameController>(GameController);
    service = module.get(GameHttpService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service methods', async () => {
    const req = {} as FastifyRequest;

    service.createGame.mockResolvedValue({ ok: true });
    await controller.createGame({ hostId: 'test', settings: {} }, req);
    expect(service.createGame).toHaveBeenCalled();

    service.getGameState.mockResolvedValue({ id: '123' });
    await controller.getGameState('123', req);
    expect(service.getGameState).toHaveBeenCalled();
  });
});
