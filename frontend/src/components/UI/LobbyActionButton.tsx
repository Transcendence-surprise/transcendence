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
    "px-6 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClass =
    variant === "leave"
      ? "bg-red-600/80 hover:bg-red-500 text-white border border-red-400/30"
      : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-[0_8px_20px_rgba(0,234,255,0.4)] text-white border border-cyan-400/30";

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
