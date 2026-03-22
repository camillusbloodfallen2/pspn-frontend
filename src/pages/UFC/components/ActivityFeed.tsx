import clsx from "clsx";
import { formatActivityTime } from "../ufcPage";
import type { ActivityItem } from "../ufcPage";

interface ActivityFeedProps {
  items: ActivityItem[];
  currentTimestamp: number;
}

const toneClasses = {
  reward: "bg-[color:var(--app-gold)]",
  entry: "bg-[color:var(--app-accent)]",
  schedule: "bg-[color:var(--app-danger)]",
} as const;

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  items,
  currentTimestamp,
}) => (
  <section className="ufc-shell rounded-[1.85rem] border p-5 shadow-[0_20px_50px_rgba(2,6,23,0.2)] sm:p-6">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="app-live text-[0.68rem] font-semibold uppercase tracking-[0.28em]">
          Activity feed
        </p>
        <h2 className="ufc-title mt-3 font-display text-2xl font-semibold">
          Recent reward motion
        </h2>
        <p className="ufc-copy mt-3 text-sm leading-7">
          Settlements, fresh entries, and upcoming reward windows in one stream.
        </p>
      </div>
      <div className="app-live-pill rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em]">
        Live feed
      </div>
    </div>

    {items.length === 0 ? (
      <div className="ufc-card-soft ufc-copy mt-6 rounded-[1.5rem] border border-dashed px-4 py-6 text-sm leading-7">
        The next market action will appear here as soon as wallets start entering the card.
      </div>
    ) : (
      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="ufc-card-soft flex flex-col gap-3 rounded-[1.5rem] border px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="flex min-w-0 gap-4">
              <span
                className={clsx(
                  "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
                  toneClasses[item.tone]
                )}
              />

              <div className="min-w-0">
                <p className="ufc-title text-sm font-semibold sm:text-base">
                  {item.title}
                </p>
                <p className="ufc-copy mt-1 text-sm leading-6">
                  {item.detail}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 sm:block sm:shrink-0 sm:text-right">
              <p className="ufc-label text-[0.65rem] font-semibold uppercase tracking-[0.2em]">
                {item.badge}
              </p>
              <p className="ufc-copy mt-1 text-sm">
                {formatActivityTime(item.timestamp, currentTimestamp)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    )}
  </section>
);

export default ActivityFeed;
