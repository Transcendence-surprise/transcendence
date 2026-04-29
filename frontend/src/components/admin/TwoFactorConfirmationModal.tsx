import ConfirmModal from "../UI/modals/ConfirmModal";

export interface PendingTwoFactorChange {
  id: number | string;
  username: string;
  enabled: boolean;
}

interface TwoFactorConfirmationModalProps {
  pendingTwoFactorChange: PendingTwoFactorChange | null;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function TwoFactorConfirmationModal({
  pendingTwoFactorChange,
  loading,
  onCancel,
  onConfirm,
}: TwoFactorConfirmationModalProps) {
  return (
    <ConfirmModal
      open={!!pendingTwoFactorChange}
      title="Confirm 2FA change"
      message={
        pendingTwoFactorChange ? (
          <>
            Are you sure you want to{" "}
            <span className="font-semibold text-white">
              {pendingTwoFactorChange.enabled ? "enable" : "disable"}
            </span>{" "}
            2FA for{" "}
            <span className="font-semibold text-cyan-bright">
              {pendingTwoFactorChange.username}
            </span>
            ?
          </>
        ) : null
      }
      note="This will change the security settings for this account."
      loading={loading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
