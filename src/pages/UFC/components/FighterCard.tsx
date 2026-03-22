import clsx from "clsx";
import type { FighterViewModel } from "../ufcPage";

interface FighterCardProps {
  name: FighterViewModel["name"];
  record: FighterViewModel["record"];
  imageUrl: FighterViewModel["imageSrc"];
  initials: FighterViewModel["initials"];
  multiplier: FighterViewModel["odds"];
  backedPool: FighterViewModel["poolDisplay"];
  marketShare: FighterViewModel["shareLabel"];
  marketShareValue: FighterViewModel["shareValue"];
  isWinner: FighterViewModel["isWinner"];
  size?: "default" | "featured";
}

const FighterCard: React.FC<FighterCardProps> = ({
  name,
  record,
  imageUrl,
  initials,
  multiplier,
  backedPool,
  marketShare,
  marketShareValue,
  isWinner,
  size = "default",
}) => (
  <article
    className={clsx(
      "ufc-card",
      size === "featured"
        ? "rounded-[1.4rem] border p-4 sm:p-5"
        : "border-t ufc-divider p-4 sm:p-5"
    )}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <div className="ufc-card-soft relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl sm:h-16 sm:w-16">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              width={96}
              height={96}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,rgba(56,189,248,0.92),rgba(34,211,238,0.72))] font-display text-xl font-semibold text-slate-950">
              {initials}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={clsx(
                "ufc-title truncate font-display font-semibold tracking-[-0.03em]",
                size === "featured" ? "text-2xl" : "text-xl"
              )}
            >
              {name}
            </h3>
            {isWinner ? (
              <span className="ufc-chip inline-flex rounded-md px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em]">
                Winner
              </span>
            ) : null}
          </div>
          <p className="ufc-label mt-1 text-sm tracking-[0.14em]">{record}</p>
        </div>
      </div>

      <div className="text-right">
        <p className="ufc-label text-[0.62rem] font-semibold uppercase tracking-[0.22em]">
          Booster
        </p>
        <p className="ufc-accent mt-2 font-mono text-xl font-semibold sm:text-2xl">
          {multiplier}
        </p>
      </div>
    </div>

    <div className="mt-5 grid gap-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-6">
      <p className="ufc-label">Backed pool</p>
      <p className="ufc-title font-mono font-semibold sm:text-right">{backedPool}</p>

      <p className="ufc-label">Market share</p>
      <p className="ufc-copy sm:text-right">{marketShare}</p>
    </div>

    <div className="ufc-bar-track mt-4 h-1.5 rounded-full">
      <div
        className={clsx(
          "h-full rounded-full",
          isWinner ? "bg-[color:var(--ufc-accent)]" : "bg-[color:var(--ufc-label)] opacity-45"
        )}
        style={{ width: `${Math.max(marketShareValue, 4)}%` }}
      />
    </div>
  </article>
);

export default FighterCard;
