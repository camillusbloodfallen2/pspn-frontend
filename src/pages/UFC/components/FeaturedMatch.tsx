import { Link } from "react-router-dom";
import { ArrowRightIcon } from "../../../components/ui/Icons";
import type { RoundViewModel } from "../ufcPage";
import FighterCard from "./FighterCard";
import StatusBadge from "./StatusBadge";

interface FeaturedMatchProps {
  match: RoundViewModel | null;
}

const FeaturedMatch: React.FC<FeaturedMatchProps> = ({ match }) => (
  <section id="featured-match" className="space-y-4">
    <div>
      <h2 className="ufc-title font-display text-3xl font-semibold tracking-[-0.03em]">
        Featured match
      </h2>
      <p className="ufc-copy mt-2 max-w-4xl text-base">
        Tonight&apos;s cleanest market read. One fight gets a larger canvas so the reward pool, momentum, and fighter split are readable in seconds.
      </p>
    </div>

    {match ? (
      <div className="ufc-shell overflow-hidden rounded-[1.75rem] border shadow-[0_24px_70px_rgba(2,6,23,0.22)]">
        <div className="flex flex-col gap-6 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge tone={match.statusTone} label={match.statusLabel} />
                <span className="app-premium-pill inline-flex rounded-md px-3 py-1 text-[0.72rem] font-semibold">
                  Fight focus
                </span>
              </div>

              <h3 className="ufc-title mt-5 font-display text-3xl font-semibold tracking-[-0.03em] sm:text-[2.2rem]">
                {match.outcomeTitle}
              </h3>
              <p className="ufc-copy mt-2 max-w-2xl text-base">
                {match.outcomeDetail}
              </p>
              <p className="ufc-label mt-3 text-sm">{match.rewardHint}</p>
            </div>

            <div className="text-left lg:text-right">
              <p className="ufc-label text-[0.68rem] font-semibold uppercase tracking-[0.2em]">
                Reward pool
              </p>
              <p className="ufc-accent mt-2 font-mono text-3xl font-semibold">
                {match.rewardPoolDisplay}
              </p>
            </div>
          </div>
        </div>

        <div className="ufc-divider grid divide-y border-t lg:grid-cols-2 lg:divide-x lg:divide-y-0">
          {match.fighters.map((fighter) => (
            <FighterCard
              key={fighter.key}
              name={fighter.name}
              record={fighter.record}
              imageUrl={fighter.imageSrc}
              initials={fighter.initials}
              multiplier={fighter.odds}
              backedPool={fighter.poolDisplay}
              marketShare={fighter.shareLabel}
              marketShareValue={fighter.shareValue}
              isWinner={fighter.isWinner}
              size="featured"
            />
        ))}
      </div>

        <div className="ufc-divider flex flex-col gap-3 border-t px-5 py-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            <span className="ufc-title font-semibold">{match.fightLabel}</span>
            <span className="ufc-accent ml-3 font-mono">
              Best live edge {match.bestOddsDisplay}
            </span>
          </div>

          <Link
            to={`/ufc/${match.id}`}
            className="app-primary-btn inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--app-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--app-bg)] sm:w-auto"
          >
            Open featured market
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    ) : (
      <div className="ufc-shell ufc-copy rounded-[1.75rem] border border-dashed px-5 py-10 text-center">
        Launch the next reward window to push a featured fight into this spotlight.
      </div>
    )}
  </section>
);

export default FeaturedMatch;
