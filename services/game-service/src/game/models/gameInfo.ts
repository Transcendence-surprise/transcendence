export type MultiGame = {
  id: string;                   // unique game ID
  hostId: string;               // will become host nickname later
  phase: "LOBBY" | "PLAY";      // current game phase
  maxPlayers: number;            // maximum allowed players
  joinedPlayers: number;         // current joined players
  allowSpectators: boolean;
  collectiblesPerPlayer: number;
};
