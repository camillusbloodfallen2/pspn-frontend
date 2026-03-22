import clsx from "clsx";
import type { StatusTone } from "../ufcPage";

interface StatusBadgeProps {
  tone: StatusTone;
  label: string;
}

const toneClasses: Record<StatusTone, string> = {
  live: "app-live-pill",
  settling: "app-premium-pill",
  completed: "ufc-card-soft [color:var(--ufc-title)]",
  upcoming: "app-accent-pill",
  cancelled: "border-rose-300/18 bg-rose-300/[0.1] [color:var(--ufc-title)]",
};

const dotClasses: Record<StatusTone, string> = {
  live: "bg-[color:var(--app-danger)] motion-safe:animate-pulse",
  settling: "bg-[color:var(--app-gold)]",
  completed: "bg-slate-200",
  upcoming: "bg-[color:var(--app-accent)]",
  cancelled: "bg-rose-200",
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ tone, label }) => (
  <span
    className={clsx(
      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.26em]",
      toneClasses[tone]
    )}
  >
    <span className={clsx("h-2 w-2 rounded-full", dotClasses[tone])} />
    {label}
  </span>
);

export default StatusBadge;
