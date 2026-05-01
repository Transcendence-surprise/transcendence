// src/game/components/Lobby.tsx
import LobbyChat from "./LobbyChat";
import PlayerList from "../UI/PlayerList";
import { LobbySettings } from "../UI/LobbySettings";
import LobbyActionButton from "../UI/LobbyActionButton";
import { LobbyMessage } from "../../game/models/lobbyMessage";

export type LobbyProps = {
  game: any;
  gameId?: string;
  onGameStarted: () => void;
  onGameLeave: () => void;
  error?: string | null;
  starting?: boolean;
  leaveError?: string | null;
  messages: LobbyMessage[];
  input: string;
  setInput: (value: string) => void;
  sendMessage: () => void;
};

export default function Lobby({
  game,
  gameId,
  onGameStarted,
  onGameLeave,
  error,
  starting,
  leaveError,
  messages,
  input,
  setInput,
  sendMessage,
}: LobbyProps) {
  const rules = {
    mode: "MULTI",
    maxPlayers: 2,
    allowSpectators: false,
    collectiblesPerPlayer: 1,
    fixedCorners: false,
    requiresBoardActionPerTurn: true,
    boardSize: 7,
    ...(game?.rules ?? {}),
  };

  const players = Array.isArray(game?.players) ? game.players : [];
  const hostId = game?.hostId;
  const gameIdLabel = gameId ?? game?.id ?? game?.gameId ?? "Unknown";

  return (
    <div className="flex min-h-screen items-start justify-center bg-bg-dark px-4 py-10 font-sans text-white">
      <div className="relative w-full max-w-6xl">
        <div className="absolute -inset-1 rounded-[28px] bg-[radial-gradient(circle_at_top,rgba(0,234,255,0.18),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(92,144,246,0.14),transparent_35%)] blur-2xl" />

        <div className="relative rounded-[28px] border border-[var(--color-border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))] px-6 py-8 shadow-dark-lg sm:px-8 sm:py-10">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <p className="text-xs uppercase tracking-[0.34em] text-white/40">
              Multiplayer Lobby
            </p>
            <h2 className="text-balance text-3xl font-bold text-light-cyan drop-shadow-lg sm:text-4xl md:text-5xl">
              Waiting for players to join
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-white/60">
              {/* <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                Game ID: {gameIdLabel}
              </span> */}
              <span className="rounded-full border border-cyan-400/15 bg-cyan-400/8 px-3 py-1 text-cyan-200">
                {players.length}/{rules.maxPlayers} players ready
              </span>
              {rules.allowSpectators ? (
                <span className="rounded-full border border-cyan-400/15 bg-cyan-400/8 px-3 py-1 text-cyan-200">
                  Spectators allowed
                </span>
              ) : null}
            </div>
          </div>

          {/* Main content: Players + Chat */}
          <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            {/* Players column */}
            <div className="space-y-4">
              <PlayerList
                players={players}
                hostId={hostId}
                maxPlayers={rules.maxPlayers}
              />
              <LobbySettings rules={rules} />

              <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
                  {game.phase === "LOBBY" && (
                    <LobbyActionButton
                      onClick={onGameStarted}
                      disabled={starting}
                      variant="primary"
                    >
                      {starting ? "Starting..." : "Start Game"}
                    </LobbyActionButton>
                  )}

                  <LobbyActionButton onClick={onGameLeave} variant="leave">
                    Leave Lobby
                  </LobbyActionButton>
              </div>
            </div>

            {/* Chat column */}
            <div className="min-w-0">
              <LobbyChat
                messages={messages}
                input={input}
                setInput={setInput}
                onSend={sendMessage}
              />
            </div>
          </div>

          {/* Errors */}
          {error && (
            <p className="mb-4 text-center text-sm text-red-400">{error}</p>
          )}
          {leaveError && (
            <p className="mb-4 text-center text-sm text-red-400">
              {leaveError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
