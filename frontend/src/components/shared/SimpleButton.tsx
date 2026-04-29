type SimpleButtonProps = {
  title: string;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  textClassName?: string;
};

export default function SimpleButton({
  title,
  onClick,
  disabled = false,
  type = "button",
  className = "",
  textClassName = "",
}: SimpleButtonProps) {
  const baseClassName =
    "flex flex-col items-center justify-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg shadow-lg hover:shadow-cyan-light hover:scale-105 transition-all border border-cyan-300/50 hover:border-cyan-bright cursor-pointer w-48 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClassName} ${className}`.trim()}
    >
      <h3 className={`text-lg font-bold text-white mb-1 ${textClassName}`.trim()}>{title}</h3>
    </button>
  );
}
