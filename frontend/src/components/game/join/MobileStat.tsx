const mobileStatClass = "rounded-xl border border-white/8 bg-black/15 p-3";
const mobileStatLabelClass =
  "mb-2 text-[10px] uppercase tracking-[0.16em] text-light-cyan/60";

type MobileStatProps = {
  label: string;
  children: React.ReactNode;
};

export default function MobileStat({ label, children }: MobileStatProps) {
  return (
    <div className={mobileStatClass}>
      <p className={mobileStatLabelClass}>
        {label}
      </p>
      {children}
    </div>
  );
}
