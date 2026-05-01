import { useEffect, useRef, useState } from "react";

type SelectOption<T extends string | number> = {
  label: string;
  value: T;
};

type CustomSelectProps<T extends string | number> = {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  className?: string;
};

export default function CustomSelect<T extends string | number>({
  value,
  options,
  onChange,
  className = "",
}: CustomSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  return (
    <div ref={rootRef} className={`relative ${className}`.trim()}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-base text-white transition-colors focus:outline-none ${
          open
            ? "border-cyan-300 bg-bg-dark shadow-[0_0_0_1px_rgba(103,232,249,0.35)]"
            : "border-[var(--color-border-subtle)] bg-bg-dark hover:border-cyan-300/50"
        }`}
      >
        <span>{selectedOption?.label ?? value}</span>
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-lightest-cyan/80 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M5 7.5 10 12.5 15 7.5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 min-w-full overflow-hidden rounded-xl border border-cyan-400/20 bg-bg-dark-secondary shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur">
          <ul role="listbox" className="py-2">
            {options.map((option) => {
              const active = option.value === value;

              return (
                <li key={String(option.value)}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors ${
                      active
                        ? "bg-cyan-400/10 text-cyan-100"
                        : "text-white hover:bg-white/5 hover:text-cyan-100"
                    }`}
                  >
                    <span>{option.label}</span>
                    {active ? <span className="text-cyan-bright">✓</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
