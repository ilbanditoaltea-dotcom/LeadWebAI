import { SectionCard } from "@/app/components/ui/section-card";

type MessageComposerProps = {
  recipient: string;
  subject: string;
  value: string;
  onChange: (value: string) => void;
};

export function MessageComposer({ recipient, subject, value, onChange }: MessageComposerProps) {
  return (
    <SectionCard title="Compositor de mensaje" subtitle="Personaliza el outreach para el lead seleccionado">
      <div className="rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-3 text-sm">
        <p className="font-semibold text-[#0f172a]">Para: {recipient}</p>
        <p className="text-[#64748b]">Asunto: {subject}</p>
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={7}
        className="mt-3 w-full rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm leading-relaxed text-[#0f172a]"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-sm">
          Enviar ahora
        </button>
        <button className="rounded-xl border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-[#0f172a]">
          Programar envío
        </button>
      </div>
    </SectionCard>
  );
}
