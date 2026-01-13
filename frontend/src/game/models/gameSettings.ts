export interface SinglePlayerSettings {
  allowSpectators?: false;
  levelId?: string;
}

export interface MultiplayerSettings {
  maxPlayers: 2 | 3 | 4;
  allowSpectators: boolean;
  boardSize: 6 | 7 | 8 | 9;
  collectiblesPerPlayer: number;
}

export type GameSettings =
  | ({ mode: "SINGLE" } & SinglePlayerSettings)
  | ({ mode: "MULTI" } & MultiplayerSettings);