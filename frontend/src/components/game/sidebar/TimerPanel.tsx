// src/components/game/sidebar/TimerPanel.tsx

import { useEffect, useState } from "react";
import { PrivateGameState } from "../../../game/models/privatState";
import InfoChip from "../../shared/InfoChip";

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

  const mainIsDanger = isSingleWithLevelTimer && singleLevelRemaining <= 10;
  const turnIsDanger = turnRemaining <= 10;
  const levelTimerBase = Math.max(1, singleLevelLimitSec ?? singleLevelRemaining ?? 1);

  return (
    <div className="w-full rounded-2xl border border-[var(--color-border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.028),rgba(255,255,255,0.01))] px-3 py-3 text-white shadow-[0_12px_28px_rgba(0,0,0,0.2)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-light-cyan/65">
            Run Status
          </p>
          <h3 className="mt-1 text-base font-semibold text-white">
            {isSingleWithLevelTimer ? "Level Timer" : "Game Timer"}
          </h3>
        </div>
        <InfoChip variant={isSingleWithLevelTimer ? "cyan" : "muted"}>
          {isSingleWithLevelTimer ? "Solo" : "Live"}
        </InfoChip>
      </div>

      <div className="mt-3 rounded-xl border border-neutral-500/30 bg-black/20 px-3 py-3">
        <div className="text-xs uppercase tracking-[0.14em] text-white/45">
          {isSingleWithLevelTimer ? "Level Time Remaining" : "Elapsed Game Time"}
        </div>
        <div
          className={`mt-2 text-[2rem] font-bold tracking-tight ${
            mainIsDanger ? "text-red-400" : "text-cyan-100"
          }`}
        >
          {format(isSingleWithLevelTimer ? singleLevelRemaining : totalSeconds)}
        </div>
        {isSingleWithLevelTimer ? (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
            <div
              className={`h-full rounded-full transition-[width] duration-1000 ${
                mainIsDanger ? "bg-red-400" : "bg-cyan-300"
              }`}
              style={{
                width: `${Math.max(
                  0,
                  Math.min(
                    100,
                    (singleLevelRemaining / levelTimerBase) * 100,
                  ),
                )}%`,
              }}
            />
          </div>
        ) : null}
      </div>

      {showTurnTimer && (
        <div className="mt-2.5 rounded-xl border border-neutral-500/30 bg-black/20 px-3 py-2.5">
          <div className="text-xs uppercase tracking-[0.14em] text-white/45">
            Turn Time
          </div>
          <div
            className={`mt-1 text-lg font-bold ${
              turnIsDanger ? "text-red-400" : "text-cyan-100"
            }`}
          >
            {format(turnRemaining)}
          </div>
        </div>
      )}
    </div>
  );
}
