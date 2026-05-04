import BackButton from "../shared/BackButton";

type GameEndModalProps = {
  variant?: "victory" | "defeat" | "draw" | "neutral";
  badgeLabel: string;
  title: string;
  winnerText?: string | null;
  onBack: () => void;
  backLabel?: string;
};

export default function GameEndModal({
  variant = "neutral",
  badgeLabel,
  title,
  winnerText = null,
  onBack,
  backLabel = "Back",
}: GameEndModalProps) {
  const badgeClassName =
    variant === "victory"
      ? "border-yellow-300/30 bg-yellow-300/10 text-yellow-200"
      : variant === "defeat"
        ? "border-rose-400/25 bg-rose-400/10 text-rose-200"
        : variant === "draw"
          ? "border-violet-300/30 bg-violet-400/10 text-violet-100"
          : "border-cyan-400/25 bg-cyan-400/10 text-cyan-100";
  const glowClassName =
    variant === "victory"
      ? "from-yellow-300/12 via-amber-400/8 to-transparent"
      : variant === "defeat"
        ? "from-rose-400/12 via-red-500/8 to-transparent"
        : variant === "draw"
          ? "from-violet-300/12 via-fuchsia-400/8 to-transparent"
          : "from-cyan-400/10 via-blue-500/8 to-transparent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(3,7,18,0.76)] px-4 backdrop-blur-md">
      <div className="relative w-full max-w-xl overflow-hidden rounded-[1.75rem] border border-[var(--color-border-subtle)] bg-[linear-gradient(180deg,rgba(12,18,30,0.98),rgba(8,12,22,0.99))] px-6 py-8 shadow-[0_28px_100px_rgba(0,0,0,0.5)]">
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b ${glowClassName}`}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_82%,rgba(96,165,250,0.12),rgba(0,0,0,0)_30%)]" />

        <div className="relative flex flex-col items-center text-center">
          <span
            className={`inline-flex items-center rounded-full border px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${badgeClassName}`}
          >
            {badgeLabel}
          </span>

          <h2 className="mt-4 text-5xl font-bold tracking-tight text-white sm:text-4xl">
            {title}
          </h2>

          {winnerText ? (
            <p className="mt-4 max-w-2xl text-xl font-semibold leading-9 text-cyan-400">
              {winnerText}
            </p>
          ) : null}

          <div className="mt-8 flex w-full justify-center">
            <BackButton
              onClick={onBack}
              label={backLabel}
              className="justify-center"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
