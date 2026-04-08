// Example Admin Panel Component
import { useAuth } from "../hooks/useAuth";
import type { User } from "../api/users";
import { useEffect, useState } from "react";
import { getAllUsers } from "../api/users";
import { checkAllServicesHealth, type ServiceHealth } from "../api/health";

export default function AdminPanel() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<ServiceHealth[]>([]);

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
                  className="p-3 rounded-lg bg-bg-dark/50 border border-[var(--color-border-subtle)]"
                >
                  <p className="text-white font-semibold">{u.username}</p>
                  <p className="text-sm text-gray-400">{u.email}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
