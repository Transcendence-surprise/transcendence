import type { User } from "../../api/users";
import AdminUserRow from "./AdminUserRow";

interface AdminUsersSectionProps {
  users: User[];
  updating2FA: Record<string, boolean>;
  deletingUsers: Record<string, boolean>;
  onToggle2FA: (user: User, enabled: boolean) => void;
  onDelete: (user: User) => void;
}

export default function AdminUsersSection({
  users,
  updating2FA,
  deletingUsers,
  onToggle2FA,
  onDelete,
}: AdminUsersSectionProps) {
  return (
    <section className="rounded-xl border border-[var(--color-border-subtle)] bg-bg-modal p-6">
      <h2 className="mb-4 text-xl font-bold text-cyan-bright">Users</h2>
      <div className="space-y-2">
        {users.length === 0 ? (
          <p className="text-gray-400">No users found or loading...</p>
        ) : (
          <ul className="space-y-2">
            {users.map((user) => (
              <AdminUserRow
                key={user.id}
                user={user}
                isUpdating2FA={!!updating2FA[String(user.id)]}
                isDeleting={!!deletingUsers[String(user.id)]}
                onToggle2FA={onToggle2FA}
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
