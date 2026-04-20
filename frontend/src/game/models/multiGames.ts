// models/SingleLevel.ts
export type MultiGame = {
  id: string;                   // unique game ID
  hostName: string;             // host nickname
  phase: "LOBBY" | "PLAY";      // current game phase
  maxPlayers: number;            // maximum allowed players
  joinedPlayers: number;         // current joined players
  allowSpectators: boolean;
  collectiblesPerPlayer: number;
};
