import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';
import { GameHttpService } from './game.service';

/* eslint-disable @typescript-eslint/unbound-method */

describe('GameController', () => {
  let controller: GameController;
  let service: jest.Mocked<GameHttpService>;

  beforeEach(async () => {
    const mockService = {
      get: jest.fn(),
      post: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameController],
      providers: [
        {
          provide: GameHttpService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<GameController>(GameController);
    service = module.get(GameHttpService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createGame', () => {
    it('should call service.post with correct path', async () => {
      const body = { mode: 'single', level: 1 };
      const response = { gameId: '123' };

      service.post.mockResolvedValue(response);

      const result = controller.createGame(body);

      expect(service.post).toHaveBeenCalledWith('/api/game/create', body);
      await expect(result).resolves.toEqual(response);
    });
  });

  describe('startGame', () => {
    it('should call service.post with correct path', async () => {
      const body = { gameId: '123' };
      const response = { started: true };

      service.post.mockResolvedValue(response);

      const result = controller.startGame(body);

      expect(service.post).toHaveBeenCalledWith('/api/game/start', body);
      await expect(result).resolves.toEqual(response);
    });
  });

  describe('join', () => {
    it('should call service.post with correct path', async () => {
      const body = { gameId: '123', playerId: '456' };
      const response = { joined: true };

      service.post.mockResolvedValue(response);

      const result = controller.join(body);

      expect(service.post).toHaveBeenCalledWith('/api/game/join', body);
      await expect(result).resolves.toEqual(response);
    });
  });

  describe('leaveGame', () => {
    it('should call service.post with correct path', async () => {
      const body = { gameId: '123', playerId: '456' };
      const response = { left: true };

      service.post.mockResolvedValue(response);

      const result = controller.leaveGame(body);

      expect(service.post).toHaveBeenCalledWith('/api/game/leave', body);
      await expect(result).resolves.toEqual(response);
    });
  });

  describe('getGameState', () => {
    it('should call service.get with correct path', async () => {
      const gameId = '123';
      const response = { id: '123', status: 'active' };

      service.get.mockResolvedValue(response);

      const result = controller.getGameState(gameId);

      expect(service.get).toHaveBeenCalledWith('/api/game/123');
      await expect(result).resolves.toEqual(response);
    });
  });

  describe('getSingleLevels', () => {
    it('should call service.get with correct path', async () => {
      const response = [{ id: 1, name: 'Easy' }];

      service.get.mockResolvedValue(response);

      const result = controller.getSingleLevels();

      expect(service.get).toHaveBeenCalledWith('/api/game/single/levels');
      await expect(result).resolves.toEqual(response);
    });
  });

  describe('getMultiplayerGames', () => {
    it('should call service.get with correct path', async () => {
      const response = [{ id: '123', players: 2 }];

      service.get.mockResolvedValue(response);

      const result = controller.getMultiplayerGames();

      expect(service.get).toHaveBeenCalledWith('/api/game/multi/games');
      await expect(result).resolves.toEqual(response);
    });
  });

  describe('checkPlayer', () => {
    it('should call service.get with correct path', async () => {
      const playerId = '456';
      const response = { inGame: true, gameId: '123' };

      service.get.mockResolvedValue(response);

      const result = controller.checkPlayer(playerId);

      expect(service.get).toHaveBeenCalledWith('/api/game/check-player/456');
      await expect(result).resolves.toEqual(response);
    });
  });
});
