// src/hooks/useDrawBoard.tsx
import { useEffect, useRef, useState } from "react";
import { Board, PositionedTile } from "../game/models/board";
import { TILE_SVGS } from "../components/game/tiles/tilesConstants";
import { PlayerState } from "../game/models/privatState";
import {
  CELL_SIZE,
  CELL_BORDER_WIDTH,
  CELL_BORDER_COLOR,
  TILE_DRAW_INSET,
  SWAP_HIGHLIGHT_COLOR,
} from "../game/models/constants";

export function useDrawBoard(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  board: Board,
  players: PlayerState[],
  swapTiles: { x: number; y: number }[] = [],
) {
  const tileImagesRef = useRef<Record<string, HTMLImageElement>>({});
  const playerImagesRef = useRef<Record<string, HTMLImageElement>>({});
  const collectibleImagesRef = useRef<Record<string, HTMLImageElement>>({});
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    const loadImages = async () => {
      // Tiles
      const tileEntries = await Promise.all(
        Object.entries(TILE_SVGS).map(async ([type, svg]) => {
          const img = new Image();
          img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
          await img.decode();
          return [type, img] as const;
        })
      );
      tileImagesRef.current = Object.fromEntries(tileEntries);

      // Players
      const playerIconSet = localStorage.getItem("settings.playerIconSet") || "star";
      const ids = playerIconSet === "star" ? [1, 2, 3, 4] : [5, 6, 7, 8];
      for (const id of ids) {
        const img = new Image();
        const setName = playerIconSet === "star" ? "star" : "space_inv";
        img.src = `/assets/player/${setName}/${id}.svg`;
        await img.decode();
        playerImagesRef.current[String(id)] = img;
      }

      // Collectibles
      const collectableSet = localStorage.getItem("settings.collectableSet") || "gemstones";
      const dir = collectableSet === "gemstones" ? "gems" : "numbers";
      for (let i = 1; i <= 24; i++) {
        const img = new Image();
        img.src = `/assets/collectables/${dir}/${i}.svg`;
        await img.decode();
        collectibleImagesRef.current[String(i)] = img;
      }
      setImagesLoaded(true);
    };

    loadImages().catch(console.error);
  }, []);

  useEffect(() => {
    if (!imagesLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const flatTiles: PositionedTile[] = board.tiles.flat();

    const width = board.tiles[0]?.length ?? 0;
    const height = board.tiles.length;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * CELL_SIZE * dpr;
    canvas.height = height * CELL_SIZE * dpr;
    canvas.style.width = `${width * CELL_SIZE}px`;
    canvas.style.height = `${height * CELL_SIZE}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width * CELL_SIZE, height * CELL_SIZE);

     flatTiles.forEach((tile) => {
      const cellX = tile.x * CELL_SIZE;
      const cellY = tile.y * CELL_SIZE;

      // Highlight (swap selection)
      if (swapTiles.some((t) => t.x === tile.x && t.y === tile.y)) {
        ctx.fillStyle = SWAP_HIGHLIGHT_COLOR;
        ctx.fillRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
      }

      // Border
      ctx.strokeStyle = CELL_BORDER_COLOR;
      ctx.lineWidth = CELL_BORDER_WIDTH;
      ctx.strokeRect(
        cellX + CELL_BORDER_WIDTH / 2,
        cellY + CELL_BORDER_WIDTH / 2,
        CELL_SIZE - CELL_BORDER_WIDTH,
        CELL_SIZE - CELL_BORDER_WIDTH
      );

      // Tile image
      const image = tileImagesRef.current[tile.type];
      if (image) {
        ctx.save();
        ctx.translate(cellX + CELL_SIZE / 2, cellY + CELL_SIZE / 2);
        ctx.rotate((tile.rotation * Math.PI) / 180);
        ctx.drawImage(
          image,
          -CELL_SIZE / 2 + TILE_DRAW_INSET,
          -CELL_SIZE / 2 + TILE_DRAW_INSET,
          CELL_SIZE - TILE_DRAW_INSET * 2,
          CELL_SIZE - TILE_DRAW_INSET * 2
        );
        ctx.restore();
      }

      // Collectible
      if (tile.collectableId) {
        const colId = String(parseInt(tile.collectableId.slice(1), 10));
        const img = collectibleImagesRef.current[colId];
        if (img) {
          ctx.drawImage(img, cellX + 17, cellY + 17, 34, 34);
        }
      }
    });

    // --- PLAYERS (separate layer) ---
    players.forEach((player) => {
      const tile = flatTiles.find(
        (t) => t.x === player.x && t.y === player.y
      );
      if (!tile) return;

      // Map slotId (P1, P2, ...) to correct image id in the set
      const slotMatch = /^P(\d+)$/.exec(player.slotId);
      let img;
      if (slotMatch) {
        const slotNum = Number(slotMatch[1]);
        const playerIconSet = localStorage.getItem("settings.playerIconSet") || "star";
        const imgId = playerIconSet === "star" ? String(slotNum) : String(slotNum + 4);
        img = playerImagesRef.current[imgId];
      }

      // ...existing code...

      const cellX = tile.x * CELL_SIZE;
      const cellY = tile.y * CELL_SIZE;

      if (img) {
        ctx.drawImage(img, cellX + 10, cellY + 10, 48, 48);
      } else {
        // Draw fallback: colored circle with player initial
        ctx.save();
        ctx.beginPath();
        ctx.arc(cellX + CELL_SIZE / 2, cellY + CELL_SIZE / 2, 22, 0, 2 * Math.PI);
        ctx.fillStyle = '#3498db';
        ctx.fill();
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(player.name?.[0] || '?', cellX + CELL_SIZE / 2, cellY + CELL_SIZE / 2);
        ctx.restore();
      }
    });
  }, [board, players, swapTiles, imagesLoaded]);
}