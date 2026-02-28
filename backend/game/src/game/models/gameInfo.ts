export type MultiGame = {
  id: string;                   // unique game ID
  hostId: number;               // will become host nickname later
  hostName: string;
  phase: "LOBBY" | "PLAY";      // current game phase
  maxPlayers: number;            // maximum allowed players
  joinedPlayers: number;         // current joined players
  allowSpectators: boolean;
  collectiblesPerPlayer: number;
};
