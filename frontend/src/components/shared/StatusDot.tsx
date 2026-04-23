type StatusDotProps = {
  active: boolean;
  activeClassName?: string;
  inactiveClassName?: string;
  className?: string;
};

export default function StatusDot({
  active,
  // Use a background color + shadow for visible neon dot by default
  activeClassName = "bg-[var(--color-neon-green)] shadow-[0_0_8px_rgba(29,252,122,0.45)]",
  inactiveClassName = "bg-gray-500",
  // default size for the dot (larger so glow is visible)
  className = "w-3 h-3",
}: StatusDotProps) {
  const colorClassName = active ? activeClassName : inactiveClassName;

  return (
    <span
      aria-hidden="true"
      className={`inline-block rounded-full ${colorClassName} ${className}`.trim()}
    />
  );
}
