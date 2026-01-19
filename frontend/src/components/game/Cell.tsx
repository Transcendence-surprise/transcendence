// src/game/components/Game/Cell.tsx
import { Tile } from "./Board";

type Props = {
  value: Tile;
};

export default function Cell({ value }: Props) {
  return (
    <div
      style={{
        width: 50,
        height: 50,
        border: "1px solid white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `rotate(${value.rotation}deg)`,
      }}
    >
      {value.type}
    </div>
  );
}