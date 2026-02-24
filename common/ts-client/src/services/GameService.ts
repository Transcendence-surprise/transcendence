/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CheckPlayerAvailabilityDto } from '../models/CheckPlayerAvailabilityDto';
import type { CreateGameDto } from '../models/CreateGameDto';
import type { GameStateDto } from '../models/GameStateDto';
import type { JoinGameDto } from '../models/JoinGameDto';
import type { LeaveGameDto } from '../models/LeaveGameDto';
import type { MultiGameDto } from '../models/MultiGameDto';
import type { SingleLevelDto } from '../models/SingleLevelDto';
import type { StartGameDto } from '../models/StartGameDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GameService {
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static gameControllerCreateGame(
        requestBody: CreateGameDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/game/create',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static gameControllerStartGame(
        requestBody: StartGameDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/game/start',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static gameControllerJoin(
        requestBody: JoinGameDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/game/join',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static gameControllerLeaveGame(
        requestBody: LeaveGameDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/game/leave',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param gameId
     * @returns GameStateDto
     * @throws ApiError
     */
    public static gameControllerGetGameState(
        gameId: string,
    ): CancelablePromise<GameStateDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/{gameId}',
            path: {
                'gameId': gameId,
            },
        });
    }
    /**
     * @returns SingleLevelDto
     * @throws ApiError
     */
    public static gameControllerGetSingleLevels(): CancelablePromise<Array<SingleLevelDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/single/levels',
        });
    }
    /**
     * @returns MultiGameDto
     * @throws ApiError
     */
    public static gameControllerGetMultiplayerGames(): CancelablePromise<Array<MultiGameDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/multi/games',
        });
    }
    /**
     * @param playerId Player ID to check availability across multiplayer games
     * @returns CheckPlayerAvailabilityDto Player availability result
     * @throws ApiError
     */
    public static gameControllerCheckPlayer(
        playerId: string,
    ): CancelablePromise<CheckPlayerAvailabilityDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/game/check-player/{playerId}',
            path: {
                'playerId': playerId,
            },
        });
    }
}
