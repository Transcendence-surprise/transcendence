// src/components/game/sidebar/TimerPanel.tsx

import { useEffect, useState } from "react";
import { PrivateGameState } from "../../../game/models/privatState";

type Props = {
  game: PrivateGameState;
  moveLimitPerTurnSec?: number; // pass from rules later
};

export default function TimerPanel({ game, moveLimitPerTurnSec = 180 }: Props) {
  const [now, setNow] = useState(Date.now());

  // tick every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ------------------------
  // TOTAL GAME TIMER
  // ------------------------
  const totalSeconds = game.gameStartedAt
    ? Math.floor((now - game.gameStartedAt) / 1000)
    : 0;

  // ------------------------
  // TURN TIMER
  // ------------------------
  const turnRemaining = game.moveStartedAt
    ? Math.max(
        0,
        Math.floor(
          (game.moveStartedAt + moveLimitPerTurnSec * 1000 - now) / 1000
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
      
      {/* TOTAL TIMER */}
      <div>
        <div className="text-xs text-gray-400">Game Time</div>
        <div className="text-lg font-bold">{format(totalSeconds)}</div>
      </div>

      {/* TURN TIMER */}
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

    </div>
  );
}