// src/components/game/JoinOrCreateTable.tsx
import React from "react";
import { MultiGame } from "../../game/models/multiGames";

type Props = {
  games: MultiGame[];
  onJoin: (gameId: string) => void;
  onSpectate: (gameId: string) => void;
  onBack: () => void;
};

export default function JoinTable({ games, onJoin, onSpectate, onBack }: Props) {
  if (games.length === 0) return <p>No active games found</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col space-y-4">
      <h2 className="text-2xl font-bold mb-4">Join Multiplayer Game</h2>

      <table className="w-full text-left border border-gray-700">
        <thead>
          <tr>
            <th className="p-2 border-b border-gray-700">Host</th>
            <th className="p-2 border-b border-gray-700">Players</th>
            <th className="p-2 border-b border-gray-700">Max</th>
            <th className="p-2 border-b border-gray-700">Phase</th>
            <th className="p-2 border-b border-gray-700">Spectators</th>
            <th className="p-2 border-b border-gray-700">Action</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.id}>
              <td className="p-2 border-b border-gray-700">{game.hostId}</td>
              <td className="p-2 border-b border-gray-700">{game.joinedPlayers}</td>
              <td className="p-2 border-b border-gray-700">{game.maxPlayers}</td>
              <td className="p-2 border-b border-gray-700">{game.phase}</td>
              <td className="p-2 border-b border-gray-700">{game.allowSpectators ? "Yes" : "No"}</td>
              <td className="p-2 border-b border-gray-700">
                {/* Join as player if in lobby and space */}
                {game.phase === "LOBBY" && game.joinedPlayers < game.maxPlayers && (
                  <button
                    className="px-4 py-1 bg-green-600 rounded hover:bg-green-500 mr-2"
                    onClick={() => onJoin(game.id)}
                  >
                    Join
                  </button>
                )}

                {/* Spectate in lobby or play if allowed */}
                {(game.phase === "PLAY" && game.allowSpectators) && (
                  <button
                    className="px-4 py-1 bg-blue-600 rounded hover:bg-blue-500"
                    onClick={() => onSpectate(game.id)}
                  >
                    Spectate
                  </button>
                )}

                {/* Full games */}
                {game.phase === "PLAY" && !game.allowSpectators && (
                  <span className="text-gray-500">Full</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Back button */}
      <button
        className="mt-4 px-6 py-2 bg-gray-600 rounded hover:bg-gray-500 self-start"
        onClick={onBack}
      >
        Back
      </button>
    </div>
  );
}
