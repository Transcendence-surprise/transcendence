type StatCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string | number;
};

export default function StatCard({ icon, title, value }: StatCardProps) {
  return (
    <div className="flex flex-col p-4 bg-bg-modal rounded-lg border border-[var(--color-border-subtle)] hover:border-cyan-200 transition-all">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-gray-400">{title}</span>
      </div>
      <span className="text-xl font-bold text-white">{value}</span>
    </div>
  );
}
