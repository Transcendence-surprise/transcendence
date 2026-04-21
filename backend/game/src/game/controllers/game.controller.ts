import { Controller, Post, Body, Get, Param, HttpCode } from '@nestjs/common';
import { EngineService } from '../services/engine.service.nest';
import { UnauthorizedException } from '@nestjs/common';
import { GameSettings } from '../models/state';
import { WsGateway } from '../../ws/ws.gateway';
import { ApiBody, ApiOkResponse, ApiParam, ApiResponse } from '@nestjs/swagger';
import {
  CreateGameDto,
  CreateGameResponseDto,
  StartGameDto,
  StartResponseDto,
  JoinGameDto,
  JoinResponseDto,
  BoardResponseDto,
  PlayerMoveDto,
  PlayerActionResponseDto,
  LeaveGameDto,
  LeaveResponseDto,
  GameStateResponseDto,
} from '../dtos/game.dto';
import { SingleLevelDto } from '../dtos/level-registry.dto';
import { MultiGameDto } from '../dtos/game-lobby-list.dto';
import { MultiGame } from '../models/gameInfo';
import { CheckPlayerAvailabilityDto } from '../dtos/checkPlayer.dto';
import { CurrentUser } from '../dtos/playerContext.dto';
import type { PlayerContext } from '../dtos/playerContext.dto';
import { BoardMoveDto } from '../dtos/board-move.dto';
import { PlayerAction } from '../models/playerAction';

@Controller('game')
export class GameController {
  constructor(
  private readonly engine: EngineService,
  private readonly wsGateway: WsGateway,
) {}

  // Create Game
  @Post('create')
  @ApiBody({ type: CreateGameDto })
  @ApiResponse({ status: 201, type: CreateGameResponseDto })
  async createGame(
    @Body() body: CreateGameDto,
    @CurrentUser() user: PlayerContext,
  ): Promise<CreateGameResponseDto> {

    if (!user.id) {
      throw new UnauthorizedException('User id missing');
    }

    const settings = body as GameSettings;

    const { gameId } = await this.engine.createGame(
      user.id,
      user.username,
      settings
    );
    // console.log(`Game created with ID: ${gameId} in phase ${this.engine.getGameState(gameId)?.phase || 'IDK'} by user ${user.id}`);
    await this.wsGateway.sendMultiplayerListUpdate();
    await this.wsGateway.sendPlayerStatusUpdate(user.id.toString());
    return { ok: true, gameId };
  }

  // Start game
  @Post('start')
  @ApiBody({ type: StartGameDto })
  @ApiResponse({ status: 201, type: StartResponseDto })
  async startGame(
    @Body() body: StartGameDto,
    @CurrentUser() user: PlayerContext
   ): Promise<StartResponseDto> {
    const result = await this.engine.startGame(body.gameId, user.id);

    if (result.ok) {
      await this.wsGateway.sendMultiplayerListUpdate();
      await this.wsGateway.sendLobbyUpdate(body.gameId);
      await this.wsGateway.sendPlayerStatusUpdate(user.id.toString());
    }

    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }

  // Join game
  @Post('join')
  @ApiBody({ type: JoinGameDto })
  @ApiResponse({ status: 201, type: JoinResponseDto })
  async join(
    @Body() body: JoinGameDto,
    @CurrentUser() user: PlayerContext
  ) : Promise<JoinResponseDto> {
    const result = await this.engine.joinGame(body.gameId, user.id, user.username, body.role);

    if (result.ok) {
      await this.wsGateway.sendMultiplayerListUpdate();
      await this.wsGateway.sendPlayerStatusUpdate(user.id.toString());
    }
    // console.log("User Joined: ", body.playerId );
    return result;
  }

  //Board modification
  @Post('boardmove')
  @ApiBody({ type: BoardMoveDto })
  @ApiResponse({ status: 201, type: BoardResponseDto })
  async boardMove(
    @Body() body: BoardMoveDto,
    @CurrentUser() user: PlayerContext
  ) : Promise<BoardResponseDto> {
    if (!user.id) {
      throw new UnauthorizedException('User id missing');
    }
    const result = await this.engine.boardModification(body.gameId, body.action, user.id);
    // console.log(`Board move request for game ${body.gameId} from user ${user.id}:`, body.action);    
    if (result.ok) {
      await this.wsGateway.sendPlayUpdate(body.gameId);

      const state = await this.engine.getGameState(body.gameId);
      if (state?.phase === 'END') {
        await Promise.all([
          ...state.players.map((p) => this.wsGateway.sendPlayerStatusUpdate(p.id)),
          ...state.spectators.map((s) => this.wsGateway.sendPlayerStatusUpdate(s.id)),
        ]);
      }
    }
    return result;
  }

  //Player move
  @Post('playermove')
  @ApiBody({ type: PlayerMoveDto })
  @ApiResponse({ status: 201, type: PlayerActionResponseDto })
  async playerMove(
    @Body() body: PlayerMoveDto,
    @CurrentUser() user: PlayerContext
  ) : Promise<PlayerActionResponseDto> {
      if (!user.id) {
      throw new UnauthorizedException('User id missing');
    }

    const action: PlayerAction = {
      path: body.path,
      skip: body.skip || false,
    };

    const result = await this.engine.playerAction(body.gameId, action, user.id);
    
    if (result.ok) {
      await this.wsGateway.sendPlayUpdate(body.gameId);

      const state = await this.engine.getGameState(body.gameId);
      if (state?.phase === 'END') {
        await Promise.all([
          ...state.players.map((p) => this.wsGateway.sendPlayerStatusUpdate(p.id)),
          ...state.spectators.map((s) => this.wsGateway.sendPlayerStatusUpdate(s.id)),
        ]);
      }
    }
    return result;
  }

  // Leave game
  @Post('leave')
  @ApiBody({ type: LeaveGameDto })
  @HttpCode(200)
  @ApiResponse({ status: 200, type: LeaveResponseDto })
  async leaveGame(
    @Body() body: LeaveGameDto,
    @CurrentUser() user: PlayerContext
  ) : Promise<LeaveResponseDto> {
    const result = await this.engine.leaveGame(body.gameId, user.id);

    if (result.ok) {
      await this.wsGateway.sendMultiplayerListUpdate();
      await this.wsGateway.sendPlayerStatusUpdate(user.id.toString());
      await this.wsGateway.sendLobbyUpdate(body.gameId);

      if (result.deleteGame) {
        await Promise.all(
          (result.previousPlayers ?? []).map((id) => this.wsGateway.sendPlayerStatusUpdate(id)),
        );
        await this.wsGateway.sendGameDeleted(body.gameId);
      } else {
        // If game not deleted, still notify play phase clients of player leaving
        await this.wsGateway.sendPlayUpdate(body.gameId);
      }

    }

    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }

  // Get game state
  @Get(':gameId')
  @ApiParam({ name: 'gameId', type: 'string' })
  @ApiOkResponse({ type: GameStateResponseDto })
  async getGameState(
    @Param('gameId') gameId: string,
    @CurrentUser() user: PlayerContext
  ): Promise<GameStateResponseDto> {
    if (!user.id) {
      throw new UnauthorizedException('User id missing');
    }

    const result = await this.engine.getPrivateGameState(gameId, user.id);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    return { ok: true, state: result.state };
  }

  @Get('single/levels')
  @ApiOkResponse({ type: SingleLevelDto, isArray: true })
  getSingleLevels(): SingleLevelDto[] {
    return this.engine.getSinglePlayerLevels();
  }

  @Get('multi/games')
  @ApiOkResponse({ type: MultiGameDto, isArray: true })
  async getMultiplayerGames(): Promise<MultiGame[]> {
    return this.engine.getMultiGames();
  }

  @Get('check-player')
  @ApiOkResponse({
    description: "Player availability result",
    type: CheckPlayerAvailabilityDto,
  })
  async checkPlayer(@CurrentUser() user: PlayerContext) {
    if (!user || !user.id) {
      throw new UnauthorizedException("User not authenticated");
    }

    try {
      const result = await this.engine.checkPlayerAvailability(user.id);

      return {
        ok: result.ok,
        gameId: result.gameId,
        phase: result.phase || "LOBBY", // default phase
      };
    } catch (err) {
      console.error("Check player availability failed:", err);

      return {
        ok: false,
        phase: "LOBBY",
      };
    }
  }

}