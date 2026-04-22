import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { GameHttpService } from './game.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Auth, AuthType } from '../../common/decorator/auth-type.decorator';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Controller('game')
export class GameController {
  constructor(
    private readonly gameClient: GameHttpService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  @Post('create')
  @Auth(AuthType.JWT)
  @UseGuards(AuthGuard)
  createGame(@Body() body: unknown, @Req() req: FastifyRequest) {
    return this.gameClient.createGame(body, req).then(async (result) => {
      if ((result as any)?.ok) {
        await this.realtimeGateway.sendMultiplayerListUpdate();
        const userId = (req as any)?.user?.sub ?? (req as any)?.headers?.['x-user-id'];
        if (userId !== undefined) {
          await this.realtimeGateway.sendPlayerStatusUpdate(userId, req);
        }
      }
      return result;
    });
  }

  @Post('start')
  @Auth(AuthType.JWT)
  @UseGuards(AuthGuard)
  startGame(@Body() body: unknown, @Req() req: FastifyRequest) {
    return this.gameClient.startGame(body, req).then(async (result) => {
      if ((result as any)?.ok) {
        await this.realtimeGateway.sendMultiplayerListUpdate();
        await this.realtimeGateway.sendLobbyUpdate((body as any)?.gameId, req);
        const userId = (req as any)?.user?.sub ?? (req as any)?.headers?.['x-user-id'];
        if (userId !== undefined) {
          await this.realtimeGateway.sendPlayerStatusUpdate(userId, req);
        }
      }
      return result;
    });
  }

  @Post('join')
  @Auth(AuthType.JWT)
  @UseGuards(AuthGuard)
  join(@Body() body: unknown, @Req() req: FastifyRequest) {
    return this.gameClient.joinGame(body, req).then(async (result) => {
      if ((result as any)?.ok) {
        await this.realtimeGateway.sendMultiplayerListUpdate();
        const gameId = (body as any)?.gameId;
        if (gameId) {
          await this.realtimeGateway.sendLobbyUpdate(gameId, req);
        }
        const userId = (req as any)?.user?.sub ?? (req as any)?.headers?.['x-user-id'];
        if (userId !== undefined) {
          await this.realtimeGateway.sendPlayerStatusUpdate(userId, req);
        }
      }
      return result;
    });
  }

  @Post('leave')
  @Auth(AuthType.JWT)
  @UseGuards(AuthGuard)
  leaveGame(@Body() body: unknown, @Req() req: FastifyRequest) {
    return this.gameClient.leaveGame(body, req).then(async (result) => {
      if ((result as any)?.ok) {
        const gameId = (body as any)?.gameId;
        await this.realtimeGateway.sendMultiplayerListUpdate();
        if (gameId) {
          await this.realtimeGateway.sendLobbyUpdate(gameId, req);
        }
        const userId = (req as any)?.user?.sub ?? (req as any)?.headers?.['x-user-id'];
        if (userId !== undefined) {
          await this.realtimeGateway.sendPlayerStatusUpdate(userId, req);
        }
        if ((result as any)?.deleteGame && gameId) {
          await this.realtimeGateway.sendGameDeleted(gameId);
        }
      }
      return result;
    });
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

  @Post('boardmove')
  @Auth(AuthType.JWT)
  @UseGuards(AuthGuard)
  boardMove(@Body() body: unknown, @Req() req: FastifyRequest) {
    return this.gameClient.boardMove(body, req).then(async (result) => {
      if ((result as any)?.ok) {
        const gameId = (body as any)?.gameId;
        if (gameId) {
          await this.realtimeGateway.sendPlayUpdate(gameId, req);
        }
      }
      return result;
    });
  }

  @Post('playermove')
  @Auth(AuthType.JWT)
  @UseGuards(AuthGuard)
  playerMove(@Body() body: unknown, @Req() req: FastifyRequest) {
      return this.gameClient.playerMove(body, req).then(async (result) => {
        if ((result as any)?.ok) {
          const gameId = (body as any)?.gameId;
          if (gameId) {
            await this.realtimeGateway.sendPlayUpdate(gameId, req);
          }
        }
        return result;
      });
    }
}
