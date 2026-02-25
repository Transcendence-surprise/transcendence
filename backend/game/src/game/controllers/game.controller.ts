import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { EngineService } from '../services/engine.service.nest';
import { UnauthorizedException } from '@nestjs/common';
import { GameState, GameSettings } from '../models/state';
import { WsGateway } from '../../ws/ws.gateway';
// import { BoardAction } from '../models/boardAction';
// import { MoveAction } from '../models/moveAction';
import { ApiBody, ApiOkResponse, ApiParam, ApiResponse } from '@nestjs/swagger';
import {
  CreateGameDto,
  CreateGameResponseDto,
  StartGameDto,
  StartResponseDto,
  JoinGameDto,
  JoinResponseDto,
//   MoveDto,
  LeaveGameDto,
  LeaveResponseDto,
  GameStateDto,
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
  // @Post('create')
  // @ApiBody({ type: CreateGameDto })
  // @ApiResponse({ status: 201, type: CreateGameResponseDto })
  // createGame(@Body() body: CreateGameDto) : CreateGameResponseDto {
  //   const { gameId } = this.engine.createGame(body.hostId, body.settings);

  //   this.wsGateway.sendMultiplayerListUpdate();
  //   // console.log("Game was created", gameId );
  //   return { ok: true, gameId };
  // }
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

    const { gameId } = this.engine.createGame( user.id, user.username, body.settings);
    this.wsGateway.sendMultiplayerListUpdate();
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
    }
    // console.log("User Joined: ", body.playerId );
    return result;
  }

//   // Make move
//   @Post('move')
//   @ApiBody({ type: MoveDto })
//   move(
//     @Body() body: {
//       gameId: string;
//       playerId: string;
//       boardAction?: BoardAction;
//       moveAction?: MoveAction;
//     }
//   ) {
//     // Retrieve game state (from memory/db)
//     const state: GameState = this.engine.getGameState(body.gameId);

//     // Call your engine logic
//     const result = this.engine.processTurn(
//       state,
//       body.boardAction ?? null,
//       body.moveAction
//     );

//     return result.ok ? { ok: true } : { ok: false, error: result.error };
//   }

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
    }

    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }

  @Get(':gameId') // Need define fields thats I return
  @ApiParam({ name: 'gameId', type: 'string' })
  @ApiOkResponse({ type: GameStateDto })
  getGameState(@Param('gameId') gameId: string) {
    return this.engine.getGameState(gameId);
  }

  @Get('single/levels')
  @ApiOkResponse({ type: SingleLevelDto, isArray: true })
  getSingleLevels(): SingleLevelDto[] {
    return this.engine.getSinglePlayerLevels();
  }

  @Get("multi/games")
  @ApiOkResponse({ type: MultiGameDto, isArray: true })
  getMultiplayerGames(): MultiGame[] {
    return this.engine.getMultiGames();
  }

  @Get("check-player")
  @ApiOkResponse({
    description: "Player availability result",
    type: CheckPlayerAvailabilityDto,
  })
  checkPlayer(@CurrentUser() user: PlayerContext) {
    return this.engine.checkPlayerAvailability(user.id);
  }

}