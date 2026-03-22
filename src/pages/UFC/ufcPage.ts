import { UFCMatches } from "../../constants/ufc";
import { UFCBetResult, UFCRoundStatus } from "../../enums/UFCBet";
import type { UFCGameType } from "../../interfaces/UFC";
import type { UFCBet, UFCRound } from "../../interfaces/UFCBetType";
import {
  formatNumber,
  formatNumberWithCommas,
  getLocalTimeFromTimestamp,
  getShortAddress,
  remainTime,
} from "../../utils";
import { getOdds } from "../../utils/ufcBet";

const MATCHES_BY_ID = new Map<number, UFCGameType>(
  UFCMatches.map((match) => [match.id, match])
);

export type MatchSectionKey = "live" | "completed" | "upcoming";
export type StatusTone =
  | "live"
  | "settling"
  | "completed"
  | "upcoming"
  | "cancelled";
export type ActivityTone = "reward" | "entry" | "schedule";

interface MatchMeta {
  weightClass: string;
  eventLabel: string;
  player1Record: string;
  player2Record: string;
  player1ImageSrc: string | null;
  player2ImageSrc: string | null;
}

export interface FighterViewModel {
  key: string;
  name: string;
  record: string;
  imageSrc: string | null;
  initials: string;
  odds: string;
  poolDisplay: string;
  shareLabel: string;
  shareValue: number;
  isWinner: boolean;
}

export interface RoundViewModel {
  id: number;
  closeAt: number;
  sectionKey: MatchSectionKey;
  statusTone: StatusTone;
  statusLabel: string;
  fightLabel: string;
  rewardPool: number;
  rewardPoolDisplay: string;
  rewardHint: string;
  outcomeTitle: string;
  outcomeDetail: string;
  ctaLabel: string;
  scheduleLabel: string;
  participants: number;
  participantsLabel: string;
  weightClass: string;
  eventLabel: string;
  isSettling: boolean;
  bestOddsValue: number;
  bestOddsDisplay: string;
  fighters: [FighterViewModel, FighterViewModel];
}

export interface LeaderboardEntry {
  address: string;
  displayAddress: string;
  rewards: number;
  rewardsDisplay: string;
  wins: number;
  stakeDisplay: string;
}

export interface ActivityItem {
  id: string;
  tone: ActivityTone;
  title: string;
  detail: string;
  badge: string;
  timestamp: number;
}

export interface HeroStat {
  label: string;
  value: string;
  helper: string;
}

export interface UFCPageModel {
  featuredRound: RoundViewModel | null;
  heroStats: HeroStat[];
  sections: Record<MatchSectionKey, RoundViewModel[]>;
  leaderboard: LeaderboardEntry[];
  activity: ActivityItem[];
}

const formatCompactUfc = (amount: number): string =>
  `${amount >= 1000 ? formatNumber(amount) : formatNumberWithCommas(amount, 0)} UFC`;

const getParticipantLabel = (count: number): string => {
  if (count === 0) {
    return "No entries yet";
  }

  return `${count} ${count === 1 ? "entry" : "entries"} locked`;
};

const getInitials = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

const resolveMatchMeta = (round: UFCRound): MatchMeta => {
  const match = MATCHES_BY_ID.get(round.roundID);

  return {
    weightClass: match?.weight ?? "Reward market",
    eventLabel: match?.eventType ?? "Featured reward line",
    player1Record: match?.player1.stat ?? "Fresh line",
    player2Record: match?.player2.stat ?? "Fresh line",
    player1ImageSrc: match
      ? `/assets/ufc/${match.matchId}/${match.player1.img}.png`
      : null,
    player2ImageSrc: match
      ? `/assets/ufc/${match.matchId}/${match.player2.img}.png`
      : null,
  };
};

const getStatusTone = (round: UFCRound, currentTimestamp: number): StatusTone => {
  if (round.status === UFCRoundStatus.Finished) {
    return "completed";
  }

  if (
    round.status === UFCRoundStatus.Cancelled ||
    round.status === UFCRoundStatus.Canceling
  ) {
    return "cancelled";
  }

  if (
    round.status === UFCRoundStatus.Finishing ||
    round.status === UFCRoundStatus.Closed ||
    (round.status === UFCRoundStatus.Started && round.closeAt <= currentTimestamp)
  ) {
    return "settling";
  }

  if (round.status === UFCRoundStatus.Started) {
    return "live";
  }

  return "upcoming";
};

const getSectionKey = (tone: StatusTone): MatchSectionKey => {
  if (tone === "completed" || tone === "cancelled") {
    return "completed";
  }

  if (tone === "live" || tone === "settling") {
    return "live";
  }

  return "upcoming";
};

const calculateBestOdds = (round: UFCRound): number => {
  const player1Odds = Number(
    getOdds(round.player1TotalAmount, round.player2TotalAmount)
  );
  const player2Odds = Number(
    getOdds(round.player2TotalAmount, round.player1TotalAmount)
  );

  return Math.max(player1Odds, player2Odds);
};

const calculateShareValue = (sidePool: number, totalPool: number): number => {
  if (totalPool <= 0) {
    return 0;
  }

  return Math.round((sidePool / totalPool) * 100);
};

const calculateShare = (sidePool: number, totalPool: number): string => {
  if (totalPool <= 0) {
    return "Pool opens with the first pick";
  }

  return `${calculateShareValue(sidePool, totalPool)}% of pool`;
};

const getWinnerName = (round: UFCRound): string | null => {
  if (round.result === UFCBetResult.Player1) {
    return round.player1Name;
  }

  if (round.result === UFCBetResult.Player2) {
    return round.player2Name;
  }

  return null;
};

const getFightLeader = (round: UFCRound): string =>
  round.player1TotalAmount >= round.player2TotalAmount
    ? round.player1Name
    : round.player2Name;

const getStatusLabel = (
  tone: StatusTone,
  round: UFCRound,
  currentTimestamp: number
): string => {
  if (tone === "live") {
    return `Live for ${remainTime(round.closeAt - currentTimestamp)}`;
  }

  if (tone === "settling") {
    return "Verdict pending";
  }

  if (tone === "completed") {
    return round.result === UFCBetResult.Draw ? "Fight resolved as draw" : "Fight resolved";
  }

  if (tone === "cancelled") {
    return "Market voided";
  }

  return "Upcoming market";
};

const getOutcomeCopy = (
  round: UFCRound,
  tone: StatusTone,
  rewardPoolDisplay: string,
  bestOddsDisplay: string
): { title: string; detail: string } => {
  const winnerName = getWinnerName(round);
  const leader = getFightLeader(round);

  if (tone === "completed" && winnerName) {
    return {
      title: `${winnerName} sealed the payout`,
      detail: `${rewardPoolDisplay} battled across this market before the finish.`,
    };
  }

  if (tone === "completed") {
    return {
      title: "Draw returned the line",
      detail: "No winner was declared, so the market closed level.",
    };
  }

  if (tone === "cancelled") {
    return {
      title: "This market was voided",
      detail: "Entries stopped here and no reward edge remained live.",
    };
  }

  if (tone === "settling") {
    return {
      title: "Result confirmation is underway",
      detail: "The fight is over and the reward side is being locked before payouts land.",
    };
  }

  if (tone === "live") {
    return {
      title: `${leader} is steering the line`,
      detail: `${bestOddsDisplay} is live on the sharper side while the pool keeps moving.`,
    };
  }

  return {
    title: "Reward window opens soon",
    detail: "Scan the matchup now so you can enter the pool before the line tightens.",
  };
};

const getRewardHint = (
  tone: StatusTone,
  participants: number,
  bestOddsDisplay: string
): string => {
  if (tone === "completed") {
    return `${getParticipantLabel(participants)} across the resolved card`;
  }

  if (tone === "cancelled") {
    return `${getParticipantLabel(participants)} before the void`;
  }

  if (tone === "settling") {
    return `${getParticipantLabel(participants)} waiting on the verdict`;
  }

  if (participants === 0) {
    return "First wallet sets the opening price";
  }

  return `${getParticipantLabel(participants)} • Best edge ${bestOddsDisplay}`;
};

const getScheduleLabel = (tone: StatusTone, closeAt: number): string => {
  const localTime = getLocalTimeFromTimestamp(closeAt);

  if (tone === "completed" || tone === "cancelled") {
    return `Closed ${localTime}`;
  }

  if (tone === "settling") {
    return `Entries locked ${localTime}`;
  }

  return `Closes ${localTime}`;
};

const getCallToActionLabel = (tone: StatusTone): string => {
  if (tone === "live") {
    return "Open live market";
  }

  if (tone === "settling") {
    return "Track payout";
  }

  if (tone === "completed" || tone === "cancelled") {
    return "Review market";
  }

  return "Preview matchup";
};

const createFighterViewModel = (
  key: string,
  name: string,
  record: string,
  imageSrc: string | null,
  sidePool: number,
  otherPool: number,
  totalPool: number,
  isWinner: boolean
): FighterViewModel => ({
  key,
  name,
  record,
  imageSrc,
  initials: getInitials(name),
  odds: `${getOdds(sidePool, otherPool)}x`,
  poolDisplay: `${formatNumberWithCommas(sidePool, 0)} UFC`,
  shareLabel: calculateShare(sidePool, totalPool),
  shareValue: calculateShareValue(sidePool, totalPool),
  isWinner,
});

const createRoundViewModel = (
  round: UFCRound,
  currentTimestamp: number
): RoundViewModel => {
  const meta = resolveMatchMeta(round);
  const statusTone = getStatusTone(round, currentTimestamp);
  const sectionKey = getSectionKey(statusTone);
  const rewardPool = round.player1TotalAmount + round.player2TotalAmount;
  const rewardPoolDisplay = `${formatNumberWithCommas(rewardPool, 0)} UFC`;
  const participants = round.player1Bets.length + round.player2Bets.length;
  const bestOddsValue = calculateBestOdds(round);
  const bestOddsDisplay = `${bestOddsValue.toFixed(2)}x`;
  const outcome = getOutcomeCopy(
    round,
    statusTone,
    rewardPoolDisplay,
    bestOddsDisplay
  );

  return {
    id: round.roundID,
    closeAt: round.closeAt,
    sectionKey,
    statusTone,
    statusLabel: getStatusLabel(statusTone, round, currentTimestamp),
    fightLabel: `${round.player1Name} vs ${round.player2Name}`,
    rewardPool,
    rewardPoolDisplay,
    rewardHint: getRewardHint(statusTone, participants, bestOddsDisplay),
    outcomeTitle: outcome.title,
    outcomeDetail: outcome.detail,
    ctaLabel: getCallToActionLabel(statusTone),
    scheduleLabel: getScheduleLabel(statusTone, round.closeAt),
    participants,
    participantsLabel: getParticipantLabel(participants),
    weightClass: meta.weightClass,
    eventLabel: meta.eventLabel,
    isSettling: statusTone === "settling",
    bestOddsValue,
    bestOddsDisplay,
    fighters: [
      createFighterViewModel(
        `${round.roundID}-player-1`,
        round.player1Name,
        meta.player1Record,
        meta.player1ImageSrc,
        round.player1TotalAmount,
        round.player2TotalAmount,
        rewardPool,
        round.result === UFCBetResult.Player1 && statusTone === "completed"
      ),
      createFighterViewModel(
        `${round.roundID}-player-2`,
        round.player2Name,
        meta.player2Record,
        meta.player2ImageSrc,
        round.player2TotalAmount,
        round.player1TotalAmount,
        rewardPool,
        round.result === UFCBetResult.Player2 && statusTone === "completed"
      ),
    ],
  };
};

const compareRoundPriority = (
  first: RoundViewModel,
  second: RoundViewModel
): number => {
  if (first.sectionKey === "live" && second.sectionKey === "live") {
    if (first.statusTone !== second.statusTone) {
      return first.statusTone === "live" ? -1 : 1;
    }

    if (first.rewardPool !== second.rewardPool) {
      return second.rewardPool - first.rewardPool;
    }

    return first.closeAt - second.closeAt;
  }

  if (first.sectionKey === "completed" && second.sectionKey === "completed") {
    if (first.closeAt !== second.closeAt) {
      return second.closeAt - first.closeAt;
    }

    return second.id - first.id;
  }

  if (first.sectionKey === "upcoming" && second.sectionKey === "upcoming") {
    if (first.closeAt !== second.closeAt) {
      return first.closeAt - second.closeAt;
    }

    return first.id - second.id;
  }

  return 0;
};

const calculateRewardGain = (
  betAmount: number,
  winnerPool: number,
  totalPool: number
): number => {
  if (winnerPool <= 0 || totalPool <= winnerPool) {
    return 0;
  }

  return (betAmount / winnerPool) * (totalPool - winnerPool);
};

const buildLeaderboard = (rounds: UFCRound[]): LeaderboardEntry[] => {
  const totals = new Map<
    string,
    { rewards: number; wins: number; stake: number }
  >();

  rounds.forEach((round) => {
    const winnerName = getWinnerName(round);

    if (!winnerName || round.status !== UFCRoundStatus.Finished) {
      return;
    }

    const winnerPool =
      round.result === UFCBetResult.Player1
        ? round.player1TotalAmount
        : round.player2TotalAmount;
    const totalPool = round.player1TotalAmount + round.player2TotalAmount;
    const winningBets =
      round.result === UFCBetResult.Player1 ? round.player1Bets : round.player2Bets;

    winningBets.forEach((bet) => {
      const aggregate = totals.get(bet.player) ?? {
        rewards: 0,
        wins: 0,
        stake: 0,
      };

      aggregate.rewards += calculateRewardGain(bet.amount, winnerPool, totalPool);
      aggregate.wins += 1;
      aggregate.stake += bet.amount;

      totals.set(bet.player, aggregate);
    });
  });

  return Array.from(totals.entries())
    .map(([address, total]) => ({
      address,
      displayAddress: getShortAddress(address),
      rewards: total.rewards,
      rewardsDisplay: `+${formatNumberWithCommas(total.rewards, 0)} UFC`,
      wins: total.wins,
      stakeDisplay: `${formatNumberWithCommas(total.stake, 0)} UFC staked`,
    }))
    .sort((first, second) => second.rewards - first.rewards)
    .slice(0, 5);
};

const createRewardActivity = (round: UFCRound, winnerBets: UFCBet[]): ActivityItem[] => {
  const winnerName = getWinnerName(round);

  if (!winnerName) {
    return [];
  }

  const winnerPool =
    round.result === UFCBetResult.Player1
      ? round.player1TotalAmount
      : round.player2TotalAmount;
  const totalPool = round.player1TotalAmount + round.player2TotalAmount;

  return winnerBets.map((bet) => ({
    id: `reward-${round.roundID}-${bet.entryId}`,
    tone: "reward",
    title: `${getShortAddress(bet.player)} unlocked ${formatNumberWithCommas(
      calculateRewardGain(bet.amount, winnerPool, totalPool),
      0
    )} UFC`,
    detail: `${winnerName} payout from ${round.player1Name} vs ${round.player2Name}`,
    badge: "Reward paid",
    timestamp: bet.timestamp || round.closeAt,
  }));
};

const createEntryActivity = (
  round: UFCRound,
  bets: UFCBet[],
  fighterName: string
): ActivityItem[] =>
  bets.map((bet) => ({
    id: `entry-${round.roundID}-${bet.entryId}`,
    tone: "entry",
    title: `${getShortAddress(bet.player)} backed ${fighterName}`,
    detail: `${formatNumberWithCommas(bet.amount, 0)} UFC entered on ${
      round.player1Name
    } vs ${round.player2Name}`,
    badge: "Stake locked",
    timestamp: bet.timestamp,
  }));

const buildActivity = (rounds: UFCRound[]): ActivityItem[] => {
  const rewards: ActivityItem[] = [];
  const entries: ActivityItem[] = [];
  const schedule: ActivityItem[] = [];

  rounds.forEach((round) => {
    if (round.status === UFCRoundStatus.Finished) {
      const winnerBets =
        round.result === UFCBetResult.Player1
          ? round.player1Bets
          : round.result === UFCBetResult.Player2
          ? round.player2Bets
          : [];

      rewards.push(...createRewardActivity(round, winnerBets));
    }

    entries.push(...createEntryActivity(round, round.player1Bets, round.player1Name));
    entries.push(...createEntryActivity(round, round.player2Bets, round.player2Name));

    if (round.status === UFCRoundStatus.Waiting) {
      schedule.push({
        id: `schedule-${round.roundID}`,
        tone: "schedule",
        title: `${round.player1Name} vs ${round.player2Name}`,
        detail: `Reward window is queued for ${getLocalTimeFromTimestamp(
          round.closeAt
        )}`,
        badge: "Upcoming",
        timestamp: round.closeAt,
      });
    }
  });

  return [...rewards.slice(0, 10), ...entries.slice(0, 10), ...schedule.slice(0, 6)]
    .sort((first, second) => second.timestamp - first.timestamp)
    .slice(0, 6);
};

const buildHeroStats = (
  viewModels: RoundViewModel[],
  leaderboard: LeaderboardEntry[]
): HeroStat[] => {
  const totalPool = viewModels.reduce((sum, round) => sum + round.rewardPool, 0);
  const liveCount = viewModels.filter((round) => round.sectionKey === "live").length;
  const settlingCount = viewModels.filter(
    (round) => round.statusTone === "settling"
  ).length;
  const totalEntries = viewModels.reduce(
    (sum, round) => sum + round.participants,
    0
  );
  const rewardsPaid = leaderboard.reduce((sum, entry) => sum + entry.rewards, 0);
  const highestPool = viewModels.reduce(
    (best, round) => (round.rewardPool > best ? round.rewardPool : best),
    0
  );

  return [
    {
      label: "Total rewards distributed",
      value: formatCompactUfc(rewardsPaid),
      helper:
        rewardsPaid > 0
          ? "Settled fights have already released rewards"
          : "Rewards will land as soon as the first fight resolves",
    },
    {
      label: "Active fights",
      value: `${liveCount}`,
      helper:
        settlingCount > 0
          ? `${settlingCount} fight${settlingCount === 1 ? "" : "s"} settling now`
          : "Every open market is ready for entries",
    },
    {
      label: "Highest pool today",
      value: formatCompactUfc(highestPool),
      helper:
        highestPool > 0
          ? "The biggest fight on the board right now"
          : "The board is waiting for its first entry",
    },
    {
      label: "Entries locked",
      value: `${totalEntries}`,
      helper:
        totalPool > 0
          ? `${formatCompactUfc(totalPool)} pooled across the card`
          : "Lines open with the first pick",
    },
  ];
};

const getFeaturedRound = (sections: Record<MatchSectionKey, RoundViewModel[]>) =>
  sections.live.find((round) => round.statusTone === "live") ??
  sections.live[0] ??
  sections.upcoming[0] ??
  sections.completed[0] ??
  null;

export const buildUFCPageModel = (
  rounds: UFCRound[],
  currentTimestamp: number
): UFCPageModel => {
  const viewModels = rounds.map((round) =>
    createRoundViewModel(round, currentTimestamp)
  );
  const sections: Record<MatchSectionKey, RoundViewModel[]> = {
    live: viewModels
      .filter((round) => round.sectionKey === "live")
      .sort(compareRoundPriority),
    completed: viewModels
      .filter((round) => round.sectionKey === "completed")
      .sort(compareRoundPriority),
    upcoming: viewModels
      .filter((round) => round.sectionKey === "upcoming")
      .sort(compareRoundPriority),
  };
  const leaderboard = buildLeaderboard(rounds);

  return {
    featuredRound: getFeaturedRound(sections),
    heroStats: buildHeroStats(viewModels, leaderboard),
    sections,
    leaderboard,
    activity: buildActivity(rounds),
  };
};

export const formatActivityTime = (
  timestamp: number,
  currentTimestamp: number
): string => {
  const difference = timestamp - currentTimestamp;
  const absoluteDifference = Math.abs(difference);

  if (absoluteDifference < 60) {
    return difference >= 0 ? "in under a minute" : "just now";
  }

  if (absoluteDifference < 3600) {
    const minutes = Math.round(absoluteDifference / 60);
    return difference >= 0 ? `in ${minutes}m` : `${minutes}m ago`;
  }

  if (absoluteDifference < 86400) {
    const hours = Math.round(absoluteDifference / 3600);
    return difference >= 0 ? `in ${hours}h` : `${hours}h ago`;
  }

  const days = Math.round(absoluteDifference / 86400);
  return difference >= 0 ? `in ${days}d` : `${days}d ago`;
};
