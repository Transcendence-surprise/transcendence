// src/components/game/sidebar/PlayerList.tsx
import { PlayerState } from "../../../game/models/privatState";
import { getMockAvatarSrc } from "../../../types/mockPlayer";

interface PlayerListProps {
  players: PlayerState[];
  currentPlayerId: string | number;
  playerProgress?: Record<string, { collectedItems?: string[] }>;
  collectiblesPerPlayer?: number;
}

export default function PlayerList({
  players,
  currentPlayerId,
  playerProgress = {},
  collectiblesPerPlayer = 5,
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
              src={p.avatarUrl || getMockAvatarSrc(`user-${p.id}`)}
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
    </div>
  );
}
