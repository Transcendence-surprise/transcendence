import { useAuth } from "../hooks/useAuth";
import type { User } from "../api/users";
import { useEffect, useState } from "react";
import { getAllUsers, deleteUser, setUserTwoFactor } from "../api/users";
import { checkAllServicesHealth, type ServiceHealth } from "../api/health";
import { TiDeleteOutline } from "react-icons/ti";
import { TbAuth2Fa } from "react-icons/tb";
import ConfirmModal from "../components/UI/modals/ConfirmModal";
import DeleteUserConfirmationModal, {
  type PendingUserDeletion,
} from "../components/UI/modals/DeleteUserConfirmationModal";

interface PendingTwoFactorChange {
  id: number | string;
  username: string;
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
    useState<PendingUserDeletion | null>(null);

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
      username: targetUser.username,
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
      username: targetUser.username,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ok":
        return "text-green-400 bg-green-400/10";
      case "error":
        return "text-red-400 bg-red-400/10";
      case "loading":
        return "text-yellow-400 bg-yellow-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ok":
        return "✓";
      case "error":
        return "✕";
      case "loading":
        return "⟳";
      default:
        return "?";
    }
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl text-light-cyan font-bold mb-4">Admin Panel</h1>
      <p className="mb-4 text-white">Welcome, {user?.username}!</p>

      {/* Services Health Section */}
      <section className="bg-bg-modal rounded-xl border border-[var(--color-border-subtle)] p-6">
        <h2 className="text-xl font-bold text-cyan-bright mb-4">
          Microservices Status
        </h2>
        <div className="space-y-3">
          {services.length === 0 ? (
            <p className="text-gray-400">Loading services...</p>
          ) : (
            services.map((service) => (
              <div
                key={service.endpoint}
                className="flex items-center justify-between p-4 rounded-lg border border-[var(--color-border-subtle)] bg-bg-dark/50 hover:bg-bg-dark/80 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{service.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {service.endpoint}
                  </p>
                  {service.error && (
                    <p className="text-xs text-red-400 mt-1">
                      Error: {service.error}
                    </p>
                  )}
                </div>
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg font-semibold text-sm ${getStatusColor(service.status)}`}
                >
                  <span>{getStatusIcon(service.status)}</span>
                  <span className="capitalize">{service.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
        {services.length > 0 && (
          <p className="text-xs text-gray-500 mt-4">
            Last updated:{" "}
            {services[0]?.lastCheck?.toLocaleTimeString() ?? "Never"}
          </p>
        )}
      </section>

      {/* Users Management Section */}
      <section className="bg-bg-modal rounded-xl border border-[var(--color-border-subtle)] p-6">
        <h2 className="text-xl font-bold text-cyan-bright mb-4">Users</h2>
        <div className="space-y-2">
          {users.length === 0 ? (
            <p className="text-gray-400">No users found or loading...</p>
          ) : (
            <ul className="space-y-2">
              {users.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between p-3 rounded-xl 
                    
                    border border-[var(--color-border-subtle)]
                  "
                >
                  <div className="flex flex-col gap-1 w-5">
                    <p className="text-white font-semibold">{u.username}</p>
                    <p className="text-sm text-gray-400">{u.email}</p>
                  </div>
              {u.username !== "admin" && (
                <div className="flex">
                    <div className="flex flex-col items-center gap-1">
                  <TbAuth2Fa 
                    className="text-white text-2xl self-center cursor-pointer"
                  />
                  <label className="flex items-center gap-2 text-xs text-gray-300 select-none">
                    <span className="relative inline-block w-10 h-6 align-middle select-none">
                      <input
                        type="checkbox"
                        checked={!!u.twoFactorEnabled}
                        onChange={(e) => requestToggle2FA(u, e.target.checked)}
                        disabled={updating2FA[String(u.id)]}
                        aria-label={`Toggle two-factor authentication for ${u.username}`}
                        className="sr-only peer"
                      />
                      <span
                        className="block h-6 w-10 rounded-full bg-gray-300 transition-colors duration-200 peer-checked:bg-green-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                      ></span>
                      <span
                        className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 peer-checked:translate-x-4 peer-disabled:opacity-70"
                      ></span>
                    </span>
                  </label>
                </div>
                </div>
              
              )}
              {u.username !== "admin" && (
                <TiDeleteOutline
                  className={`text-2xl self-center transition-transform duration-150 ${
                    deletingUsers[String(u.id)]
                      ? "cursor-not-allowed text-red-400/60"
                      : "cursor-pointer text-red-500 hover:scale-125"
                  }`}
                  onClick={() => requestDeleteUser(u)}
                />
              )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <ConfirmModal
        open={!!pending2FAChange}
        title="Confirm 2FA change"
        message={
          pending2FAChange ? (
            <>
              Are you sure you want to{" "}
              <span className="font-semibold text-white">
                {pending2FAChange.enabled ? "enable" : "disable"}
              </span>{" "}
              2FA for{" "}
              <span className="font-semibold text-cyan-bright">
                {pending2FAChange.username}
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

      <DeleteUserConfirmationModal
        pendingUserDeletion={pendingUserDeletion}
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
