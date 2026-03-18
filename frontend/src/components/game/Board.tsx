import { useEffect, useMemo, useRef, useState } from "react";
import { Board } from "../../game/models/board";
import { PlayerState, PlayerProgress } from "../../game/models/gameState";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

type Props = {
  board: Board;
  players: PlayerState[];
  progress: Record<string, PlayerProgress>;
};

const CELL_SIZE = 70;
const CELL_BORDER_WIDTH = 1;
const CELL_BORDER_COLOR = "#6b7280";
const TILE_DRAW_INSET = 1;

const TILE_ROTATION_OFFSET: Record<"I" | "L" | "T" | "X", number> = {
  I: 0,
  // The current L SVG is authored one quarter-turn ahead of backend L0 semantics.
  L: -90,
  T: 0,
  X: 0,
};

const TILE_SVGS: Record<string, string> = {
  I: `
    <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 68C0.447715 68 0 67.5523 0 67L0 1C0 0.447716 0.447715 0 1 0H5C5.55228 0 6 0.447715 6 1L6 67C6 67.5523 5.55228 68 5 68H1Z" fill="#fb85f3"/>
      <path d="M63 68C62.4477 68 62 67.5523 62 67L62 1C62 0.447716 62.4477 0 63 0H67C67.5523 0 68 0.447715 68 1V67C68 67.5523 67.5523 68 67 68H63Z" fill="#fb85f3"/>
    </svg>`,
  L: `
    <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 68C0.447715 68 0 67.5523 0 67L0 1C0 0.447716 0.447715 0 1 0H5C5.55228 0 6 0.447715 6 1L6 67C6 67.5523 5.55228 68 5 68H1Z" fill="#5c90f6"/>
      <path d="M68 5C68 5.55228 67.5523 6 67 6L1 6C0.447716 6 0 5.55228 0 5V1C0 0.447715 0.447715 0 1 0L67 0C67.5523 0 68 0.447715 68 1V5Z" fill="#5c90f6"/>
      <path d="M62 68C62 64.6863 64.6863 62 68 62V62V68H62V68Z" fill="#D9D9D9"/>
    </svg>`,
  T: `
    <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 68C0.447715 68 0 67.5523 0 67L0 1C0 0.447716 0.447715 0 1 0H5C5.55228 0 6 0.447715 6 1L6 67C6 67.5523 5.55228 68 5 68H1Z" fill="#21e6c5"/>
      <path d="M62 68C62 64.6863 64.6863 62 68 62V62V68H62V68Z" fill="#D9D9D9"/>
      <path d="M62 0H68V6V6C64.6863 6 62 3.31371 62 0V0Z" fill="#D9D9D9"/>
    </svg>`,
  X: `
    <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M62 68C62 64.6863 64.6863 62 68 62V62V68H62V68Z" fill="#D9D9D9"/>
      <path d="M62 0H68V6V6C64.6863 6 62 3.31371 62 0V0Z" fill="#D9D9D9"/>
      <path d="M0.0175781 6.01779L0.0175781 0.017786H6.01758V0.017786C6.01758 3.33149 3.33129 6.01779 0.0175781 6.01779V6.01779Z" fill="#D9D9D9"/>
      <path d="M6 68H3.57628e-07L3.57628e-07 62V62C3.31371 62 6 64.6863 6 68V68Z" fill="#D9D9D9"/>
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
  const [selectedButton, setSelectedButton] = useState<string | null>(null); // format: "direction-index" e.g. "left-0", "top-2"
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const collectibleSet = useMemo(() => {
    const collectedIds = new Set<string>();

    Object.values(progress).forEach((playerProgress) => {
      playerProgress.collectedItems.forEach((itemId) => {
        collectedIds.add(itemId);
      });
    });

    return collectedIds;
  }, [progress]);

  const handleShiftRow = (rowIndex: number, direction: "left" | "right") => {
    // Emit shift event - this would typically be sent to the game backend/server
    console.log(`Shifting row ${rowIndex} ${direction}`);
    // You would dispatch this to your game state management here
  };

  const handleShiftColumn = (colIndex: number, direction: "up" | "down") => {
    // Emit shift event - this would typically be sent to the game backend/server
    console.log(`Shifting column ${colIndex} ${direction}`);
    // You would dispatch this to your game state management here
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"].includes(e.key)) {
      return;
    }

    e.preventDefault();

    // Parse current selection
    const [currentDir, currentIndexStr] = (selectedButton || "").split("-");
    const currentIndex = parseInt(currentIndexStr) || 0;

    let newButtonId = selectedButton;

    if (e.key === "ArrowUp") {
      if (currentDir === "left" || currentDir === "right") {
        // Move up in row
        const newIndex = Math.max(0, currentIndex - 1);
        newButtonId = `${currentDir}-${newIndex}`;
      } else if (currentDir === "bottom") {
        // Move from bottom to top
        newButtonId = `top-${currentIndex}`;
      } else if (!currentDir) {
        // First selection - go to top
        newButtonId = `top-0`;
      }
    } else if (e.key === "ArrowDown") {
      if (currentDir === "left" || currentDir === "right") {
        // Move down in row
        const newIndex = Math.min(board.height - 1, currentIndex + 1);
        newButtonId = `${currentDir}-${newIndex}`;
      } else if (currentDir === "top") {
        // Move from top to bottom
        newButtonId = `bottom-${currentIndex}`;
      } else if (!currentDir) {
        // First selection - go to bottom
        newButtonId = `bottom-0`;
      }
    } else if (e.key === "ArrowLeft") {
      if (currentDir === "top" || currentDir === "bottom") {
        // Move left in column
        const newIndex = Math.max(0, currentIndex - 1);
        newButtonId = `${currentDir}-${newIndex}`;
      } else if (currentDir === "right" || !currentDir) {
        // Move to left side at same row
        const rowIdx = currentDir === "right" ? currentIndex : 0;
        newButtonId = `left-${rowIdx}`;
      }
    } else if (e.key === "ArrowRight") {
      if (currentDir === "top" || currentDir === "bottom") {
        // Move right in column
        const newIndex = Math.min(board.width - 1, currentIndex + 1);
        newButtonId = `${currentDir}-${newIndex}`;
      } else if (currentDir === "left" || !currentDir) {
        // Move to right side at same row
        const rowIdx = currentDir === "left" ? currentIndex : 0;
        newButtonId = `right-${rowIdx}`;
      }
    } else if (e.key === "Enter" && selectedButton) {
      // Trigger action on selected button
      const [dir, idxStr] = selectedButton.split("-");
      const idx = parseInt(idxStr);
      if (dir === "left") {
        handleShiftRow(idx, "left");
      } else if (dir === "right") {
        handleShiftRow(idx, "right");
      } else if (dir === "top") {
        handleShiftColumn(idx, "up");
      } else if (dir === "bottom") {
        handleShiftColumn(idx, "down");
      }
    }

    if (newButtonId !== selectedButton) {
      setSelectedButton(newButtonId);
      setTimeout(() => buttonRefs.current[newButtonId]?.focus(), 0);
    }
  };

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
            const rotationDegrees = tile.rotation + TILE_ROTATION_OFFSET[tile.type];
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

    drawBoard().catch((error) => {
      console.error("Canvas draw failed:", error);
    });

    return () => {
      cancelled = true;
    };
  }, [board, players, collectibleSet]);

  return (
    <div className="p-4 flex flex-col items-center gap-2" onKeyDown={handleKeyDown}>
      {/* Top Arrows Row */}
      <div className="flex gap-0 justify-start">
        {Array.from({ length: board.width }).map((_, colIndex) => (
          <button
            key={`top-${colIndex}`}
            ref={(el) => {
              if (el) buttonRefs.current[`top-${colIndex}`] = el;
            }}
            onClick={() => handleShiftColumn(colIndex, "up")}
            onFocus={() => setSelectedButton(`top-${colIndex}`)}
            onBlur={() => setSelectedButton(null)}
            className={`px-4 py-2 rounded transition-all text-lg font-bold ${
              selectedButton === `top-${colIndex}`
                ? "bg-blue-600 text-white scale-105 shadow-lg"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
            aria-label={`Shift column ${colIndex} up`}
            style={{ flex: "1 1 70px" }}
          >
          <MdOutlineKeyboardArrowDown />
          </button>
        ))}
      </div>

      {/* Main container with left arrows, canvas, and right arrows */}
      <div className="flex items-stretch gap-2">
        {/* Left Arrows Column */}
        <div className="flex flex-col gap-0 justify-start">
          {Array.from({ length: board.height }).map((_, rowIndex) => (
            <button
              key={`left-${rowIndex}`}
              ref={(el) => {
                if (el) buttonRefs.current[`left-${rowIndex}`] = el;
              }}
              onClick={() => handleShiftRow(rowIndex, "left")}
              onFocus={() => setSelectedButton(`left-${rowIndex}`)}
              onBlur={() => setSelectedButton(null)}
              className={`px-3 py-4 rounded transition-all text-xl font-bold ${
                selectedButton === `left-${rowIndex}`
                  ? "bg-blue-600 text-white scale-105 shadow-lg"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
              aria-label={`Shift row ${rowIndex} left`}
              style={{ flex: "1 1 70px" }}
            >
              &gt;
            </button>
          ))}
        </div>

        {/* Canvas Container */}
        <div className="border-2 border-gray-400 rounded-lg overflow-hidden flex-shrink-0">
          <canvas ref={canvasRef} className="block" />
        </div>

        {/* Right Arrows Column */}
        <div className="flex flex-col gap-0 justify-start">
          {Array.from({ length: board.height }).map((_, rowIndex) => (
            <button
              key={`right-${rowIndex}`}
              ref={(el) => {
                if (el) buttonRefs.current[`right-${rowIndex}`] = el;
              }}
              onClick={() => handleShiftRow(rowIndex, "right")}
              onFocus={() => setSelectedButton(`right-${rowIndex}`)}
              onBlur={() => setSelectedButton(null)}
              className={`px-3 py-4 rounded transition-all text-xl font-bold ${
                selectedButton === `right-${rowIndex}`
                  ? "bg-blue-600 text-white scale-105 shadow-lg"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
              aria-label={`Shift row ${rowIndex} right`}
              style={{ flex: "1 1 70px" }}
            >
              &lt;
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Arrows Row */}
      <div className="flex gap-0 justify-start">
        {Array.from({ length: board.width }).map((_, colIndex) => (
          <button
            key={`bottom-${colIndex}`}
            ref={(el) => {
              if (el) buttonRefs.current[`bottom-${colIndex}`] = el;
            }}
            onClick={() => handleShiftColumn(colIndex, "down")}
            onFocus={() => setSelectedButton(`bottom-${colIndex}`)}
            onBlur={() => setSelectedButton(null)}
            className={`px-4 py-2 rounded transition-all text-lg font-bold ${
              selectedButton === `bottom-${colIndex}`
                ? "bg-blue-600 text-white scale-105 shadow-lg"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
            aria-label={`Shift column ${colIndex} down`}
            style={{ flex: "1 1 70px" }}
          >
            ↓
          </button>
        ))}
      </div>
    </div>
  );
}