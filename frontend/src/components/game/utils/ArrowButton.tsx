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
      className="p-0 text-3xl text-white bg-transparent border-0 shadow-none hover:text-cyan-300 transition-colors"
      aria-label={`Shift ${axis.toLowerCase()} ${index} ${direction.toLowerCase()}`}
    >
      {children}
    </button>
  );
}