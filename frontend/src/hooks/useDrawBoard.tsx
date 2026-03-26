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

      // --- Load user settings for SVG sets ---
      const collectableSet = localStorage.getItem("settings.collectableSet") || "gemstones";
      const playerIconSet = localStorage.getItem("settings.playerIconSet") || "star";

      // --- Prepare SVG loaders ---
      const loadSvgImg = async (src: string) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };

      // --- Load tile SVGs (unchanged) ---
      const tileImageEntries = await Promise.all(
        Object.entries(TILE_SVGS).map(async ([type, svg]) => {
          const img = new Image();
          img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
          await img.decode();
          return [type, img] as const;
        })
      );
      const tileImages = Object.fromEntries(tileImageEntries) as Record<string, HTMLImageElement>;

      // --- Preload collectible SVGs (support 1-24.svg) ---
      const collectibleImages: Record<string, HTMLImageElement> = {};
      const collectibleDir = collectableSet === "gemstones" ? "gems" : "numbers";
      for (let i = 1; i <= 24; i++) {
        const id = String(i);
        const src = `/assets/collectables/${collectibleDir}/${id}.svg`;
        try {
          collectibleImages[id] = await loadSvgImg(src);
        } catch {}
      }

      // --- Preload player SVGs (star: 1-4, space_inv: 5-8) ---
      const playerImages: Record<string, HTMLImageElement> = {};
      if (playerIconSet === "star") {
        for (let i = 1; i <= 4; i++) {
          const id = String(i);
          const src = `/assets/player/star/${id}.svg`;
          try {
            playerImages[id] = await loadSvgImg(src);
          } catch {}
        }
      } else {
        for (let i = 5; i <= 8; i++) {
          const id = String(i);
          const src = `/assets/player/space_inv/${id}.svg`;
          try {
            playerImages[id] = await loadSvgImg(src);
          } catch {}
        }
      }

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

          // Draw tile image (unchanged)
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

          // Draw player SVG if present, using slotId mapping (P1→1, P2→2, ...)
          const player = players.find((p) => p.x === tile.x && p.y === tile.y);
          if (player) {
            // Try to use player.slotId if present, fallback to player.id
            let playerSvgId: string | undefined = undefined;
            const slotId = (player as any).slotId;
            if (slotId && /^P\d$/.test(slotId)) {
              // P1→1, P2→2, etc.
              playerSvgId = String(parseInt(slotId.slice(1), 10));
            } else if (slotId && /^P\d\d$/.test(slotId)) {
              playerSvgId = String(parseInt(slotId.slice(1), 10));
            } else if (playerImages[player.id]) {
              playerSvgId = player.id;
            }
            // For space_inv, SVGs are 5-8, so offset by 4
            if (playerSvgId && playerIconSet === "space_inv") {
              const n = Number(playerSvgId);
              if (!isNaN(n)) playerSvgId = String(n + 4);
            }
            if (playerSvgId && playerImages[playerSvgId]) {
              ctx.save();
              // Center 48x48 SVG in the cell for player
              const playerIconSize = 48;
              ctx.drawImage(
                playerImages[playerSvgId],
                cellX + (CELL_SIZE - playerIconSize) / 2,
                cellY + (CELL_SIZE - playerIconSize) / 2,
                playerIconSize,
                playerIconSize
              );
              ctx.restore();
            }
          }

          // Draw collectible SVG if present and not collected
          const collectibleId = tile.collectableId;
          const collected = collectibleId ? collectibleSet.has(collectibleId) : false;
          // Map IDs like 'C01' to '1', 'C02' to '2', etc.
          let collectibleSvgId: string | undefined = undefined;
          if (collectibleId && /^C\d+$/.test(collectibleId)) {
            collectibleSvgId = String(parseInt(collectibleId.slice(1), 10));
          } else if (collectibleId && /^C\d\d$/.test(collectibleId)) {
            collectibleSvgId = String(parseInt(collectibleId.slice(1), 10));
          } else if (collectibleId && collectibleImages[collectibleId]) {
            collectibleSvgId = collectibleId;
          }
          if (collectibleId && !collected && collectibleSvgId && collectibleImages[collectibleSvgId]) {
            ctx.save();
            // Center 34x34 SVG in the cell
            const iconSize = 34;
            ctx.drawImage(
              collectibleImages[collectibleSvgId],
              cellX + (CELL_SIZE - iconSize) / 2,
              cellY + (CELL_SIZE - iconSize) / 2,
              iconSize,
              iconSize
            );
            ctx.restore();
          }
        }
      }
    };

    drawBoard().catch(console.error);
    return () => { cancelled = true; };
  }, [canvasRef, board, players, collectibleSet]);
}