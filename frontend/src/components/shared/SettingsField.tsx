import type { ReactNode } from "react";

type SettingsFieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

export default function SettingsField({
  label,
  hint,
  children,
}: SettingsFieldProps) {
  return (
    <label className="grid gap-3 rounded-xl border border-neutral-500/20 bg-black/20 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-bright">
          {label}
        </p>
        {hint ? (
          <p className="mt-1 text-sm leading-6 text-lightest-cyan/75">{hint}</p>
        ) : null}
      </div>
      {children}
    </label>
  );
}
