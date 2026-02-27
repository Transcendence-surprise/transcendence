import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { GameHttpService } from './game.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Auth, AuthType } from '../../common/decorator/auth-type.decorator';

@Controller('game')
export class GameController {
  constructor(private readonly gameClient: GameHttpService) {}

  @Post('create')
  @Auth(AuthType.JWT)
  @UseGuards(AuthGuard)
  createGame(@Body() body: unknown, @Req() req: FastifyRequest) {
    return this.gameClient.createGame(body, req);
  }

  @Post('start')
  @Auth(AuthType.JWT)
  @UseGuards(AuthGuard)
  startGame(@Body() body: unknown, @Req() req: FastifyRequest) {
    return this.gameClient.startGame(body, req);
  }

  @Post('join')
  @Auth(AuthType.JWT)
  @UseGuards(AuthGuard)
  join(@Body() body: unknown, @Req() req: FastifyRequest) {
    return this.gameClient.joinGame(body, req);
  }

  @Post('leave')
  @Auth(AuthType.JWT)
  @UseGuards(AuthGuard)
  leaveGame(@Body() body: unknown, @Req() req: FastifyRequest) {
    return this.gameClient.leaveGame(body, req);
  }

  @Get(':gameId')
  @Auth(AuthType.JWT)
  @UseGuards(AuthGuard)
  getGameState(@Param('gameId') gameId: string, @Req() req: FastifyRequest) {
    return this.gameClient.getGameState(gameId, req);
  }

  @Get('single/levels')
  getSingleLevels(@Req() req: FastifyRequest) {
    return this.gameClient.getSinglePlayerLevels(req);
  }

  @Get('multi/games')
  getMultiplayerGames(@Req() req: FastifyRequest) {
    return this.gameClient.getMultiplayerGames(req);
  }

  @Get('check-player')
  @Auth(AuthType.JWT)
  @UseGuards(AuthGuard)
  checkPlayer(@Req() req: FastifyRequest) {
    return this.gameClient.checkPlayerAvailability(req);
  }
}
