import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import UFCCreatePopup from "../../components/UFCBet/UFCCreatePopup";
import UFCFinishPopup from "../../components/UFCBet/UFCFinishPopup";
import { UFCRoundStatus } from "../../enums/UFCBet";
import { notify } from "../../helper/notify";
import useWallet from "../../hook/useWallet";
import { AppDispatch, RootState } from "../../redux/store";
import { getIsAdmin, getRounds, setIsAdmin } from "../../redux/ufcSlice";
import ActivityFeed from "./components/ActivityFeed";
import FeaturedMatch from "./components/FeaturedMatch";
import Leaderboard from "./components/Leaderboard";
import MatchCard from "./components/MatchCard";
import PageShell from "./components/PageShell";
import PageHeader from "./components/PageHeader";
import { buildUFCPageModel, MatchSectionKey } from "./ufcPage";

const SECTION_COPY: Record<
  MatchSectionKey,
  {
    eyebrow: string;
    title: string;
    description: string;
    emptyState: string;
    countLabel: (count: number) => string;
    tabLabel: string;
  }
> = {
  live: {
    eyebrow: "Live fights",
    title: "Reward pools moving right now",
    description:
      "Active and settling fights stay in one zone so users can spot the sharpest reward line without scanning noise.",
    emptyState:
      "No live fights are open right now. The next reward window will appear here as soon as a matchup goes live.",
    countLabel: (count: number) => `${count} live or settling`,
    tabLabel: "Live fights",
  },
  completed: {
    eyebrow: "Completed fights",
    title: "Resolved fights with visible outcomes",
    description:
      "Finished matchups keep the competition loop visible by showing which side won and where rewards were released.",
    emptyState:
      "Finished fights will land here with winners and payout context once the first card closes.",
    countLabel: (count: number) => `${count} resolved`,
    tabLabel: "Completed fights",
  },
  upcoming: {
    eyebrow: "Upcoming fights",
    title: "The next reward windows to watch",
    description:
      "Queued fights give users time to scan the board, pick a side, and come back with intent when the market opens.",
    emptyState:
      "There are no queued fights yet. New matchups will appear here before the next reward pool opens.",
    countLabel: (count: number) => `${count} queued`,
    tabLabel: "Upcoming fights",
  },
};

const UFC: React.FC = () => {
  const { account } = useWallet();
  const [currentTimestamp, setCurrentTimestamp] = useState(
    Math.floor(Date.now() / 1000)
  );
  const dispatch: AppDispatch = useDispatch();
  const { isAdmin, ufcRounds } = useSelector((state: RootState) => state.ufc);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openFinishModal, setOpenFinishModal] = useState(false);
  const [targetId, setTargetId] = useState(-1);
  const [activeSection, setActiveSection] = useState<MatchSectionKey>("live");
  const hasInitializedSection = useRef(false);

  const pageModel = useMemo(
    () => buildUFCPageModel(ufcRounds, currentTimestamp),
    [currentTimestamp, ufcRounds]
  );
  const activeMatches = pageModel.sections[activeSection];
  const activeCopy = SECTION_COPY[activeSection];

  const handleOpenFinishModal = useCallback((roundId: number) => {
    setOpenFinishModal(true);
    setTargetId(roundId);
  }, []);

  const handleOpenCreateModal = useCallback(() => {
    const lastRound = ufcRounds[ufcRounds.length - 1];

    if (lastRound && lastRound.status !== UFCRoundStatus.Finished) {
      notify.error("Finish the current round before creating a new one.");
      return;
    }

    setOpenCreateModal(true);
  }, [ufcRounds]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000));
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!account) {
      dispatch(setIsAdmin());
      return;
    }

    dispatch(getIsAdmin({ account }));
  }, [account, dispatch]);

  useEffect(() => {
    dispatch(getRounds());
  }, [dispatch]);

  useEffect(() => {
    if (hasInitializedSection.current) {
      return;
    }

    if (pageModel.sections.live.length > 0) {
      setActiveSection("live");
      hasInitializedSection.current = true;
      return;
    }

    if (pageModel.sections.completed.length > 0) {
      setActiveSection("completed");
      hasInitializedSection.current = true;
      return;
    }

    if (pageModel.sections.upcoming.length > 0) {
      setActiveSection("upcoming");
      hasInitializedSection.current = true;
      return;
    }

    if (ufcRounds.length > 0) {
      hasInitializedSection.current = true;
    }
  }, [
    pageModel.sections.completed.length,
    pageModel.sections.live.length,
    pageModel.sections.upcoming.length,
    ufcRounds.length,
  ]);

  return (
    <PageShell>
      <PageHeader
        stats={pageModel.heroStats}
        isAdmin={isAdmin}
        onCreateRound={handleOpenCreateModal}
      />
      <FeaturedMatch match={pageModel.featuredRound} />

      <section className="space-y-6">
        <div className="flex flex-wrap gap-3">
          {(Object.keys(SECTION_COPY) as MatchSectionKey[]).map((key) => {
            const isActive = key === activeSection;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveSection(key)}
                className={
                  isActive
                    ? "app-accent-pill inline-flex min-h-[48px] items-center rounded-xl px-5 py-3 text-sm font-semibold"
                    : "app-secondary-btn ufc-copy inline-flex min-h-[48px] items-center rounded-xl px-5 py-3 text-sm font-semibold"
                }
              >
                {SECTION_COPY[key].tabLabel}
              </button>
            );
          })}
        </div>

        <div>
          <h2 className="ufc-title font-display text-3xl font-semibold tracking-[-0.03em]">
            {activeCopy.title}
          </h2>
          <p className="ufc-copy mt-2 text-base">{activeCopy.description}</p>
        </div>

        {activeMatches.length === 0 ? (
          <div className="ufc-shell rounded-[1.6rem] border px-6 py-16 text-center">
            <div className="ufc-card-soft ufc-label mx-auto flex h-14 w-14 items-center justify-center rounded-full border">
              <span className="text-xl">◌</span>
            </div>
            <p className="ufc-title mt-6 text-3xl font-semibold tracking-[-0.03em]">
              {activeCopy.countLabel(0)}
            </p>
            <p className="ufc-copy mx-auto mt-3 max-w-2xl text-lg">
              {activeCopy.emptyState}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {activeMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                isAdmin={isAdmin}
                onFinish={handleOpenFinishModal}
              />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-3">
          <h3 className="ufc-title font-display text-2xl font-semibold tracking-[-0.03em]">
            Top earners
          </h3>
          <Leaderboard items={pageModel.leaderboard} />
        </div>
        <div className="space-y-3">
          <h3 className="ufc-title font-display text-2xl font-semibold tracking-[-0.03em]">
            Recent activity
          </h3>
          <ActivityFeed
            items={pageModel.activity}
            currentTimestamp={currentTimestamp}
          />
        </div>
      </div>

      <UFCCreatePopup
        openModal={openCreateModal}
        setOpenModal={setOpenCreateModal}
      />

      <UFCFinishPopup
        openModal={openFinishModal}
        setOpenModal={setOpenFinishModal}
        targetRound={ufcRounds.find((round) => round.roundID === targetId)}
      />
    </PageShell>
  );
};

export default UFC;
