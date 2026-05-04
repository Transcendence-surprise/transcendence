import InfoChip from "../shared/InfoChip";
import Avatar from "../shared/Avatar";

type PlayerListProps = {
  players: {
    id: number | string;
    displayName?: string;
    username?: string;
    name?: string;
    avatarUrl?: string | null;
  }[];
  hostId: number | string;
  maxPlayers: number;
};

export default function LobbyPlayerList({
  players,
  hostId,
  maxPlayers,
}: PlayerListProps) {
  const openSlots = Math.max(0, maxPlayers - players.length);

  return (
    <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))] px-5 py-5 shadow-[0_12px_32px_rgba(0,0,0,0.16)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-cyan-bright">Players</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">
            Lobby roster
          </p>
        </div>
        <InfoChip className="text-sm font-semibold">
          {players.length} / {maxPlayers}
        </InfoChip>
      </div>

      <div className="space-y-2.5">
        {players.map((player) => {
          const isHost = String(player.id) === String(hostId);
          const playerName =
            player.displayName?.trim() ||
            player.username?.trim() ||
            player.name?.trim() ||
            "Unknown player";
          return (
            <div
              key={player.id}
              className="flex items-center gap-3 rounded-lg border border-neutral-500 bg-black/20 px-3 py-2.5 text-sm text-lightest-cyan"
            >
              <Avatar
                name={playerName}
                userId={player.id}
                avatarUrl={player.avatarUrl}
                alt={playerName}
                className="h-9 w-9 shrink-0 rounded-full border border-cyan-400/20 object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-white">
                  {playerName}
                </div>
              </div>
              {isHost ? (
                <InfoChip
                  size="xs"
                  className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200"
                >
                  Host
                </InfoChip>
              ) : null}
            </div>
          );
        })}

        {Array.from({ length: openSlots }).map((_, index) => (
          <div
            key={`slot-${index}`}
            className="flex items-center gap-3 rounded-lg border border-dashed border-white/10 bg-black/10 px-3 py-2.5 text-sm text-white/35"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dashed border-white/15 bg-black/10 font-semibold">
              +
            </div>
            <span>Waiting for player...</span>
          </div>
        ))}
      </div>
    </div>
  );
}
