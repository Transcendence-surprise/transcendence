import type { ServiceHealth } from "../../api/health";

interface AdminServicesSectionProps {
  services: ServiceHealth[];
}

function getStatusColor(status: string) {
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
}

function getStatusIcon(status: string) {
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
}

export default function AdminServicesSection({
  services,
}: AdminServicesSectionProps) {
  return (
    <section className="rounded-xl border border-[var(--color-border-subtle)] bg-bg-modal p-6">
      <h2 className="mb-4 text-xl font-bold text-cyan-bright">
        Microservices Status
      </h2>
      <div className="space-y-3">
        {services.length === 0 ? (
          <p className="text-gray-400">Loading services...</p>
        ) : (
          services.map((service) => (
            <div
              key={service.endpoint}
              className="flex items-center justify-between rounded-lg border border-[var(--color-border-subtle)] bg-bg-dark/50 p-4 transition-colors hover:bg-bg-dark/80"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-white">{service.name}</h3>
                <p className="mt-1 text-xs text-gray-500">{service.endpoint}</p>
                {service.error && (
                  <p className="mt-1 text-xs text-red-400">
                    Error: {service.error}
                  </p>
                )}
              </div>
              <div
                className={`flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-semibold ${getStatusColor(service.status)}`}
              >
                <span>{getStatusIcon(service.status)}</span>
                <span className="capitalize">{service.status}</span>
              </div>
            </div>
          ))
        )}
      </div>
      {services.length > 0 && (
        <p className="mt-4 text-xs text-gray-500">
          Last updated: {services[0]?.lastCheck?.toLocaleTimeString() ?? "Never"}
        </p>
      )}
    </section>
  );
}
