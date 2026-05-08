import { useId, type ReactNode } from "react";

export type AlertVariant = "info" | "success" | "warning" | "error";

type AlertDialogProps = {
  open: boolean;
  title?: string;
  message: ReactNode;
  variant?: AlertVariant;
  onClose: () => void;
  dismissOnBackdropClick?: boolean;
};

const variantStyles: Record<
  AlertVariant,
  { border: string; accent: string; button: string; badge: string }
> = {
  info: {
    border: "border-sky-400/30",
    accent: "text-sky-200",
    button: "bg-sky-400 text-slate-950 hover:bg-sky-300",
    badge: "bg-sky-400/10 text-sky-200",
  },
  success: {
    border: "border-emerald-400/30",
    accent: "text-emerald-200",
    button: "bg-emerald-400 text-slate-950 hover:bg-emerald-300",
    badge: "bg-emerald-400/10 text-emerald-200",
  },
  warning: {
    border: "border-amber-400/30",
    accent: "text-amber-200",
    button: "bg-amber-400 text-slate-950 hover:bg-amber-300",
    badge: "bg-amber-400/10 text-amber-200",
  },
  error: {
    border: "border-rose-400/30",
    accent: "text-rose-200",
    button: "bg-rose-400 text-slate-950 hover:bg-rose-300",
    badge: "bg-rose-400/10 text-rose-200",
  },
};

export default function Alert({
  open,
  title = "Notice",
  message,
  variant = "info",
  onClose,
  dismissOnBackdropClick = true,
}: AlertDialogProps) {
  if (!open) return null;

  const instanceId = useId();
  const titleId = `${instanceId}-title`;
  const messageId = `${instanceId}-message`;

  const styles = variantStyles[variant];

  const handleBackdropClick = () => {
    if (dismissOnBackdropClick) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full max-w-md rounded-2xl border ${styles.border} bg-[linear-gradient(180deg,rgba(10,14,25,0.98),rgba(10,14,25,0.92))] p-6 shadow-2xl`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${styles.badge}`}
        >
          {variant}
        </div>

        <h3 id={titleId} className={`mt-4 text-xl font-bold ${styles.accent}`}>
          {title}
        </h3>

        <div id={messageId} className="mt-3 text-sm leading-6 text-white/75">
          {message}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${styles.button}`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
