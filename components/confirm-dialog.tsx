export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirmar",
  onConfirm,
  disabled = false
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm?: () => void | Promise<void>;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-[hsl(var(--border))] bg-white p-5 dark:bg-slate-950">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
      <div className="mt-4 flex gap-2">
        <button
          className="rounded-2xl bg-sky-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => void onConfirm?.()}
          disabled={disabled}
          type="button"
        >
          {confirmLabel}
        </button>
        <button className="rounded-2xl border px-4 py-2" type="button">
          Cancelar
        </button>
      </div>
    </div>
  );
}

