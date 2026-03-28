// src/components/game/utils/ArrowButton.tsx

import React from "react";

type ArrowButtonProps = {
  axis: "ROW" | "COL";
  index: number;
  direction: "UP" | "DOWN" | "LEFT" | "RIGHT";
  onClick: (axis: "ROW" | "COL", index: number, direction: "UP" | "DOWN" | "LEFT" | "RIGHT") => void;
  children: React.ReactNode;
};

export function ArrowButton({ axis, index, direction, onClick, children }: ArrowButtonProps) {
  return (
    <button
      type="button"
      // onClick={() => onClick(axis, index, direction)}
      onClick={(e) => {
        e.preventDefault();
        console.log("Arrow clicked", axis, index, direction);
        onClick(axis, index, direction);
      }}
      className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-2xl"
      aria-label={`Shift ${axis.toLowerCase()} ${index} ${direction.toLowerCase()}`}
    >
      {children}
    </button>
  );
}