import {
  ArrowRightIcon,
  BoltIcon,
  ChartIcon,
  ShieldIcon,
} from "../../../components/ui/Icons";
import type { HeroStat } from "../ufcPage";

interface PageHeaderProps {
  stats: HeroStat[];
  isAdmin: boolean;
  onCreateRound: () => void;
}

const iconMap = [ChartIcon, BoltIcon, ShieldIcon, ArrowRightIcon];

const PageHeader: React.FC<PageHeaderProps> = ({
  stats,
  isAdmin,
  onCreateRound,
}) => (
  <section className="space-y-8">
    <div className="max-w-4xl">
      <div className="app-live-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em]">
        <BoltIcon className="h-4 w-4" />
        Live reward system
      </div>

      <h1 className="ufc-title mt-7 font-display text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">
        Start Earning
      </h1>
      <p className="ufc-copy mt-5 max-w-3xl text-lg leading-9">
        UFC markets with cleaner signals and faster reads. Compare fighters at a glance, see where the pool is flowing, and move into the right market without fighting the interface.
      </p>
    </div>

    <div className="grid gap-4 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const StatIcon = iconMap[index] ?? ArrowRightIcon;
        const valueParts = stat.value.split(" ");

        return (
          <article
            key={stat.label}
            className="ufc-card rounded-[1.25rem] border px-4 py-4"
          >
            <div className="ufc-label flex items-center gap-2 text-sm">
              <StatIcon className="h-4 w-4" />
              {stat.label}
            </div>

            <div className="mt-4 flex items-end gap-2">
              <p className="ufc-title font-mono text-4xl font-semibold tracking-[-0.04em]">
                {valueParts[0]}
              </p>
              {valueParts[1] ? (
                <span className="ufc-accent pb-1 font-mono text-2xl font-semibold">
                  {valueParts.slice(1).join(" ")}
                </span>
              ) : null}
            </div>

            <p className="ufc-label mt-2 text-sm">{stat.helper}</p>
          </article>
        );
      })}
    </div>

    {isAdmin ? (
      <div className="flex justify-start">
        <button
          type="button"
          onClick={onCreateRound}
          className="app-primary-btn inline-flex min-h-[48px] items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--app-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--app-bg)]"
        >
          Launch reward window
        </button>
      </div>
    ) : null}
  </section>
);

export default PageHeader;
