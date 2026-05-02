import type { ReactNode } from "react";

type InfoChipProps = {
  children: ReactNode;
  className?: string;
  size?: "sm" | "xs";
  variant?: "cyan" | "muted";
};

export default function InfoChip({
  children,
  className = "",
  size = "sm",
  variant = "cyan",
}: InfoChipProps) {
  const sizeClassName =
    size === "xs"
      ? "px-2.5 py-1 text-[11px]"
      : "px-3 py-1 text-xs";

  const variantClassName =
    variant === "muted"
      ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
      : "border-cyan-400/20 bg-cyan-400/10 text-cyan-100";

  return (
    <span
      className={`rounded-full border font-medium ${sizeClassName} ${variantClassName} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
