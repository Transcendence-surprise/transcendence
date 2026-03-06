import { useEffect, useMemo, useRef } from "react";
import { Board } from "../../game/models/board";
import { PlayerState, PlayerProgress } from "../../game/models/gameState";

type Props = {
  board: Board;
  players: PlayerState[];
  progress: Record<string, PlayerProgress>;
};

const CELL_SIZE = 70;
const CELL_BORDER_WIDTH = 1;
const CELL_BORDER_COLOR = "#383838ff";

const TILE_SVGS: Record<string, string> = {
  I: `
    <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 68C0.447715 68 0 67.5523 0 67L0 1C0 0.447716 0.447715 0 1 0H5C5.55228 0 6 0.447715 6 1L6 67C6 67.5523 5.55228 68 5 68H1Z" fill="#FF00FF"/>
      <path d="M63 68C62.4477 68 62 67.5523 62 67L62 1C62 0.447716 62.4477 0 63 0H67C67.5523 0 68 0.447715 68 1V67C68 67.5523 67.5523 68 67 68H63Z" fill="#FF00FF"/>
    </svg>`,
  L: `
    <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 68C0.447715 68 0 67.5523 0 67L0 1C0 0.447716 0.447715 0 1 0H5C5.55228 0 6 0.447716 6 1L6 67C6 67.5523 5.55228 68 5 68H1Z" fill="#00F5FF"/>
    <path d="M68 67C68 67.5523 67.5523 68 67 68H1C0.447716 68 0 67.5523 0 67V63C0 62.4477 0.447716 62 1 62L67 62C67.5523 62 68 62.4477 68 63V67Z" fill="#00F5FF"/>
    <path d="M62 0H68V6V6C64.6863 6 62 3.31371 62 0V0Z" fill="#00F5FF"/>
    </svg>`,
  T: `
    <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 68C0.447715 68 0 67.5523 0 67L0 1C0 0.447716 0.447715 0 1 0H5C5.55228 0 6 0.447715 6 1L6 67C6 67.5523 5.55228 68 5 68H1Z" fill="#39FF14"/>
      <path d="M62 68C62 64.6863 64.6863 62 68 62V62V68H62V68Z" fill="#39FF14"/>
      <path d="M62 0H68V6V6C64.6863 6 62 3.31371 62 0V0Z" fill="#39FF14"/>
    </svg>`,
  X: `
    <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M62 68C62 64.6863 64.6863 62 68 62V62V68H62V68Z" fill="#FFD300"/>
      <path d="M62 0H68V6V6C64.6863 6 62 3.31371 62 0V0Z" fill="#FFD300"/>
      <path d="M0.0175781 6.01779L0.0175781 0.017786H6.01758V0.017786C6.01758 3.33149 3.33129 6.01779 0.0175781 6.01779V6.01779Z" fill="#FFD300"/>
      <path d="M6 68H3.57628e-07L3.57628e-07 62V62C3.31371 62 6 64.6863 6 68V68Z" fill="#FFD300"/>
    </svg>`,
};

function loadSvgImage(svgMarkup: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load SVG image"));
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
  });
}

export default function BoardView({ board, players, progress }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const collectibleSet = useMemo(() => {
  const collectedIds = new Set<string>();

    Object.values(progress).forEach((playerProgress) => {
      playerProgress.collectedItems.forEach((itemId) => {
        collectedIds.add(itemId);
      });
    });

    return collectedIds;
  }, [progress]);

  useEffect(() => {
    let cancelled = false;

    const drawBoard = async () => {
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
          const image = await loadSvgImage(svg);
          return [type, image] as const;
        })
      );

      if (cancelled) return;

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
            ctx.rotate((tile.rotation * Math.PI) / 180);

            ctx.drawImage(
              image,
              -CELL_SIZE / 2,
              -CELL_SIZE / 2,
              CELL_SIZE,
              CELL_SIZE
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

    drawBoard().catch((error) => {
      console.error("Canvas draw failed:", error);
    });

    return () => {
      cancelled = true;
    };
  }, [board, players, collectibleSet]);

  return (
    <div className="p-4">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}