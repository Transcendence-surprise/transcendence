import { Link } from "react-router-dom";

type HomeNavCardProps = {
  icon: string;
  title: string;
  description: string;
  to: string;
};

export default function HomeNavCard({
  icon,
  title,
  description,
  to,
}: HomeNavCardProps) {
  return (
    <Link
      to={to}
      className="group relative rounded-xl border border-[var(--color-border-subtle)] bg-gradient-to-br from-bg-dark-secondary to-bg-dark p-6 overflow-hidden transition-all duration-300 hover:border-cyan-300/60 hover:shadow-cyan-light"
    >
      <div className="relative z-10">
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-lightest-cyan group-hover:text-cyan-200 transition-colors">
          {description}
        </p>

        {/* Arrow indicator */}
        <div className="mt-4 flex items-center text-cyan-400 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all">
          <span className="text-sm font-semibold">Explore</span>
          <span className="ml-2">→</span>
        </div>
      </div>
    </Link>
  );
}
