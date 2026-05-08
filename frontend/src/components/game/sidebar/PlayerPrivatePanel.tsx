import { useEffect, useRef, useState } from "react";
import {
  ObjectiveStatus,
  PrivateGameState,
} from "../../../game/models/privatState";
import { useAuth } from "../../../hooks/useAuth";
import InfoChip from "../../shared/InfoChip";
import StatusDot from "../../shared/StatusDot";

interface PlayerPrivatePanelProps {
  game: PrivateGameState;
}

const formatObjectiveMessage = (objective: ObjectiveStatus): string => {
  const progress = objective.progress ?? 0;
  const rawType = objective.type as string;

  switch (objective.type) {
    case "COLLECT_ALL":
      return `Collect all items (${progress})`;
    case "COLLECT_N":
      return objective.amount != null
        ? `Collect ${objective.amount} items (${progress}/${objective.amount})`
        : `Collect assigned items (${progress})`;
    case "RETURN_HOME":
      return "Return to your starting tile";
    case "REACH_EXIT":
      return "Reach the exit";
    default:
      return rawType
        .toLowerCase()
        .split("_")
        .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
  }
};

export default function PlayerPrivatePanel({ game }: PlayerPrivatePanelProps) {
  const { user } = useAuth();
  const { playerProgress, playerProgressById } = game;
  const userProgress =
    user?.id != null ? playerProgressById?.[user.id.toString()] : undefined;
  const effectivePlayerProgress = userProgress ?? playerProgress;
  const { collectedItems = [], currentCollectibleId, objectives = [] } =
    effectivePlayerProgress ?? {};
  const collectibleImagesRef = useRef<Record<string, HTMLImageElement>>({});
  const [collectibleImagesLoaded, setCollectibleImagesLoaded] = useState(false);

  useEffect(() => {
    const loadCollectibleImages = async () => {
      const collectableSet =
        localStorage.getItem("settings.collectableSet") || "gemstones";
      const dir = collectableSet === "gemstones" ? "gems" : "numbers";

      const entries = await Promise.all(
        Array.from({ length: 24 }, async (_, index) => {
          const id = String(index + 1);
          const img = new Image();
          img.src = `/assets/collectables/${dir}/${id}.svg`;

          try {
            await img.decode();
            return [id, img] as const;
          } catch (error) {
            console.warn(
              `Failed to load collectible image ${id} from ${img.src}`,
              error,
            );
            return null;
          }
        }),
      );

      collectibleImagesRef.current = Object.fromEntries(
        entries.filter(
          (entry): entry is readonly [string, HTMLImageElement] =>
            entry !== null,
        ),
      );
      setCollectibleImagesLoaded(true);
    };

    loadCollectibleImages().catch(console.error);
  }, []);

  const collectibleImageId = currentCollectibleId
    ? String(parseInt(currentCollectibleId.slice(1), 10))
    : undefined;
  const currentCollectibleImage = collectibleImageId
    ? collectibleImagesRef.current[collectibleImageId]
    : undefined;

  const getCollectibleImage = (id: string) => {
    const numericId = String(parseInt(id.slice(1), 10));
    return collectibleImagesRef.current[numericId];
  };

  const myPlayer = game.players.find(
    (p) => user?.id != null && p.id.toString() === user.id.toString(),
  );
  const fallbackPlayer = game.players.find(
    (p) => p.id.toString() === game.currentPlayerId.toString(),
  );
  const playerForStats = myPlayer ?? fallbackPlayer;

  const totalMoves = playerForStats?.totalMoves ?? 0;
  const displaySkipsLeft = playerForStats?.skipsLeft ?? game.skipsLeft ?? 0;
  const maxMoves = game.level?.constraints?.maxMoves;
  const spectators = game.spectators ?? [];
  const incompleteObjectives = objectives.filter((objective) => !objective.done);
  const completedObjectives = objectives.filter((objective) => objective.done);
  const primaryObjective = incompleteObjectives[0] ?? objectives[0];
  const isSingleMode = game.rules?.mode === "SINGLE";

  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-[var(--color-border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.028),rgba(255,255,255,0.01))] p-3 shadow-[0_12px_28px_rgba(0,0,0,0.2)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-light-cyan/65">
            Mission Panel
          </p>
          <h3 className="mt-1 text-base font-semibold text-white">
            {isSingleMode ? "Current Run" : "Private Objectives"}
          </h3>
        </div>
        <InfoChip variant="muted">
          {completedObjectives.length}/{Math.max(1, objectives.length)} Done
        </InfoChip>
      </div>

      {currentCollectibleId ? (
        <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/6 px-3 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-light-cyan/70">
            Current Target
          </p>
          <div className="mt-2.5 flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-cyan-400/20 bg-black/20 text-sm font-bold text-cyan-100 shadow-[0_0_20px_rgba(0,234,255,0.08)]">
              {collectibleImagesLoaded && currentCollectibleImage ? (
                <img
                  src={currentCollectibleImage.src}
                  alt={`Collectible ${currentCollectibleId}`}
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                currentCollectibleId
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">
                Find this collectible
              </p>
              <p className="mt-1 text-xs leading-5 text-lightest-cyan/70">
                Move through the board and reach the next required item.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {primaryObjective ? (
        <div className="rounded-xl border border-neutral-500/30 bg-black/20 px-3 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-light-cyan/70">
            Active Objective
          </p>
          <div className="mt-2.5 flex items-start gap-3">
            <StatusDot active={primaryObjective.done} className="mt-1 h-3 w-3" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">
                {formatObjectiveMessage(primaryObjective)}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/40">
                {primaryObjective.done ? "Completed" : "In progress"}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-neutral-500/30 bg-black/20 px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.14em] text-light-cyan/70">
            Collected Items
          </p>
          <InfoChip variant="muted">{collectedItems.length} Found</InfoChip>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {collectedItems.length > 0 ? (
            collectedItems.map((item) => {
              const itemImage = getCollectibleImage(item);

              return (
                <div
                  key={item}
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-neutral-500/30 bg-black/20 text-[10px] font-bold text-cyan-100"
                >
                  {collectibleImagesLoaded && itemImage ? (
                    <img
                      src={itemImage.src}
                      alt={`Collected ${item}`}
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    item
                  )}
                </div>
              );
            })
          ) : (
            <span className="text-sm text-white/35">No items collected yet</span>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-neutral-500/30 bg-black/20 px-3 py-3">
        <p className="text-xs uppercase tracking-[0.14em] text-light-cyan/70">
          Run Stats
        </p>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          <div className="rounded-lg border border-neutral-500/30 bg-white/[0.02] px-3 py-2.5">
            <div className="text-[11px] uppercase tracking-[0.12em] text-white/40">
              Skips Left
            </div>
            <div className="mt-1 text-base font-semibold text-white">
              {displaySkipsLeft}
            </div>
          </div>
          <div className="rounded-lg border border-neutral-500/30 bg-white/[0.02] px-3 py-2.5">
            <div className="text-[11px] uppercase tracking-[0.12em] text-white/40">
              Moves
            </div>
            <div className="mt-1 text-base font-semibold text-white">
              {maxMoves != null ? `${totalMoves}/${maxMoves}` : totalMoves}
            </div>
          </div>
        </div>
      </div>

      {spectators.length > 0 ? (
        <div className="rounded-xl border border-neutral-500/30 bg-black/20 px-3 py-3">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-light-cyan/70">
            Spectators
          </div>
          <ul className="mt-2.5 flex flex-col gap-2 text-sm text-gray-300">
            {spectators.map((spectatorName, index) => (
              <li
                key={`${spectatorName}-${index}`}
                className="flex items-center justify-between rounded-lg border border-neutral-500/30 bg-white/[0.02] px-3 py-2"
              >
                <span>{spectatorName}</span>
                <span className="text-gray-500">Watching</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
