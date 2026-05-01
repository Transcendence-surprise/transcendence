type BackButtonProps = {
  onClick: () => void;
  className?: string;
  label?: string;
  variant?: "text" | "outline";
  type?: "button" | "submit" | "reset";
};

export default function BackButton({
  onClick,
  className = "",
  label = "Back",
  variant = "text",
  type = "button",
}: BackButtonProps) {
  const variantClassName =
    variant === "outline"
      ? "rounded-lg border border-[var(--color-border-subtle)] bg-bg-dark-tertiary px-6 py-3 font-medium text-white transition-all hover:border-cyan-bright hover:shadow-cyan-light"
      : "text-sm text-light-cyan underline underline-offset-4 transition-colors hover:text-cyan-bright";

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${variantClassName} ${className}`.trim()}
    >
      {label}
    </button>
  );
}
