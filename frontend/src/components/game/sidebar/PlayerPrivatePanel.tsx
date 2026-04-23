// src/components/game/sidebar/PlayerPrivatePanel.tsx
import { useEffect, useRef, useState } from "react";
import {
  ObjectiveStatus,
  PrivateGameState,
} from "../../../game/models/privatState";
import { useAuth } from "../../../hooks/useAuth";
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
  const { playerProgress } = game;
  const {
    collectedItems = [],
    currentCollectibleId,
    objectives = [],
  } = playerProgress ?? {};
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

  return (
    <div className="flex flex-col gap-4 w-full bg-bg-sidebar p-4 rounded-lg">
      {/* Current Collectible */}
      {currentCollectibleId && (
        <div className="flex flex-col items-center mb-4">
          <span className="text-sm text-gray-400">Next collectible</span>
          <div className="w-12 h-12 rounded-md flex items-center justify-center text-black font-bold mt-1 overflow-hidden">
            {collectibleImagesLoaded && currentCollectibleImage ? (
              <img
                src={currentCollectibleImage.src}
                alt={`Collectible ${currentCollectibleId}`}
                className="w-full h-full object-contain p-1"
              />
            ) : (
              currentCollectibleId
            )}
          </div>
        </div>
      )}

      {/* Collected Items */}
      <div>
        <span className="text-sm text-gray-400 mb-1">Collected Items</span>
        <div className="flex flex-wrap gap-2 mt-1">
          {collectedItems.length > 0 ? (
            collectedItems.map((item) => {
              const itemImage = getCollectibleImage(item);

              return (
                <div
                  key={item}
                  className="w-8 h-8 rounded-md flex items-center justify-center text-black font-bold text-xs overflow-hidden"
                >
                  {collectibleImagesLoaded && itemImage ? (
                    <img
                      src={itemImage.src}
                      alt={`Collected ${item}`}
                      className="w-full h-full object-contain p-0.5"
                    />
                  ) : (
                    item
                  )}
                </div>
              );
            })
          ) : (
            <span className="text-xs text-gray-500">
              No items collected yet
            </span>
          )}
        </div>
      </div>

      {/* Objectives */}
      <div>
        <span className="text-sm text-gray-400 mb-1">Objectives</span>
        <ul className="flex flex-col gap-1 text-xs">
          {objectives.map((obj, idx) => (
            <li key={idx} className={`flex items-center gap-2`}>
              <StatusDot active={obj.done} className="w-3 h-3" />
              <span>{formatObjectiveMessage(obj)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Skips Left */}
      <div className="flex justify-between items-center mt-2">
        <span className="text-sm text-gray-400">Skips left</span>
        <span className="text-white font-bold">{displaySkipsLeft}</span>
      </div>

      {/* Moves Used / Max Moves (single levels with move constraint) */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-400">Moves</span>
        <span className="text-white font-bold">
          {maxMoves != null ? `${totalMoves}/${maxMoves}` : totalMoves}
        </span>
      </div>

      {/* Spectators */}
      <div>
          <div className="text-xs font-semibold text-gray-400 uppercase">
            Spectators
          </div>
        {spectators.length > 0 ? (
          <ul className="mt-1 flex flex-col gap-1 text-xs text-gray-300">
            {spectators.map((spectatorName, index) => (
              <li
                key={`${spectatorName}-${index}`}
                className="flex items-center justify-between"
              >
                <span>{spectatorName}</span>
                <span className="text-gray-500">👀</span>
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-xs text-gray-500 block mt-1">
            No spectators
          </span>
        )}
      </div>
    </div>
  );
}
