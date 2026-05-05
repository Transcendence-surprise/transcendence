type LobbyActionButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "leave";
  children: React.ReactNode;
};

export default function LobbyActionButton({
  onClick,
  disabled = false,
  variant = "primary",
  children,
}: LobbyActionButtonProps) {
  const baseClass =
    "inline-flex min-w-[148px] items-center justify-center rounded-lg px-6 py-2.5 font-semibold transition-all duration-200 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

  const variantClass =
    variant === "leave"
      ? "border border-neutral-500 bg-white/[0.03] text-white hover:border-pink-300/45 hover:bg-pink-400/12"
      : "border border-neutral-500 bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(34,211,238,0.22)]";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClass}`}
    >
      {children}
    </button>
  );
}
