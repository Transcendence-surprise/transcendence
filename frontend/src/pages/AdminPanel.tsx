import { useAuth } from "../hooks/useAuth";
import type { User } from "../api/users";
import { useEffect, useState } from "react";
import { getAllUsers, deleteUser, setUserTwoFactor } from "../api/users";
import { checkAllServicesHealth, type ServiceHealth } from "../api/health";
import AdminServicesSection from "../components/admin/AdminServicesSection";
import AdminUsersSection from "../components/admin/AdminUsersSection";
import ActionConfirmationModal, {
  type PendingDeletion,
} from "../components/shared/ActionConfirmationModal";

interface PendingTwoFactorChange extends PendingDeletion {
  enabled: boolean;
}

export default function AdminPanel() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [updating2FA, setUpdating2FA] = useState<Record<string, boolean>>({});
  const [deletingUsers, setDeletingUsers] = useState<Record<string, boolean>>({});
  const [pending2FAChange, setPending2FAChange] =
    useState<PendingTwoFactorChange | null>(null);
  const [pendingUserDeletion, setPendingUserDeletion] =
    useState<PendingDeletion | null>(null);

  const handleToggle2FA = async (id: number | string, enabled: boolean) => {
    const key = String(id);

    if (updating2FA[key]) return;

    setUpdating2FA((prev) => ({ ...prev, [key]: true }));

    try {
      const updated = await setUserTwoFactor(id, enabled);
      setUsers((users) =>
        users.map((user) =>
          String(user.id) === String(id)
            ? { ...user, twoFactorEnabled: updated.twoFactorEnabled ?? enabled }
            : user
        )
      );
    } catch (err: any) {
      alert(err?.message || "Failed to update 2FA for user.");
      console.error(err);
    } finally {
      setUpdating2FA((prev) => ({ ...prev, [key]: false }));
    }
  };

  const requestToggle2FA = (targetUser: User, enabled: boolean) => {
    const key = String(targetUser.id);
    if (updating2FA[key]) return;

    setPending2FAChange({
      id: targetUser.id,
      name: targetUser.username,
      enabled,
    });
  };

  const close2FAModal = () => {
    if (pending2FAChange && updating2FA[String(pending2FAChange.id)]) return;
    setPending2FAChange(null);
  };

  const confirmToggle2FA = async () => {
    if (!pending2FAChange) return;

    await handleToggle2FA(pending2FAChange.id, pending2FAChange.enabled);
    setPending2FAChange(null);
  };

  const handleDeleteUser = async (id: number | string) => {
    const key = String(id);
    if (deletingUsers[key]) return;

    setDeletingUsers((prev) => ({ ...prev, [key]: true }));

    try {
      await deleteUser(id);
      setUsers((users) =>
        users.filter(
          (user) =>
            user.id !== id &&
            user.id !== String(id) &&
            user.id !== Number(id)
        )
      );
    } catch (err) {
      alert("Failed to delete user.");
      console.error(err);
    } finally {
      setDeletingUsers((prev) => ({ ...prev, [key]: false }));
    }
  };

  const requestDeleteUser = (targetUser: User) => {
    const key = String(targetUser.id);
    if (deletingUsers[key]) return;

    setPendingUserDeletion({
      id: targetUser.id,
      name: targetUser.username,
    });
  };

  const closeDeleteModal = () => {
    if (pendingUserDeletion && deletingUsers[String(pendingUserDeletion.id)]) return;
    setPendingUserDeletion(null);
  };

  const confirmDeleteUser = async () => {
    if (!pendingUserDeletion) return;

    await handleDeleteUser(pendingUserDeletion.id);
    setPendingUserDeletion(null);
  };
  useEffect(() => {
    const controller = new AbortController();

    if (isAdmin) {
      getAllUsers(controller.signal)
        .then(setUsers)
        .catch((err) => {
          if (err?.name !== "AbortError") {
            console.error(err);
          }
        });

      // Check services health
      checkAllServicesHealth(controller.signal)
        .then(setServices)
        .catch((err) => {
          if (err?.name !== "AbortError") {
            console.error(err);
          }
        });

      // Poll services health every 30 seconds
      const healthInterval = setInterval(() => {
        checkAllServicesHealth(controller.signal)
          .then(setServices)
          .catch((err) => {
            if (err?.name !== "AbortError") {
              console.error(err);
            }
          });
      }, 30000);

      return () => {
        clearInterval(healthInterval);
        controller.abort();
      };
    }

    return () => {
      controller.abort();
    };
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-icon-red">Access Denied</h2>
        <p className="text-icon-red/80">You do not have admin privileges.</p>
      </div>
      
    );
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl text-light-cyan font-bold mb-4">Admin Panel</h1>
      <p className="mb-4 text-white">Welcome, {user?.username}!</p>

      <AdminServicesSection services={services} />

      <AdminUsersSection
        users={users}
        updating2FA={updating2FA}
        deletingUsers={deletingUsers}
        onToggle2FA={requestToggle2FA}
        onDelete={requestDeleteUser}
      />

      <ActionConfirmationModal
        pendingDeletion={pending2FAChange}
        title="Confirm 2FA change"
        confirmLabel="Confirm"
        message={
          pending2FAChange ? (
            <>
              Are you sure you want to{" "}
              <span className="font-semibold text-white">
                {pending2FAChange.enabled ? "enable" : "disable"}
              </span>{" "}
              2FA for{" "}
              <span className="font-semibold text-cyan-bright">
                {pending2FAChange.name}
              </span>
              ?
            </>
          ) : null
        }
        note="This will change the security settings for this account."
        loading={
          pending2FAChange
            ? updating2FA[String(pending2FAChange.id)]
            : false
        }
        onCancel={close2FAModal}
        onConfirm={confirmToggle2FA}
      />

      <ActionConfirmationModal
        pendingDeletion={pendingUserDeletion}
        itemType="user"
        loading={
          pendingUserDeletion
            ? deletingUsers[String(pendingUserDeletion.id)]
            : false
        }
        onCancel={closeDeleteModal}
        onConfirm={confirmDeleteUser}
      />
    </div>
  );
}
