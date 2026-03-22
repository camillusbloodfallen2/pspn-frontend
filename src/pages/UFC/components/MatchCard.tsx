import { useCallback } from "react";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "../../../components/ui/Icons";
import type { RoundViewModel } from "../ufcPage";
import FighterCard from "./FighterCard";
import StatusBadge from "./StatusBadge";

interface MatchCardProps {
  match: RoundViewModel;
  isAdmin: boolean;
  onFinish: (roundId: number) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, isAdmin, onFinish }) => {
  const handleFinishClick = useCallback(() => {
    onFinish(match.id);
  }, [match.id, onFinish]);

  return (
    <article
      className={clsx(
        "ufc-shell overflow-hidden rounded-[1.6rem] border shadow-[0_22px_60px_rgba(2,6,23,0.2)]"
      )}
    >
      <div className="flex flex-col gap-6 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge tone={match.statusTone} label={match.statusLabel} />
              <span className="ufc-label text-sm">{match.weightClass}</span>
            </div>

            <p className="ufc-label mt-5 text-[0.7rem] font-semibold uppercase tracking-[0.18em]">
              {match.eventLabel}
            </p>
            <h3 className="ufc-title mt-2 font-display text-2xl font-semibold tracking-[-0.03em] sm:text-[2rem]">
              {match.outcomeTitle}
            </h3>
            <p className="ufc-copy mt-2 max-w-2xl text-base">
              {match.outcomeDetail}
            </p>
          </div>

          <div className="text-left lg:text-right">
            <p className="ufc-label text-[0.68rem] font-semibold uppercase tracking-[0.2em]">
              Reward pool
            </p>
            <p className="ufc-accent mt-2 font-mono text-2xl font-semibold sm:text-3xl">
              {match.rewardPoolDisplay}
            </p>
            <p className="ufc-label mt-2 text-sm">{match.rewardHint}</p>
          </div>
        </div>
      </div>

      <div className="ufc-divider grid gap-5 border-t px-5 py-5 sm:px-6 lg:grid-cols-3">
        <div>
          <p className="ufc-label text-[0.72rem] font-semibold uppercase tracking-[0.16em]">
            Match details
          </p>
          <p className="ufc-label mt-4 text-sm">Fight</p>
          <p className="ufc-title mt-1 text-lg font-semibold">{match.fightLabel}</p>
        </div>

        <div>
          <p className="ufc-label mt-[1.65rem] text-sm lg:mt-8">Schedule</p>
          <p className="ufc-copy mt-1 text-base">{match.scheduleLabel}</p>
        </div>

        <div>
          <p className="ufc-label mt-[1.65rem] text-sm lg:mt-8">Participants</p>
          <p className="ufc-copy mt-1 text-base">{match.participantsLabel}</p>
        </div>
      </div>

      <div className="ufc-divider grid divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0">
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

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            to={`/ufc/${match.id}`}
            className="app-primary-btn inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--app-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--app-bg)] sm:w-auto"
          >
            {match.ctaLabel}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>

          {isAdmin && match.isSettling ? (
            <button
              type="button"
              onClick={handleFinishClick}
              className="app-secondary-btn ufc-title inline-flex w-full min-h-[48px] items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--app-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--app-bg)] sm:w-auto"
            >
              Settle result
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default MatchCard;
