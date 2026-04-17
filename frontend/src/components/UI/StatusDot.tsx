type StatusDotProps = {
  active: boolean;
  activeClassName?: string;
  inactiveClassName?: string;
  className?: string;
};

export default function StatusDot({
  active,
  activeClassName = "bg-green-400",
  inactiveClassName = "bg-gray-500",
  className = "",
}: StatusDotProps) {
  const colorClassName = active ? activeClassName : inactiveClassName;

  return (
    <span
      aria-hidden="true"
      className={`inline-block rounded-full ${colorClassName} ${className}`.trim()}
    />
  );
}
