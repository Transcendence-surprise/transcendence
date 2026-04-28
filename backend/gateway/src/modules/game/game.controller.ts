import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { GameHttpService } from './game.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Auth, AuthType } from '../../common/decorator/auth-type.decorator';
import { StartGameDto } from './dto/start-game.dto';
import { LeaveGameDto } from './dto/leave-game.dto';
import { JoinGameDto } from './dto/join-game.dto';
import { PlayerMoveDto } from './dto/player-move.dto';
import { BoardMoveDto } from './dto/board-move.dto';

@Controller('game')
@Auth(AuthType.JWT)
@UseGuards(AuthGuard)
export class GameController {
  constructor(
    private readonly gameClient: GameHttpService,
  ) {}

  @Post('create')
  createGame(@Body() body: unknown, @Req() req: FastifyRequest) {
    return this.gameClient.createGame(body, req);
  }

  @Post('start')
  startGame(@Body() body: StartGameDto, @Req() req: FastifyRequest) {
    return this.gameClient.startGame(body, req);
  }

  @Post('join')
  join(@Body() body: JoinGameDto, @Req() req: FastifyRequest) {
    return this.gameClient.joinGame(body, req);
  }

  @Post('leave')
  leaveGame(@Body() body: LeaveGameDto, @Req() req: FastifyRequest) {
    console.log(`Received leave game request for gameId ${body}`);
    return this.gameClient.leaveGame(body, req);
  }

  @Get(':gameId')
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
  checkPlayer(@Req() req: FastifyRequest) {
    return this.gameClient.checkPlayerAvailability(req);
  }

  @Post('boardmove')
  boardMove(@Body() body: BoardMoveDto, @Req() req: FastifyRequest) {
    console.log(`Received board move request for gameId ${body.gameId}`);
    return this.gameClient.boardMove(body, req);
  }

  @Post('playermove')
  playerMove(@Body() body: PlayerMoveDto, @Req() req: FastifyRequest) {
    console.log(`Received player move request for gameId ${body.gameId}`);
    return this.gameClient.playerMove(body, req);
  }
}
