const desktopGridClass =
  "grid grid-cols-[1.3fr_1fr_0.6fr_1fr_1fr_90px] gap-4";
const desktopHeaderClass =
  `${desktopGridClass} border-b border-[var(--color-border-gray)] px-3 py-3 justify-items-center text-center text-xs uppercase tracking-[0.16em] text-light-cyan/80`;

export default function DesktopHeader() {
  return (
    <div className={desktopHeaderClass}>
      <div>Host</div>
      <div>Players</div>
      <div>Max</div>
      <div>Phase</div>
      <div>Spectators</div>
      <div>Action</div>
    </div>
  );
}
