// src/components/game/sidebar/TimerPanel.tsx

import { useEffect, useState } from "react";
import { PrivateGameState } from "../../../game/models/privatState";

type Props = {
  game: PrivateGameState;
};

export default function TimerPanel({ game }: Props) {
  const [now, setNow] = useState(Date.now());

  // tick every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const singleLevelLimitSec = game.level?.constraints?.levelLimitSec;
  const isSingleWithLevelTimer = typeof singleLevelLimitSec === "number";

  // Single: countdown to level fail timeout.
  const singleLevelRemaining = isSingleWithLevelTimer
    ? game.gameStartedAt
      ? Math.max(0, Math.floor((game.gameStartedAt + singleLevelLimitSec * 1000 - now) / 1000))
      : singleLevelLimitSec
    : 0;

  // Multi (or fallback): elapsed game time.
  const totalSeconds = game.gameStartedAt
    ? Math.floor((now - game.gameStartedAt) / 1000)
    : 0;

  // ------------------------
  // TURN TIMER
  // ------------------------
  const turnLimitSec = game.moveLimitPerTurnSec;
  const showTurnTimer = !isSingleWithLevelTimer && typeof turnLimitSec === "number";

  const turnRemaining = game.moveStartedAt && showTurnTimer
    ? Math.max(
        0,
        Math.floor(
          (game.moveStartedAt + turnLimitSec * 1000 - now) / 1000
        )
      )
    : 0;

  // ------------------------
  // Format helper
  // ------------------------
  const format = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-gray-800 rounded-xl text-white w-full">
      
      {/* MAIN TIMER */}
      <div>
        <div className="text-xs text-gray-400">
          {isSingleWithLevelTimer ? "Level Time" : "Game Time"}
        </div>
        <div
          className={`text-lg font-bold ${
            isSingleWithLevelTimer && singleLevelRemaining <= 10 ? "text-red-400" : ""
          }`}
        >
          {format(isSingleWithLevelTimer ? singleLevelRemaining : totalSeconds)}
        </div>
      </div>

      {/* TURN TIMER (MULTI ONLY) */}
      {showTurnTimer && (
        <div>
          <div className="text-xs text-gray-400">Turn Time</div>
          <div
            className={`text-lg font-bold ${
              turnRemaining <= 10 ? "text-red-400" : ""
            }`}
          >
            {format(turnRemaining)}
          </div>
        </div>
      )}

    </div>
  );
}