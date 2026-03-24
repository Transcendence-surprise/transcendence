# Leave Rules for Multiplayer Game

This document summarizes the rules and behaviors for players leaving a game session.

## General Rules
- Any player (including the host) can leave the game at any time.
- Spectators can leave at any time without affecting the game state.

## Host Leaving
- **In LOBBY phase:**
  - If the host leaves, the game is deleted for everyone (`deleteGame: true`).
- **In PLAY phase:**
  - If the host leaves, the host is simply removed from the players list.
  - The game continues as long as more than one player remains.
  - If only one player remains after the host (or any player) leaves, the game is deleted (`deleteGame: true`).

## Player Leaving
- Any non-host player can leave at any time.
- When a player leaves:
  - They are removed from the players list.
  - If the leaving player is the current player, the turn advances to the next player.
  - If only one player remains after the leave, the game is deleted (`deleteGame: true`).

## Spectator Leaving
- Spectators can leave at any time.
- Their departure does not affect the game or other players.

## API Behavior
- The `leaveGameEngine` function returns `{ ok: true, deleteGame: true }` if the game should be deleted after a leave.
- Otherwise, it returns `{ ok: true }` for a successful leave.
- If a leave is not possible (e.g., player not found), `{ ok: false, error: ... }` is returned.

---

This document should be kept up to date with any changes to leave logic or game rules.
