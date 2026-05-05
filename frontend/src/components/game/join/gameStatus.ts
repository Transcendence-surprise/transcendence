import { MultiGame } from "../../../game/models/multiGames";

export type LobbyGameStatus = "OPEN" | "LIVE" | "FULL";

export function getLobbyGameStatus(game: MultiGame): LobbyGameStatus {
  if (game.phase === "LOBBY" && game.joinedPlayers < game.maxPlayers) {
    return "OPEN";
  }

  if (game.phase === "PLAY" && game.allowSpectators) {
    return "LIVE";
  }

  return "FULL";
}

export function getLobbyGameStatusLabel(status: LobbyGameStatus) {
  switch (status) {
    case "OPEN":
      return "Open";
    case "LIVE":
      return "Live";
    case "FULL":
    default:
      return "Full";
  }
}
