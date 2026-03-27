// src/components/game/BoardView.tsx
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";
import { Board } from "../../game/models/board";
import { PlayerState, PlayerProgress } from "../../game/models/gameState";
import { leaveGame } from "../../api/game";
import { useBoardState } from "../../hooks/useBoardState";
import { useDrawBoard } from "../../hooks/useDrawBoard";
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation";

type Props = {
  board: Board;
  players: PlayerState[];
  progress: PlayerProgress;
  gameId: string;
};

const CELL_SIZE = 68;

export default function BoardView({ board, players, progress, gameId }: Props) {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // --- Hooks ---
  const { boardState, shiftRow, shiftColumn, collectibleSet } = useBoardState(board, progress);
  const { selectedButton, setSelectedButton, handleKeyDown } = useKeyboardNavigation(
    boardState.width,
    boardState.height
  );
  useDrawBoard(canvasRef, boardState, players, collectibleSet);

  // --- Leave game handler ---
  const handleLeaveGame = async () => {
    try {
      const result = await leaveGame(gameId);
      if (!result.ok) alert("Error leaving game");
    } catch {
      alert("Error leaving game");
    } finally {
      navigate(-1);
    }
  };

  // --- Button click helpers ---
  const handleRowClick = (rowIndex: number, direction: "left" | "right") => {
    setSelectedButton(`${direction}-${rowIndex}`);
    shiftRow(rowIndex, direction);
  };
  const handleColClick = (colIndex: number, direction: "up" | "down") => {
    setSelectedButton(`${direction === "up" ? "top" : "bottom"}-${colIndex}`);
    shiftColumn(colIndex, direction);
  };

  return (
    <div className="flex flex-col items-center gap-2" onKeyDown={(e) => handleKeyDown(e, buttonRefs)}>
      {/* Top arrows */}
      <div className="flex gap-1 justify-center">
        {Array.from({ length: boardState.width }).map((_, colIndex) => (
          <button
            key={`top-${colIndex}`}
            ref={(el) => { buttonRefs.current[`top-${colIndex}`] = el; }}
            onClick={() => handleColClick(colIndex, "up")}
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

      {/* Left + Canvas + Right */}
      <div className="flex items-stretch gap-1">
        {/* Left arrows */}
        <div className="flex flex-col gap-2 justify-center">
          {Array.from({ length: boardState.height }).map((_, rowIndex) => (
            <button
              key={`left-${rowIndex}`}
              ref={(el) => { buttonRefs.current[`left-${rowIndex}`] = el; }}
              onClick={() => handleRowClick(rowIndex, "left")}
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

        {/* Canvas */}
        <div className="border-gray-400 rounded-lg overflow-hidden flex-shrink-0">
          <canvas ref={canvasRef} className="block" />
        </div>

        {/* Right arrows */}
        <div className="flex flex-col gap-2 justify-center">
          {Array.from({ length: boardState.height }).map((_, rowIndex) => (
            <button
              key={`right-${rowIndex}`}
              ref={(el) => { buttonRefs.current[`right-${rowIndex}`] = el; }}
              onClick={() => handleRowClick(rowIndex, "right")}
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

      {/* Bottom arrows */}
      <div className="flex gap-1 justify-center">
        {Array.from({ length: boardState.width }).map((_, colIndex) => (
          <button
            key={`bottom-${colIndex}`}
            ref={(el) => { buttonRefs.current[`bottom-${colIndex}`] = el; }}
            onClick={() => handleColClick(colIndex, "down")}
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

      {/* Navigation buttons */}
      <button onClick={() => navigate(-2)} className="mt-2 text-sm underline text-blue-300">
        Back
      </button>
      <button onClick={handleLeaveGame} className="mt-2 text-sm underline text-blue-300">
        Leave Game
      </button>
    </div>
  );
}