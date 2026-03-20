import { useEffect, useMemo, useRef, useState } from "react";
import { Board } from "../../game/models/board";
import { PlayerState, PlayerProgress } from "../../game/models/gameState";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";
import { TILE_SVGS } from "./tiles/tilesConstants";

type Props = {
  board: Board;
  players: PlayerState[];
  progress: Record<string, PlayerProgress>;
};

type Side = "top" | "right" | "bottom" | "left";

const CELL_SIZE = 68;
const CELL_BORDER_WIDTH = 1;
const CELL_BORDER_COLOR = "#6b7280";
const TILE_DRAW_INSET = 1;

const TILE_ROTATION_OFFSET: Record<"I" | "L" | "T" | "X", number> = {
  I: 0,
  L: -90,
  T: 0,
  X: 0,
};

function loadSvgImage(svgMarkup: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load SVG image"));
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
  });
}

function makeId(side: Side, index: number): string {
  return `${side}-${index}`;
}

function getNextButtonId(
  key: string,
  currentDir: string | undefined,
  currentIndex: number,
  boardWidth: number,
  boardHeight: number
): string | null {
  if (!currentDir) {
    if (key === "ArrowUp") return makeId("top", 0);
    if (key === "ArrowDown") return makeId("bottom", 0);
    if (key === "ArrowLeft") return makeId("left", 0);
    if (key === "ArrowRight") return makeId("right", 0);
    return null;
  }

  if (currentDir === "top") {
    if (key === "ArrowLeft") {
      return currentIndex > 0
        ? makeId("top", currentIndex - 1)
        : makeId("left", 0);
    }

    if (key === "ArrowRight") {
      return currentIndex < boardWidth - 1
        ? makeId("top", currentIndex + 1)
        : makeId("right", 0);
    }

    if (key === "ArrowDown") {
      return makeId("bottom", currentIndex);
    }

    if (key === "ArrowUp") {
      return makeId("top", currentIndex);
    }
  }

  if (currentDir === "right") {
    if (key === "ArrowUp") {
      return currentIndex > 0
        ? makeId("right", currentIndex - 1)
        : makeId("top", boardWidth - 1);
    }

    if (key === "ArrowDown") {
      return currentIndex < boardHeight - 1
        ? makeId("right", currentIndex + 1)
        : makeId("bottom", boardWidth - 1);
    }

    if (key === "ArrowLeft") {
      return makeId("left", currentIndex);
    }

    if (key === "ArrowRight") {
      return makeId("right", currentIndex);
    }
  }

  if (currentDir === "bottom") {
    if (key === "ArrowLeft") {
      return currentIndex > 0
        ? makeId("bottom", currentIndex - 1)
        : makeId("left", boardHeight - 1);
    }

    if (key === "ArrowRight") {
      return currentIndex < boardWidth - 1
        ? makeId("bottom", currentIndex + 1)
        : makeId("right", boardHeight - 1);
    }

    if (key === "ArrowUp") {
      return makeId("top", currentIndex);
    }

    if (key === "ArrowDown") {
      return makeId("bottom", currentIndex);
    }
  }

  if (currentDir === "left") {
    if (key === "ArrowUp") {
      return currentIndex > 0
        ? makeId("left", currentIndex - 1)
        : makeId("top", 0);
    }

    if (key === "ArrowDown") {
      return currentIndex < boardHeight - 1
        ? makeId("left", currentIndex + 1)
        : makeId("bottom", 0);
    }

    if (key === "ArrowRight") {
      return makeId("right", currentIndex);
    }

    if (key === "ArrowLeft") {
      return makeId("left", currentIndex);
    }
  }

  return null;
}

export default function BoardView({ board, players, progress }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedButton, setSelectedButton] = useState<string | null>(null);
  const [boardState, setBoardState] = useState(board);
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
    const newTiles = boardState.tiles.map((row) => [...row]);
    const row = newTiles[rowIndex];

    if (direction === "left") {
      // Swap with the cell to the left (wraps around)
      const lastTile = row.pop()!;
      row.unshift(lastTile);
      
      // Update x position: move first tile to end position
      lastTile.x = boardState.width - 1;
      row.forEach((tile, x) => {
        if (tile !== lastTile) {
          tile.x = x;
        }
      });
    } else {
      // Swap with the cell to the right (wraps around)
      const firstTile = row.shift()!;
      row.push(firstTile);
      
      // Update x position: move first tile to end position
      firstTile.x = boardState.width - 1;
      row.forEach((tile, x) => {
        if (tile !== firstTile) {
          tile.x = x;
        }
      });
    }

    // Update board state to trigger re-render and canvas redraw
    setBoardState({ ...boardState, tiles: newTiles });
  };

  const handleShiftColumn = (colIndex: number, direction: "up" | "down") => {
    const newTiles = boardState.tiles.map((row) => [...row]);
    const column = newTiles.map((row) => row[colIndex]);

    if (direction === "up") {
      // Swap with the cell above (wraps around)
      const lastTile = column.pop()!;
      column.unshift(lastTile);
      
      // Update y position: move last tile to start position
      lastTile.y = boardState.height - 1;
      column.forEach((tile, y) => {
        if (tile !== lastTile) {
          tile.y = y;
        }
      });
    } else {
      // Swap with the cell below (wraps around)
      const firstTile = column.shift()!;
      column.push(firstTile);
      
      // Update y position: move first tile to end position
      firstTile.y = boardState.height - 1;
      column.forEach((tile, y) => {
        if (tile !== firstTile) {
          tile.y = y;
        }
      });
    }

    // Reassign column back to the board
    column.forEach((tile, y) => {
      newTiles[y][colIndex] = tile;
    });

    // Update board state to trigger re-render and canvas redraw
    setBoardState({ ...boardState, tiles: newTiles });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"].includes(e.key)) {
      return;
    }

    e.preventDefault();

    if (e.key === "Enter" && selectedButton) {
      const [dir, idxStr] = selectedButton.split("-");
      const idx = Number(idxStr);

      if (dir === "left") {
        handleShiftRow(idx, "left");
      } else if (dir === "right") {
        handleShiftRow(idx, "right");
      } else if (dir === "top") {
        handleShiftColumn(idx, "up");
      } else if (dir === "bottom") {
        handleShiftColumn(idx, "down");
      }

      return;
    }

    const [currentDir, currentIndexStr] = (selectedButton || "").split("-");
    const currentIndex = Number(currentIndexStr) || 0;

    const newButtonId = getNextButtonId(
      e.key,
      currentDir,
      currentIndex,
      boardState.width,
      boardState.height
    );

    if (newButtonId && newButtonId !== selectedButton) {
      setSelectedButton(newButtonId);

      requestAnimationFrame(() => {
        buttonRefs.current[newButtonId]?.focus();
      });
    }
  };

  useEffect(() => {
    let cancelled = false;

    const drawBoard = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const boardWidthPx = boardState.width * CELL_SIZE;
      const boardHeightPx = boardState.height * CELL_SIZE;
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

      for (let y = 0; y < boardState.height; y++) {
        for (let x = 0; x < boardState.width; x++) {
          const tile = boardState.tiles[y][x];
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
  }, [boardState, players, collectibleSet]);

  return (
    <div className="flex flex-col items-center gap-2" onKeyDown={handleKeyDown}>
      <div className="flex gap-1 justify-center">
        {Array.from({ length: boardState.width }).map((_, colIndex) => (
          <button
            key={`top-${colIndex}`}
            ref={(el) => {
              if (el) buttonRefs.current[`top-${colIndex}`] = el;
            }}
            onClick={() => {
              setSelectedButton(`top-${colIndex}`);
              handleShiftColumn(colIndex, "up");
            }}
            className="px-4 rounded transition-all text-lg font-bold"
            aria-label={`Shift column ${colIndex} up`}
          >
            <MdOutlineKeyboardArrowDown
              className={`text-3xl transition-colors ${
                selectedButton === `top-${colIndex}` ? "text-cyan-bright" : "text-magenta"
              }`}
            />
          </button>
        ))}
      </div>

      <div className="flex items-stretch gap-1">
        <div className="flex flex-col gap-2 justify-center">
          {Array.from({ length: boardState.height }).map((_, rowIndex) => (
            <button
              key={`left-${rowIndex}`}
              ref={(el) => {
                if (el) buttonRefs.current[`left-${rowIndex}`] = el;
              }}
              onClick={() => {
                setSelectedButton(`left-${rowIndex}`);
                handleShiftRow(rowIndex, "left");
              }}
              className="px-1 py-4 rounded transition-all text-xl font-bold"
              aria-label={`Shift row ${rowIndex} left`}
            >
              <MdOutlineKeyboardArrowRight
                className={`text-3xl transition-colors ${
                  selectedButton === `left-${rowIndex}` ? "text-cyan-bright" : "text-magenta"
                }`}
              />
            </button>
          ))}
        </div>

        <div className="border-gray-400 rounded-lg overflow-hidden flex-shrink-0">
          <canvas ref={canvasRef} className="block" />
        </div>

        <div className="flex flex-col gap-1 justify-center">
          {Array.from({ length: boardState.height }).map((_, rowIndex) => (
            <button
              key={`right-${rowIndex}`}
              ref={(el) => {
                if (el) buttonRefs.current[`right-${rowIndex}`] = el;
              }}
              onClick={() => {
                setSelectedButton(`right-${rowIndex}`);
                handleShiftRow(rowIndex, "right");
              }}
              className="py-4 rounded transition-all text-xl font-bold"
              aria-label={`Shift row ${rowIndex} right`}
            >
              <MdOutlineKeyboardArrowLeft
                className={`text-3xl transition-colors ${
                  selectedButton === `right-${rowIndex}` ? "text-cyan-bright" : "text-magenta"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-1 justify-center">
        {Array.from({ length: boardState.width }).map((_, colIndex) => (
          <button
            key={`bottom-${colIndex}`}
            ref={(el) => {
              if (el) buttonRefs.current[`bottom-${colIndex}`] = el;
            }}
            onClick={() => {
              setSelectedButton(`bottom-${colIndex}`);
              handleShiftColumn(colIndex, "down");
            }}
            className="px-4 rounded transition-all text-lg font-bold"
            aria-label={`Shift column ${colIndex} down`}
          >
            <MdOutlineKeyboardArrowUp
              className={`text-3xl transition-colors ${
                selectedButton === `bottom-${colIndex}` ? "text-cyan-bright" : "text-magenta"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}