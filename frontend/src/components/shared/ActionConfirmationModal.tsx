import type { ReactNode } from "react";

export interface PendingDeletion {
  id: number | string;
  name: ReactNode;
}

interface ActionConfirmationModalProps {
  pendingDeletion: PendingDeletion | null;
  itemType?: string;
  title?: string;
  confirmLabel?: string;
  loading: boolean;
  message?: ReactNode;
  note?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function ActionConfirmationModal({
  pendingDeletion,
  itemType = "item",
  title,
  confirmLabel,
  loading,
  message,
  note = "This action cannot be undone.",
  onCancel,
  onConfirm,
}: ActionConfirmationModalProps) {
  if (!pendingDeletion) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-xl border border-[var(--color-border-subtle)] bg-bg-dark p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-white">
          {title ?? `Confirm ${itemType} deletion`}
        </h3>
        <div className="mt-3 text-sm leading-6 text-gray-300">
          {message ?? (
            <>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-cyan-bright">
                {pendingDeletion.name}
              </span>
              ?
            </>
          )}
        </div>
        {note ? <div className="mt-2 text-xs text-gray-400">{note}</div> : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-[var(--color-border-subtle)] px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-cyan-bright px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Saving..." : confirmLabel ?? `Delete ${itemType}`}
          </button>
        </div>
      </div>
    </div>
  );
}
