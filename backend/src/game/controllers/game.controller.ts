import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { EngineService } from '../services/engine.service.nest';
import { GameState, GameSettings } from '../models/state';
import { WsGateway } from '../../ws/ws.gateway';
// import { BoardAction } from '../models/boardAction';
// import { MoveAction } from '../models/moveAction';
import { ApiBody, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import {
  CreateGameDto,
  StartGameDto,
  JoinGameDto,
//   MoveDto,
  LeaveGameDto,
  GameStateDto,
} from '../dtos/game.dto';
import { SingleLevelDto } from '../dtos/level-registry.dto';
import { MultiGameDto } from '../dtos/game-lobby-list';
import { MultiGame } from '../models/gameInfo';

@Controller('game')
export class GameController {
  constructor(
    private readonly engine: EngineService,
  private readonly wsGateway: WsGateway,
) {}

  // Create Game
  @Post('create')
  @ApiBody({ type: CreateGameDto })
  createGame(
    @Body() body: {
      hostId: string;
      settings: GameSettings;
    }
  ) {
    const { gameId } = this.engine.createGame(
      body.hostId,
      body.settings
    );

    this.wsGateway.sendMultiplayerListUpdate();
    console.log("Game was created", gameId );
    return { ok: true, gameId };
  }

  // Start game
  @Post('start')
  @ApiBody({ type: StartGameDto })
  startGame(
    @Body() body: { gameId: string; hostId: string }
  ) {
    const result = this.engine.startGame(body.gameId, body.hostId);

    if (result.ok) {
      this.wsGateway.sendMultiplayerListUpdate();
    }

    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }

  // Join game
  @Post('join')
  @ApiBody({ type: JoinGameDto })
  join(@Body() body: { gameId: string; playerId: string; role: "PLAYER" | "SPECTATOR" }) {
    const result = this.engine.joinGame(body.gameId, body.playerId, body.role);

    if (result.ok) {
      this.wsGateway.sendMultiplayerListUpdate();
    }

    console.log("User Joined: ", body.playerId );

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
  leaveGame(
    @Body() body: { gameId: string; playerId: string }
  ) {
    const result = this.engine.leaveGame(body.gameId, body.playerId);

    if (result.ok) {
      this.wsGateway.sendMultiplayerListUpdate();
    }

    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }

  @Get(':gameId')
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
}
