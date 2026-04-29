import type { User } from "../../api/users";
import DeleteActionButton from "../shared/DeleteActionButton";

interface AdminUserRowProps {
  user: User;
  isUpdating2FA: boolean;
  isDeleting: boolean;
  onToggle2FA: (user: User, enabled: boolean) => void;
  onDelete: (user: User) => void;
}

export default function AdminUserRow({
  user,
  isUpdating2FA,
  isDeleting,
  onToggle2FA,
  onDelete,
}: AdminUserRowProps) {
  const isAdminUser = user.username === "admin";

  return (
    <li
      className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-[var(--color-border-subtle)] p-3"
    >
      <div className="flex min-w-0 flex-col gap-1">
        <p className="truncate font-semibold text-white">{user.username}</p>
        <p className="truncate text-sm text-gray-400">{user.email}</p>
      </div>

      {!isAdminUser && (
        <>
          <div className="flex flex-col items-center gap-3 justify-self-start">
            <span className="text-xs font-semibold uppercase tracking-wide text-white">
              2FA
            </span>
            <label className="flex select-none items-center gap-2 text-xs text-gray-300">
              <span className="relative inline-block h-6 w-10 select-none align-middle">
                <input
                  type="checkbox"
                  checked={!!user.twoFactorEnabled}
                  onChange={(e) => onToggle2FA(user, e.target.checked)}
                  disabled={isUpdating2FA}
                  aria-label={`Toggle two-factor authentication for ${user.username}`}
                  className="peer sr-only"
                />
                <span className="block h-6 w-10 rounded-full bg-gray-300 transition-colors duration-200 peer-checked:bg-green-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"></span>
                <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 peer-checked:translate-x-4 peer-disabled:opacity-70"></span>
              </span>
            </label>
          </div>

          <DeleteActionButton
            disabled={isDeleting}
            ariaLabel={`Delete user ${user.username}`}
            onClick={() => onDelete(user)}
          />
        </>
      )}
    </li>
  );
}
