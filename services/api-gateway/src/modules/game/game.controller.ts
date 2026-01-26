import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { GameHttpService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameClient: GameHttpService) {}

  @Post('create')
  createGame(@Body() body: unknown) {
    return this.gameClient.post('/api/game/create', body);
  }

  @Post('start')
  startGame(@Body() body: unknown) {
    return this.gameClient.post('/api/game/start', body);
  }

  @Post('join')
  join(@Body() body: unknown) {
    return this.gameClient.post('/api/game/join', body);
  }

  @Post('leave')
  leaveGame(@Body() body: unknown) {
    return this.gameClient.post('/api/game/leave', body);
  }

  @Get(':gameId')
  getGameState(@Param('gameId') gameId: string) {
    return this.gameClient.get(`/api/game/${gameId}`);
  }

  @Get('single/levels')
  getSingleLevels() {
    return this.gameClient.get('/api/game/single/levels');
  }

  @Get('multi/games')
  getMultiplayerGames() {
    return this.gameClient.get('/api/game/multi/games');
  }

  @Get('check-player/:playerId')
  checkPlayer(@Param('playerId') playerId: string) {
    return this.gameClient.get(`/api/game/check-player/${playerId}`);
  }
}
