// src/game/components/Lobby.tsx
import LobbyChat from "./LobbyChat";
import PlayerList from "../UI/PlayerList";
import { LobbySettings } from "../UI/LobbySettings";
import LobbyActionButton from "../UI/LobbyActionButton";
import { LobbyMessage } from "../../game/models/lobbyMessage";

export type LobbyProps = {
  game: any;
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
  console.log("Lobby received:", game);

  return (
    <div className="min-h-screen bg-black text-[#00eaff] font-mono flex items-start justify-center px-4 py-10">
      <div className="relative w-full max-w-5xl">
        <div className="absolute -inset-1 rounded-2xl bg-[radial-gradient(circle_at_top,rgba(0,234,255,0.25),transparent_55%)] blur-2xl" />

        <div className="relative rounded-2xl border border-[#FFFFFF1A] bg-[#0B0B0F] px-8 py-10 shadow-[0_16px_50px_rgba(0,0,0,0.6)]">
          {/* Header */}
          <div className="flex flex-col items-center gap-2 mb-8">
            <h2 className="text-4xl font-bold drop-shadow-lg text-[#7BE9FF]">
              Waiting for players to join
            </h2>
            {/* <p className="text-xs uppercase tracking-[0.4em] text-[#7BE9FF]">
              Waiting for players to join
            </p> */}
            {/* <p className="text-sm text-[#B7F6FF] text-center max-w-md">
              Game ID: {game.id} • Host: {game.hostId}
            </p> */}
          </div>

          {/* Spectators badge */}
          {game.rules.allowSpectators && (
            <div className="mb-4 flex justify-start">
              <span className="text-xs px-3 py-1 rounded-full bg-[#0B2A30]/60 border border-cyan-300/30 text-cyan-200">
                Spectators Allowed
              </span>
            </div>
          )}

          {/* Main content: Players + Chat */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Players column */}
            <div className="lg:col-span-1">
              <PlayerList
                players={game.players}
                hostId={game.hostId}
                maxPlayers={game.rules.maxPlayers}
              />
                {/* Settings block */}
              <LobbySettings rules={game.rules} />
            </div>

            {/* Chat column */}
            <div className="lg:col-span-2">
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
            <p className="mb-4 text-red-400 text-center text-sm">{error}</p>
          )}
          {leaveError && (
            <p className="mb-4 text-red-400 text-center text-sm">
              {leaveError}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-4">
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
        </div>
      </div>
    </div>
  );
}
