// src/components/game/sidebar/PlayerList.tsx
import { useEffect, useState } from "react";
import { PlayerState } from "../../../game/models/privatState";
import { mockPlayerProfile } from "../../../types/mockPlayer";
import * as usersApi from "../../../api/users";

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
  const [spectatorUsers, setSpectatorUsers] = useState<
    Record<string, usersApi.User>
  >({});

  useEffect(() => {
    if (spectatorIds.length === 0) return;

    const controller = new AbortController();
    usersApi
      .getAllUsers(controller.signal)
      .then((users) => {
        const spectatorMap: Record<string, usersApi.User> = {};
        users.forEach((u) => {
          if (spectatorIds.includes(u.id.toString())) {
            spectatorMap[u.id.toString()] = u;
          }
        });
        setSpectatorUsers(spectatorMap);
      })
      .catch((e) => {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          console.error("Failed to fetch spectator users:", e);
        }
      });

    return () => controller.abort();
  }, [spectatorIds]);

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
                <span className="text-gray-300 font-medium">
                  {spectatorUsers[spectatorId]?.username || spectatorId} //TODO: replace with real username when available
                </span>
                <span className="text-xs text-gray-500">Spectating</span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
