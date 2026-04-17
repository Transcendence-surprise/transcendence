// src/components/game/sidebar/PlayerList.tsx
import { PlayerState } from "../../../game/models/privatState";
import { mockPlayerProfile } from "../../../types/mockPlayer";

interface PlayerListProps {
  players: PlayerState[];
  currentPlayerId: string | number;
  playerProgress?: Record<string, { collectedItems?: string[] }>;
  collectiblesPerPlayer?: number;
  spectatorIds?: string[];
}

export default function PlayerList({
  players,
  currentPlayerId,
  playerProgress = {},
  collectiblesPerPlayer = 5,
  spectatorIds = [],
}: PlayerListProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {players.map((p) => {
        const isCurrent = p.id.toString() === currentPlayerId.toString();
        return (
          <div
            key={p.id}
            className={`flex items-center gap-3 p-2 rounded-lg border 
              ${isCurrent ? "border-cyan-400 bg-cyan-900/30" : "border-[var(--color-border-subtle)]"}
            `}
          >
            {/* Avatar */}
            <img
              src={mockPlayerProfile.avatar} // TODO: replace with real avatar when available
              alt={p.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
            />

            {/* Player info */}
            <div className="flex flex-col">
              <span className="text-white font-medium">{p.name}</span>
              <span className="text-xs text-gray-400">
                Skips left: {p.skipsLeft} • Collected{" "}
                {playerProgress[p.id.toString()]?.collectedItems?.length ?? 0}/
                {collectiblesPerPlayer}
              </span>
            </div>

            {/* Highlight current turn */}
            {isCurrent && (
              <span className="ml-auto text-sm font-bold text-cyan-400">
                TURN
              </span>
            )}
          </div>
        );
      })}

      {/* Spectators Section */}
      {spectatorIds.length > 0 && (
        <>
          <div className="border-t border-[var(--color-border-subtle)] my-2" />
          <div className="text-xs font-semibold text-gray-400 uppercase">
            Spectators
          </div>
          {spectatorIds.map((spectatorId) => (
            <div
              key={spectatorId}
              className="flex items-center gap-3 p-2 rounded-lg border border-[var(--color-border-subtle)] opacity-75"
            >
              {/* Avatar */}
              <img
                src={mockPlayerProfile.avatar} // TODO: replace with real avatar when available
                alt={`Spectator ${spectatorId}`}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
              />

              {/* Spectator info */}
              <div className="flex flex-col">
                <span className="text-gray-300 font-medium">{spectatorId}</span>
                <span className="text-xs text-gray-500">Spectating</span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}





















                  {spectatorUsers[spectatorId]?.username || spectatorId}