// src/game/components/game/BoardView.tsx
import { Board } from "../../game/models/board";
import { PlayerState, PlayerProgress } from "../../game/models/gameState";

const tileImages: Record<string, string> = {
  I: "/assets/corridor_cut.jpeg",
  L: "/assets/corner_cut.jpeg",
  T: "/assets/T-junction_cut.jpeg",
  X: "/assets/X-junction_cut.jpeg",
};

type Props = {
  board: Board;
  players: PlayerState[];
  progress: Record<string, PlayerProgress>;
};

export default function BoardView({ board, players, progress }: Props) {
  console.log("board width:", board.width);
  console.log("board height:", board.height);

  console.log("row 0 length:", board.tiles[0].length);
  console.log("row 1 length:", board.tiles[1].length);

  console.log("collectibles in board:", board.tiles.flat()
  .filter(t => t.collectableId)
  .map(t => t.collectableId));


  return (
    <div className="p-4">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${board.width}, 70px)`,
          gridTemplateRows: `repeat(${board.height}, 70px)`,
        }}
      >
        {board.tiles.map((row, y) =>
          row.map((tile, x) => {
            const player = players.find(
              (p) => p.x === tile.x && p.y === tile.y
            );

            const collectibleId = tile.collectableId;
            const collected = collectibleId
              ? Object.values(progress).some((p) =>
                  p.collectedItems.includes(collectibleId)
                )
              : false;

            return (
              <div
                key={`${x}-${y}`}
                className="border border-gray-500 flex items-center justify-center relative"
              >
                <img
                  src={tileImages[tile.type]}
                  alt={tile.type}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: `rotate(${tile.rotation}deg)`,
                  }}
                />

                {player && (
                  <div
                    className="absolute bottom-2 right-2"
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      backgroundColor: player.color,
                      border: "2px solid white",
                    }}
                  />
                )}

                {collectibleId && !collected && (
                  <div
                    className="absolute top-2 left-2 text-xs font-bold text-white bg-black/60 px-1 rounded"
                  >
                    {collectibleId}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}