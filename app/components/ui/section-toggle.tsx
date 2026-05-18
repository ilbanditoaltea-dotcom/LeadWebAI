type SectionToggleOption = {
  id: string;
  label: string;
};

type SectionToggleProps = {
  value: string;
  options: SectionToggleOption[];
  onChange: (value: string) => void;
};

export function SectionToggle({ value, options, onChange }: SectionToggleProps) {
  return (
    <div className="inline-flex rounded-xl border border-[#e5e7eb] bg-white p-1 shadow-sm shadow-slate-200/40">
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
                : "text-[#64748b] hover:bg-[#f8fafc]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
