type RowShift = {
  type: "SHIFT";
  axis: "ROW";
  index: number;
  direction: "LEFT" | "RIGHT";
};

type ColShift = {
  type: "SHIFT";
  axis: "COL";
  index: number;
  direction: "UP" | "DOWN";
};

export type BoardAction =
  | { type: "ROTATE_TILE"; x: number; y: number }
  | { type: "SWAP_TILES"; x1: number; y1: number; x2: number; y2: number }
  | RowShift
  | ColShift;
