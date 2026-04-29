import { TiDeleteOutline } from "react-icons/ti";

interface DeleteActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export default function DeleteActionButton({
  onClick,
  disabled = false,
  ariaLabel = "Delete",
}: DeleteActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`text-2xl transition-transform duration-150 ${
        disabled
          ? "cursor-not-allowed text-red-400/60"
          : "cursor-pointer text-red-500 hover:scale-125"
      }`}
    >
      <TiDeleteOutline />
    </button>
  );
}
