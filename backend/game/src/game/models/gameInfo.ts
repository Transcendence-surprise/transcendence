export type MultiGame = {
  id: string;                   // unique game ID
  hostId: number | string;               // user ID or guest UUID
  hostName: string;
  phase: "LOBBY" | "PLAY";      // current game phase
  maxPlayers: number;            // maximum allowed players
  joinedPlayers: number;         // current joined players
  allowSpectators: boolean;
  collectiblesPerPlayer: number;
};
