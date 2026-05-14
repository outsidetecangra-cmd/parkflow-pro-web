import { StatusTone } from "@/lib/types";
import { cn } from "@/lib/utils";

const tones: Record<StatusTone, string> = {
  success: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  danger: "bg-rose-500/12 text-rose-700 dark:text-rose-300",
  info: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  neutral: "bg-slate-500/12 text-slate-700 dark:text-slate-300"
};

export function StatusBadge({
  label,
  tone = "neutral"
}: {
  label: string;
  tone?: StatusTone;
}) {
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", tones[tone])}>
      {label}
    </span>
  );
}

