export interface Collectible {
  id: string;                  // unique identifier
  x: number;                   // position (single-player fixed, multi optional)
  y: number;
 ownerSlotId?: string;         // multiplayer: which player must collect it
}

export const COLLECTIBLE_IDS = Array.from({ length: 24 }, (_, i) =>
  `C${String(i + 1).padStart(2, "0")}`
);