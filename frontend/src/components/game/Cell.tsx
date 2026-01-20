// // src/game/components/Game/Cell.tsx

import { Tile } from "./Board";

type Props = {
  value: Tile;
};

const tileImages: Record<string, string> = {
  I: "/assets/corridor_cut.jpeg",
  L: "/assets/corner_cut.jpeg",
  T: "/assets/T-junction_cut.jpeg",
  X: "/assets/X-junction_cut.jpeg",
};

export default function Cell({ value }: Props) {
  const baseType = value.type[0]; // "I1" -> "I"
  const imgSrc = tileImages[baseType];

  return (
    <div
      style={{
        width: 50,
        height: 50,
        border: "1px solid white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {imgSrc && (
        <img
          src={imgSrc}
          alt={baseType}
          style={{
            width: "100%",
            height: "100%",
            transform: `rotate(${value.rotation}deg)`,
          }}
        />
      )}
    </div>
  );
}
