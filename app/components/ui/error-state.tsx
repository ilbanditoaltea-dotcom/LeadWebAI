type ErrorStateProps = {
  title?: string;
  description: string;
};

export function ErrorState({
  title = "No se pudo cargar la información",
  description,
}: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
      <p className="text-sm font-semibold text-rose-700">{title}</p>
      <p className="mt-1 text-sm text-rose-600">{description}</p>
    </div>
  );
}
