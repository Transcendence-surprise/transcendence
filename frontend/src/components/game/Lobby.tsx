// src/game/components/Lobby.tsx
import React from "react";
import LobbyChat from "./LobbyChat";
import { LobbyMessage } from "../../game/models/lobbyMessage";

export type LobbyProps = {
  game: any;
  currentUserId: string;
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

  const isHost = game.hostId === currentUserId;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center space-y-4 p-4">
      <h2 className="text-2xl font-bold">Lobby for Game {game.id}</h2>
      <p>Host: {game.hostId}</p>
      <p>
        Players joined: {game.players.length} / {game.rules.maxPlayers}
      </p>
      {game.rules.allowSpectators && <p>Spectators allowed</p>}

      <div className="flex flex-col items-start space-y-1 mt-4">
        <h3 className="font-semibold">Players:</h3>
        {game.players.map((player: any) => (
          <p key={player.id}>
            {player.id} {player.id === currentUserId && "(You)"}
          </p>
        ))}
      </div>

      {error && (
        <p className="text-red-400 text-sm mt-2">
          {error}
        </p>
      )}

      {isHost && game.phase === "LOBBY" && (
        <button
          disabled={starting}
          className="px-6 py-3 bg-green-600 rounded-lg shadow-lg hover:bg-green-500 disabled:opacity-50 mt-4"
          onClick={onGameStarted}
        >
          {starting ? "Starting..." : "Start Game"}
        </button>
      )}

      <button
        className="px-6 py-3 bg-red-600 rounded-lg shadow-lg hover:bg-red-500 mt-4"
        onClick={onGameLeave}
      >
        Leave Lobby
      </button>

      {leaveError && (
        <p className="text-red-400 text-sm mt-2">
          {leaveError}
        </p>
      )}

      <div className="flex flex-col items-start space-y-1 mt-4">
        <LobbyChat
          messages={messages}
          input={input}
          setInput={setInput}
          onSend={sendMessage}
        />
      </div>

    </div>
  );
}