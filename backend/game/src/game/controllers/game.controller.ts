import { Controller, Post, Body, Get, Param, HttpCode } from '@nestjs/common';
import { EngineService } from '../services/engine.service.nest';
import { UnauthorizedException } from '@nestjs/common';
import { GameSettings } from '../models/state';
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
    const result = await this.engine.joinGame(
      body.gameId, 
      user.id, 
      user.username,
      body.role);
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
    console.log(`Received board move request for gameId ${body.gameId} from user ${user.id}`);
    const result = await this.engine.boardModification(body.gameId, body.action, user.id);
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
    console.log(`Received player move request for gameId ${body.gameId} from user ${user.id}`);
    const action: PlayerAction = {
      path: body.path,
      skip: body.skip || false,
    };

    const result = await this.engine.playerAction(body.gameId, action, user.id);

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

    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }

  // Internal realtime state for gateway ticker (no per-user filtering)
  @Get('internal/:gameId')
  @ApiParam({ name: 'gameId', type: 'string' })
  getInternalRealtimeState(@Param('gameId') gameId: string) {
    const state = this.engine.getGameState(gameId);
    if (!state) {
      return { ok: false, error: 'GAME_NOT_FOUND' };
    }

    return { ok: true, state };
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
