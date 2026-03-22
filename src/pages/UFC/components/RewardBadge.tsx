import clsx from "clsx";

interface RewardBadgeProps {
  value: string;
  helper: string;
  className?: string;
}

const RewardBadge: React.FC<RewardBadgeProps> = ({
  value,
  helper,
  className,
}) => (
  <div
    className={clsx(
      "min-w-0 rounded-[1.75rem] border border-amber-300/20 bg-[linear-gradient(135deg,rgba(251,191,36,0.14),rgba(15,23,42,0.16))] px-5 py-4 shadow-[0_16px_40px_rgba(251,191,36,0.1)]",
      className
    )}
  >
    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-amber-100/80">
      Reward pool
    </p>
    <div className="mt-3 flex flex-wrap items-end gap-2">
      <span className="font-display text-3xl font-semibold text-white sm:text-4xl">
        {value}
      </span>
    </div>
    <p className="mt-3 text-sm text-amber-50/80">{helper}</p>
  </div>
);

export default RewardBadge;
