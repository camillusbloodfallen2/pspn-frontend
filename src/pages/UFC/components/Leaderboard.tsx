import clsx from "clsx";
import type { LeaderboardEntry } from "../ufcPage";

interface LeaderboardProps {
  items: LeaderboardEntry[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ items }) => (
  <section
    id="leaderboard"
    className="ufc-shell rounded-[1.85rem] border p-5 shadow-[0_20px_50px_rgba(2,6,23,0.2)] sm:p-6"
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="app-gold text-[0.68rem] font-semibold uppercase tracking-[0.28em]">
          Top earners
        </p>
        <h2 className="ufc-title mt-3 font-display text-2xl font-semibold">
          Wallets collecting the card
        </h2>
        <p className="ufc-copy mt-3 text-sm leading-7">
          Settled fights push winning wallets up this board as soon as rewards are released.
        </p>
      </div>
      <div className="app-premium-pill rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em]">
        {items.length} ranked
      </div>
    </div>

    {items.length === 0 ? (
      <div className="ufc-card-soft ufc-copy mt-6 rounded-[1.5rem] border border-dashed px-4 py-6 text-sm leading-7">
        Once a fight resolves, the sharpest wallets will rise here with their UFC rewards.
      </div>
    ) : (
      <ol className="mt-6 space-y-3">
        {items.map((item, index) => (
          <li
            key={item.address}
            className="ufc-card-soft flex items-center justify-between gap-4 rounded-[1.5rem] border px-4 py-4"
          >
            <div className="flex min-w-0 items-center gap-4">
              <div
                className={clsx(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-sm font-semibold",
                  index === 0
                    ? "app-premium-pill"
                    : index === 1
                    ? "app-accent-pill"
                    : "ufc-card border [color:var(--ufc-title)]"
                )}
              >
                {index + 1}
              </div>

              <div className="min-w-0">
                <p className="ufc-title truncate text-sm font-semibold sm:text-base">
                  {item.displayAddress}
                </p>
                <p className="ufc-label mt-1 text-xs uppercase tracking-[0.18em]">
                  {item.wins} winning {item.wins === 1 ? "ticket" : "tickets"} • {item.stakeDisplay}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="app-gold text-sm font-semibold sm:text-base">
                {item.rewardsDisplay}
              </p>
              <p className="ufc-label mt-1 text-[0.65rem] uppercase tracking-[0.18em]">
                Rewards earned
              </p>
            </div>
          </li>
        ))}
      </ol>
    )}
  </section>
);

export default Leaderboard;
