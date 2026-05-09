import LobbyChat from "./LobbyChat";
import LobbyPlayerList from "./lobby/LobbyPlayerList";
import { LobbySettings } from "./lobby/LobbySettings";
import LobbyActionButton from "./lobby/LobbyActionButton";
import { LobbyMessage } from "../../game/models/lobbyMessage";
import InfoChip from "../shared/InfoChip";

export type LobbyProps = {
  game: any;
  currentUserId?: string | number;
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
  currentUserId,
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
  const isHost =
    currentUserId != null &&
    hostId != null &&
    String(currentUserId) === String(hostId);

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
              <InfoChip className="text-cyan-200">
                {players.length}/{rules.maxPlayers} players ready
              </InfoChip>
              {rules.allowSpectators ? (
                <InfoChip className="text-cyan-200">
                  Spectators allowed
                </InfoChip>
              ) : null}
            </div>
          </div>

          {/* Main content: Players + Chat */}
          <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            {/* Players column */}
            <div className="space-y-4">
              <LobbyPlayerList
                players={players}
                hostId={hostId}
                maxPlayers={rules.maxPlayers}
              />
              <LobbySettings rules={rules} />

              <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
                  {game.phase === "LOBBY" && (
                    <span
                      className={`group relative w-full ${!isHost ? "cursor-not-allowed" : ""}`.trim()}
                    >
                      <LobbyActionButton
                        onClick={onGameStarted}
                        disabled={starting || !isHost}
                        variant="primary"
                      >
                        {starting ? "Starting..." : "Start Game"}
                      </LobbyActionButton>
                      {!starting && !isHost ? (
                        <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                          Only the host can start the game
                        </span>
                      ) : null}
                    </span>
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
