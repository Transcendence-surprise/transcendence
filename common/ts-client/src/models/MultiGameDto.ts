/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MultiGameDto = {
    /**
     * Unique game ID
     */
    id: string;
    /**
     * Host ID (or nickname later)
     */
    hostId: string;
    /**
     * Current phase of the game
     */
    phase: MultiGameDto.phase;
    /**
     * Maximum number of players allowed
     */
    maxPlayers: number;
    /**
     * Number of players currently joined
     */
    joinedPlayers: number;
    /**
     * Whether spectators are allowed
     */
    allowSpectators: boolean;
    /**
     * Number of collectibles per player
     */
    collectiblesPerPlayer: number;
    /**
     * Optional description of the game
     */
    description?: string;
};
export namespace MultiGameDto {
    /**
     * Current phase of the game
     */
    export enum phase {
        LOBBY = 'LOBBY',
        PLAY = 'PLAY',
    }
}

