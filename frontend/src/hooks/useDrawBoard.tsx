// src/hooks/useDrawBoard.tsx
import { useEffect } from "react";
import { Board } from "../game/models/board";
import { PlayerState } from "../game/models/gameState";
import { TILE_SVGS } from "../components/game/tiles/tilesConstants";

const CELL_SIZE = 68;
const CELL_BORDER_WIDTH = 1;
const CELL_BORDER_COLOR = "#6b7280";
const TILE_DRAW_INSET = 1;

export function useDrawBoard(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  board: Board,
  players: PlayerState[],
  collectibleSet: Set<string>
) {
  useEffect(() => {
    let cancelled = false;

    const drawBoard = async () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const boardWidthPx = board.width * CELL_SIZE;
      const boardHeightPx = board.height * CELL_SIZE;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(boardWidthPx * dpr);
      canvas.height = Math.floor(boardHeightPx * dpr);
      canvas.style.width = `${boardWidthPx}px`;
      canvas.style.height = `${boardHeightPx}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const imageEntries = await Promise.all(
        Object.entries(TILE_SVGS).map(async ([type, svg]) => {
          const img = new Image();
          img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
          await img.decode();
          return [type, img] as const;
        })
      );

      const tileImages = Object.fromEntries(imageEntries) as Record<string, HTMLImageElement>;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, boardWidthPx, boardHeightPx);

      for (let y = 0; y < board.height; y++) {
        for (let x = 0; x < board.width; x++) {
          const tile = board.tiles[y][x];
          const cellX = x * CELL_SIZE;
          const cellY = y * CELL_SIZE;

          ctx.strokeStyle = CELL_BORDER_COLOR;
          ctx.lineWidth = CELL_BORDER_WIDTH;
          ctx.strokeRect(
            cellX + CELL_BORDER_WIDTH / 2,
            cellY + CELL_BORDER_WIDTH / 2,
            CELL_SIZE - CELL_BORDER_WIDTH,
            CELL_SIZE - CELL_BORDER_WIDTH
          );

          const image = tileImages[tile.type];

          if (image) {
            ctx.save();

            ctx.translate(cellX + CELL_SIZE / 2, cellY + CELL_SIZE / 2);
            const rotationDegrees = tile.rotation;
            ctx.rotate((rotationDegrees * Math.PI) / 180);

            ctx.drawImage(
              image,
              -CELL_SIZE / 2 + TILE_DRAW_INSET,
              -CELL_SIZE / 2 + TILE_DRAW_INSET,
              CELL_SIZE - TILE_DRAW_INSET * 2,
              CELL_SIZE - TILE_DRAW_INSET * 2
            );

            ctx.restore();
          }

          const player = players.find((p) => p.x === tile.x && p.y === tile.y);

          if (player) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(cellX + CELL_SIZE - 14, cellY + CELL_SIZE - 14, 9, 0, Math.PI * 2);
            ctx.fillStyle = player.color;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "white";
            ctx.stroke();
            ctx.restore();
          }

          const collectibleId = tile.collectableId;
          const collected = collectibleId ? collectibleSet.has(collectibleId) : false;

          if (collectibleId && !collected) {
            ctx.save();
            ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
            ctx.fillRect(cellX + 6, cellY + 6, 22, 18);

            ctx.fillStyle = "white";
            ctx.font = "bold 12px sans-serif";
            ctx.textBaseline = "middle";
            ctx.fillText(String(collectibleId), cellX + 10, cellY + 15);
            ctx.restore();
          }
        }
      }
    };

    drawBoard().catch(console.error);
    return () => { cancelled = true; };
  }, [canvasRef, board, players, collectibleSet]);
}