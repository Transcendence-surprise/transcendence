import ConfirmModal from "../UI/modals/ConfirmModal";

export interface PendingUserDeletion {
  id: number | string;
  username: string;
}

interface DeleteUserConfirmationModalProps {
  pendingUserDeletion: PendingUserDeletion | null;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function DeleteUserConfirmationModal({
  pendingUserDeletion,
  loading,
  onCancel,
  onConfirm,
}: DeleteUserConfirmationModalProps) {
  return (
    <ConfirmModal
      open={!!pendingUserDeletion}
      title="Confirm user deletion"
      message={
        pendingUserDeletion ? (
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-cyan-bright">
              {pendingUserDeletion.username}
            </span>
            ?
          </>
        ) : null
      }
      note="This action cannot be undone."
      confirmLabel="Delete user"
      loading={loading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
