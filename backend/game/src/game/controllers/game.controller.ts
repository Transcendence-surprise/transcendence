import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { EngineService } from '../services/engine.service.nest';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
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
  BoardMoveDto,
  BoardResponseDto,
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
  createGame(
    @Body() body: CreateGameDto,
    @CurrentUser() user: PlayerContext,
  ): CreateGameResponseDto {

    if (!user.id) {
      throw new UnauthorizedException('User id missing');
    }

    const settings = body as GameSettings;

    const { gameId } = this.engine.createGame(
      user.id,
      user.username,
      settings
    );
    console.log(`Game created with ID: ${gameId} in phase ${this.engine.getGameState(gameId)?.phase || 'IDK'} by user ${user.id}`);
    this.wsGateway.sendMultiplayerListUpdate();
    this.wsGateway.sendPlayerStatusUpdate(user.id.toString());
    return { ok: true, gameId };
  }

  // Start game
  @Post('start')
  @ApiBody({ type: StartGameDto })
  @ApiResponse({ status: 201, type: StartResponseDto })
  startGame(
    @Body() body: StartGameDto,
    @CurrentUser() user: PlayerContext
   ): StartResponseDto {
    const result = this.engine.startGame(body.gameId, user.id);

    if (result.ok) {
      this.wsGateway.sendMultiplayerListUpdate();
      this.wsGateway.sendLobbyUpdate(body.gameId);
    }

    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }

  // Join game
  @Post('join')
  @ApiBody({ type: JoinGameDto })
  @ApiResponse({ status: 201, type: JoinResponseDto })
  join(
    @Body() body: JoinGameDto,
    @CurrentUser() user: PlayerContext
  ) : JoinResponseDto {
    const result = this.engine.joinGame(body.gameId, user.id, user.username, body.role);

    if (result.ok) {
      this.wsGateway.sendMultiplayerListUpdate();
      this.wsGateway.sendPlayerStatusUpdate(user.id.toString());
    }
    // console.log("User Joined: ", body.playerId );
    return result;
  }

  // Make move

  //Board modification
  @Post('boardmove')
  @ApiBody({ type: BoardMoveDto })
  @ApiResponse({ status: 201, type: BoardResponseDto })
  boardMove(
    @Body() body: BoardMoveDto,
    @CurrentUser() user: PlayerContext
  ) : BoardResponseDto {

    if (!user.id) {
      throw new UnauthorizedException('User id missing');
    }

    const result = this.engine.boardModification(body.gameId, body.action, user.id);
    
    if (result.ok) {
      this.wsGateway.sendPlayUpdate(body.gameId);
    }
    return result;
  }


  // Leave game
  @Post('leave')
  @ApiBody({ type: LeaveGameDto })
  @ApiResponse({ status: 201, type: LeaveResponseDto })
  leaveGame(
    @Body() body: LeaveGameDto,
    @CurrentUser() user: PlayerContext
  ) : LeaveResponseDto {
    const result = this.engine.leaveGame(body.gameId, user.id);

    if (result.ok) {
      this.wsGateway.sendMultiplayerListUpdate();
      this.wsGateway.sendPlayerStatusUpdate(user.id.toString());
      this.wsGateway.sendLobbyUpdate(body.gameId);

      if (result.deleteGame) {
        result.previousPlayers?.forEach(id =>
          this.wsGateway.sendPlayerStatusUpdate(id)
        );
        this.wsGateway.sendGameDeleted(body.gameId);
      } else {
        // If game not deleted, still notify play phase clients of player leaving
        this.wsGateway.sendPlayUpdate(body.gameId);
      }

    }

    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }

  // Get game state
  @Get(':gameId')
  @ApiParam({ name: 'gameId', type: 'string' })
  @ApiOkResponse({ type: GameStateResponseDto })
  getGameState(
    @Param('gameId') gameId: string,
    @CurrentUser() user: PlayerContext
  ): GameStateResponseDto {
    const state = this.engine.getPrivateGameState(gameId, user.id);

    if (!state) {
      throw new NotFoundException(`Game not found`);
    }

    if (!user.id) {
      throw new UnauthorizedException('User id missing');
    }

      const result = this.engine.getPrivateGameState(gameId, user.id);

      if (!result) {
        throw new NotFoundException(`Game not found`);
      }

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
  getMultiplayerGames(): MultiGame[] {
    return this.engine.getMultiGames();
  }

  @Get('check-player')
  @ApiOkResponse({
    description: "Player availability result",
    type: CheckPlayerAvailabilityDto,
  })
  checkPlayer(@CurrentUser() user: PlayerContext) {
    if (!user || !user.id) {
      throw new UnauthorizedException("User not authenticated");
    }

    try {
      const result = this.engine.checkPlayerAvailability(user.id);

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