// Example Admin Panel Component
import { useAuth } from "../hooks/useAuth";
import type { User } from "../api/users";
import { useEffect, useState } from "react";
import { getAllUsers, deleteUser, setUserTwoFactor } from "../api/users";
import { checkAllServicesHealth, type ServiceHealth } from "../api/health";
import { TiDeleteOutline } from "react-icons/ti";
import { TbAuth2Fa } from "react-icons/tb";

export default function AdminPanel() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<ServiceHealth[]>([]);

  const handleDeleteUser = async (id: number | string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      setUsers((users) => users.filter((user) => user.id !== id && user.id !== String(id) && user.id !== Number(id)));
    } catch (err) {
      alert("Failed to delete user.");
      console.error(err);
    }
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
      <p className="mb-4 text-white">Welcome, Admin {user?.username}!</p>

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
                  className="flex justify-between p-3 rounded-lg bg-bg-dark/50 border border-[var(--color-border-subtle)] flex-row"
                >
                  <div>
                    <p className="text-white font-semibold">{u.username}</p>
                    <p className="text-sm text-gray-400">{u.email}</p>
                  </div>
              {u.username !== "admin" && (
                <div className="flex flex-col items-center gap-1">
                  <TbAuth2Fa 
                    className="text-white text-2xl self-center cursor-pointer"
                  />
                  <label className="flex items-center gap-2 text-xs text-gray-300 select-none">
                    {/* <span>2FA</span> */}
                    <span className="relative inline-block w-10 h-6 align-middle select-none">
                      <input
                        type="checkbox"
                        //checked={!!u.twoFactorEnabled}
                        // onChange={async (e) => {
                        //   try {
                        //     const updated = await setUserTwoFactor(u.id, e.target.checked);
                        //     setUsers((users) => users.map((user) => user.id === u.id ? { ...user, twoFactorEnabled: updated.twoFactorEnabled } : user));
                        //   } catch (err) {
                        //     alert("Failed to update 2FA for user.");
                        //   }
                        // }}
                        className="sr-only peer"
                      />
                      <span
                        className="block bg-gray-300 peer-checked:bg-green-500 w-10 h-6 rounded-full transition-colors duration-200"
                      ></span>
                      <span
                        className="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-200 peer-checked:translate-x-4"
                      ></span>
                    </span>
                  </label>
                </div>
              )}
              {u.username !== "admin" && (
                <TiDeleteOutline
                  className="text-red-500 text-2xl self-center cursor-pointer transition-transform duration-150 hover:scale-125"
                  onClick={() => handleDeleteUser(u.id)}
                />
              )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

