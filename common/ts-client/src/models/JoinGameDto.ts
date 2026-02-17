/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type JoinGameDto = {
    gameId: string;
    playerId: string;
    role: JoinGameDto.role;
};
export namespace JoinGameDto {
    export enum role {
        PLAYER = 'PLAYER',
        SPECTATOR = 'SPECTATOR',
    }
}

