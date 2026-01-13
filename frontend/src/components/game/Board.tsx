// src/game/components/game/Board.tsx
import Cell from "./Cell";

export type Tile = {
  type: string;
  rotation: number;
  x: number;
  y: number;
};

type BoardData = {
  width: number;
  height: number;
  tiles: Tile[][];
};

type Props = {
  board: BoardData;
};

export default function Board({ board }: Props) {
  if (!board || !board.tiles) return <div>Loading board...</div>;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${board.width}, 50px)`,
        gap: 2,
      }}
    >
      {board.tiles.flat().map((tile, idx) => (
        <Cell key={idx} value={tile} />
      ))}
    </div>
  );
}
