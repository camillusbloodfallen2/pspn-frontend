import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useWallet from "../../hook/useWallet";
import { notify } from "../../helper/notify";
import { AppDispatch, RootState } from "../../redux/store";
import {
  getTokenBalanceByUser,
  getYieldInfo,
  getYieldRate,
  handleClaimYield,
  initYieldInfo,
  setTokenBalance,
} from "../../redux/userSlice";
import { formatNumberWithCommas } from "../../utils";
import AnimatedNumber from "../../components/ui/AnimatedNumber";
import {
  ArrowRightIcon,
  BoltIcon,
  ChartIcon,
  ShieldIcon,
  SparkIcon,
} from "../../components/ui/Icons";

const HOW_IT_WORKS = [
  "Connect your wallet",
  "Stake PSPN",
  "Earn UFC rewards",
  "Claim anytime",
];

const SAMPLE_ACTIVITY = [
  { wallet: "Player10", action: "won", amount: 150, token: "UFC" },
  { wallet: "Godfather", action: "earned", amount: 300, token: "UFC" },
  { wallet: "NightShift", action: "claimed", amount: 86, token: "PSPN" },
  { wallet: "BullsEye", action: "stacked", amount: 480, token: "PSPN" },
];

const PREVIEW_MODE = {
  apr: 12.4,
  daily: 2.3,
  monthly: 69,
  pending: 7.8,
  totalEarned: 2487,
  pspnBalance: 1250,
  ufcBalance: 640,
};

const HERO_STATS = [
  {
    label: "Projected APR",
    helper: "Protocol pace translated into a simple earnings story.",
  },
  {
    label: "Daily output",
    helper: "Updated live when your position is active.",
  },
  {
    label: "Monthly pace",
    helper: "A higher-level view of your reward momentum.",
  },
  {
    label: "Total earned",
    helper: "All historical rewards pulled into one visible number.",
  },
];

const TOKEN_CARDS = [
  {
    label: "PSPN",
    title: "Stake power",
    copy: "Used to open positions, activate the protocol and generate live reward flow.",
    accent: "from-[rgba(244,197,107,0.18)] via-[rgba(121,78,255,0.1)] to-transparent",
    icon: "/assets/tokens/pspn.png",
  },
  {
    label: "UFC",
    title: "Reward output",
    copy: "Accrues while your PSPN position keeps working and becomes the visible proof of value.",
    accent: "from-[rgba(0,255,133,0.16)] via-[rgba(0,255,133,0.06)] to-transparent",
    icon: "/assets/tokens/ufc.png",
  },
];

const formatAmount = (value: number, decimals = 1) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  return formatNumberWithCommas(Number(safeValue.toFixed(decimals)), decimals);
};

const Dashboard: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { account, connectWallet } = useWallet();
  const [expectedYieldAmount, setExpectedYieldAmount] = useState(0);

  const { myTokenBalance, myUFCTokenBalance, yieldInfo, dailyYieldRate } =
    useSelector((state: RootState) => state.user);

  const hasWallet = Boolean(account);
  const hasLivePosition =
    hasWallet && (myTokenBalance > 0 || myUFCTokenBalance > 0);

  const protocolApr =
    hasLivePosition && dailyYieldRate > 0
      ? Number((dailyYieldRate / 100).toFixed(1))
      : PREVIEW_MODE.apr;

  const dailyReturn =
    hasLivePosition && dailyYieldRate > 0
      ? (myUFCTokenBalance * dailyYieldRate) / 10000
      : PREVIEW_MODE.daily;

  const monthlyReturn = hasLivePosition
    ? Number((dailyReturn * 30).toFixed(1))
    : PREVIEW_MODE.monthly;

  const pendingClaim = hasLivePosition
    ? Math.max(expectedYieldAmount, 0)
    : PREVIEW_MODE.pending;

  const totalEarned = hasLivePosition
    ? yieldInfo.totalClaimed
    : PREVIEW_MODE.totalEarned;

  const displayedPspn = hasLivePosition
    ? myTokenBalance
    : PREVIEW_MODE.pspnBalance;

  const displayedUfc = hasLivePosition
    ? myUFCTokenBalance
    : PREVIEW_MODE.ufcBalance;

  const stateSummary = !hasWallet
    ? "Preview mode is active. Projected returns stay visible before connection so the product still communicates value."
    : hasLivePosition
    ? "Live mode is active. Balances, pending rewards and claim status are updating in real time."
    : "Wallet connected. Stake PSPN to switch from preview to live UFC rewards.";

  const primaryActionLabel = !hasWallet
    ? "Start Earning Now"
    : hasLivePosition
    ? "Claim Live Rewards"
    : "Stake PSPN Now";

  const handleClaimYields = () => {
    if (!account) {
      connectWallet();
      return;
    }

    dispatch(handleClaimYield({ account }))
      .unwrap()
      .then(() => {
        dispatch(getTokenBalanceByUser({ account }));
        dispatch(getYieldInfo({ account }));
        notify.success("Rewards claimed.", "Your live balances were refreshed.");
      })
      .catch(() => {
        notify.error("Claim failed.", "Please try again in a few seconds.");
      });
  };

  const handlePrimaryAction = () => {
    if (!hasWallet) {
      connectWallet();
      return;
    }

    if (!hasLivePosition) {
      navigate("/swap");
      return;
    }

    handleClaimYields();
  };

  const handleSecondaryAction = () => {
    const target = document.getElementById("proof-block");

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    navigate("/swap");
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      const timeElapsed =
        new Date().getTime() / 1000 - yieldInfo.lastClaimTimestamp;

      const pendingYield =
        yieldInfo.lastClaimTimestamp === 0
          ? 0
          : (myUFCTokenBalance * dailyYieldRate * timeElapsed) /
            (3600 * 24) /
            10000;

      setExpectedYieldAmount(pendingYield + yieldInfo.yieldToClaim);
    }, 250);

    return () => {
      window.clearInterval(interval);
    };
  }, [dailyYieldRate, myUFCTokenBalance, yieldInfo]);

  useEffect(() => {
    dispatch(getYieldRate());
  }, [dispatch]);

  useEffect(() => {
    if (account) {
      dispatch(getTokenBalanceByUser({ account }));
      dispatch(getYieldInfo({ account }));
      return;
    }

    dispatch(setTokenBalance(0));
    dispatch(initYieldInfo());
  }, [account, dispatch]);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="app-card-strong relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
          <img
            src="/assets/main/background.png"
            alt=""
            className="landing-hero-image absolute inset-0 h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-[var(--hero-overlay)]" />
          <div className="pointer-events-none absolute right-[-4rem] top-[-3rem] h-40 w-40 rounded-full bg-[rgba(121,78,255,0.2)] blur-3xl" />
          <div className="pointer-events-none absolute bottom-[-4rem] left-[-1rem] h-44 w-44 rounded-full bg-[rgba(0,255,133,0.14)] blur-3xl" />

          <div className="relative z-10 fade-in-up">
            <div className="app-live-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em]">
              <SparkIcon className="h-4 w-4" />
              Yield engine live
            </div>

            <div className="mt-6 max-w-2xl">
              <h1 className="font-display text-4xl font-semibold leading-tight app-text sm:text-5xl lg:text-6xl">
                Turn your tokens into live momentum.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 app-text-muted sm:text-lg">
                A sharper landing experience with real background atmosphere, clearer reward storytelling and a path from visitor to live earnings that feels immediate on every screen.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handlePrimaryAction}
                className="app-primary-btn inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
              >
                {primaryActionLabel}
                <ArrowRightIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleSecondaryAction}
                className="app-secondary-btn inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
              >
                Explore live proof
              </button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="app-panel rounded-[1.5rem] p-4">
                <div className="text-xs uppercase tracking-[0.24em] app-text-subtle">
                  Estimated earnings
                </div>
                <div className="app-accent mt-3 text-2xl font-semibold">
                  <AnimatedNumber
                    value={pendingClaim}
                    format={(value) => `${formatAmount(value)} PSPN`}
                  />
                </div>
                <div className="mt-1 text-sm app-text-muted">
                  A claimable pace that stays visible before and after connection.
                </div>
              </div>

              <div className="app-panel rounded-[1.5rem] p-4">
                <div className="text-xs uppercase tracking-[0.24em] app-text-subtle">
                  Protocol APR
                </div>
                <div className="mt-3 text-2xl font-semibold app-text">
                  <AnimatedNumber
                    value={protocolApr}
                    format={(value) => `${formatAmount(value)}%`}
                  />
                </div>
                <div className="mt-1 text-sm app-text-muted">
                  Simple framing for the reward rate your position can unlock.
                </div>
              </div>

              <div className="app-panel rounded-[1.5rem] p-4">
                <div className="text-xs uppercase tracking-[0.24em] app-text-subtle">
                  Monthly pace
                </div>
                <div className="app-gold mt-3 text-2xl font-semibold">
                  <AnimatedNumber
                    value={monthlyReturn}
                    format={(value) => `${formatAmount(value)} PSPN`}
                  />
                </div>
                <div className="mt-1 text-sm app-text-muted">
                  A larger horizon for understanding reward momentum.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="app-card rounded-[2rem] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] app-text-subtle">
                Earnings preview
              </div>
              <div className="mt-2 font-display text-2xl font-semibold app-text">
                From preview to production.
              </div>
            </div>
            <div
              className={
                hasLivePosition
                  ? "app-live-pill rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]"
                  : "app-premium-pill rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]"
              }
            >
              {hasLivePosition ? "live" : "preview"}
            </div>
          </div>

          <div className="mt-6 app-panel rounded-[1.75rem] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm uppercase tracking-[0.24em] app-text-subtle">
                  Daily flow
                </div>
                <div className="mt-2 text-4xl font-semibold app-text">
                  <AnimatedNumber
                    value={dailyReturn}
                    format={(value) => `${formatAmount(value)} PSPN`}
                  />
                </div>
                <div className="mt-2 text-sm app-text-muted">
                  Estimated output visible every 24 hours.
                </div>
              </div>

              <div className="app-premium-pill rounded-2xl px-4 py-3 text-right">
                <div className="text-xs uppercase tracking-[0.24em]">
                  Mode
                </div>
                <div className="mt-1 text-sm font-semibold">
                  {hasLivePosition
                    ? "Live wallet data"
                    : hasWallet
                    ? "Wallet connected"
                    : "Guided preview"}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="app-panel rounded-[1.25rem] p-4">
                <div className="text-xs uppercase tracking-[0.22em] app-text-subtle">
                  PSPN staked
                </div>
                <div className="mt-2 text-2xl font-semibold app-text">
                  {formatAmount(displayedPspn, 0)} PSPN
                </div>
              </div>
              <div className="app-panel rounded-[1.25rem] p-4">
                <div className="text-xs uppercase tracking-[0.22em] app-text-subtle">
                  UFC rewards
                </div>
                <div className="app-accent mt-2 text-2xl font-semibold">
                  {formatAmount(displayedUfc, 0)} UFC
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 app-panel rounded-[1.75rem] p-5">
            <div className="text-xs uppercase tracking-[0.24em] app-text-subtle">
              State summary
            </div>
            <div className="mt-3 text-base leading-8 app-text-muted">
              {stateSummary}
            </div>
          </div>
        </div>
      </section>

      <section id="proof-block" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            ...HERO_STATS[0],
            value: `${formatAmount(protocolApr)}%`,
            accent: "app-gold",
            icon: <ChartIcon className="app-gold h-5 w-5" />,
          },
          {
            ...HERO_STATS[1],
            value: `+${formatAmount(dailyReturn)} PSPN`,
            accent: "app-accent",
            icon: <BoltIcon className="app-accent h-5 w-5" />,
          },
          {
            ...HERO_STATS[2],
            value: `+${formatAmount(monthlyReturn)} PSPN`,
            accent: "app-live",
            icon: <SparkIcon className="app-live h-5 w-5" />,
          },
          {
            ...HERO_STATS[3],
            value: `${formatAmount(totalEarned, 0)} PSPN`,
            accent: "app-text",
            icon: <ShieldIcon className="app-text h-5 w-5" />,
          },
        ].map((stat) => (
          <article key={stat.label} className="app-card rounded-[1.75rem] p-5">
            <div className="flex items-center gap-3">
              {stat.icon}
              <div className="text-xs uppercase tracking-[0.24em] app-text-subtle">
                {stat.label}
              </div>
            </div>
            <div className={`mt-4 text-3xl font-semibold ${stat.accent}`}>
              {stat.value}
            </div>
            <div className="mt-2 text-sm app-text-muted">{stat.helper}</div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
        <div className="app-card rounded-[2rem] p-6">
          <div className="text-xs uppercase tracking-[0.24em] app-text-subtle">
            How it works
          </div>
          <div className="mt-3 font-display text-3xl font-semibold app-text">
            A clearer flow from curiosity to claim.
          </div>

          <div className="mt-6 space-y-4">
            {HOW_IT_WORKS.map((step, index) => (
              <div
                key={step}
                className="app-panel flex items-center gap-4 rounded-[1.5rem] p-4"
              >
                <div className="app-accent-pill flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold">
                  {index + 1}
                </div>
                <div>
                  <div className="text-sm font-semibold app-text">{step}</div>
                  <div className="mt-1 text-sm app-text-muted">
                    {index === 0 &&
                      "Start with a connected wallet and reveal the protocol state."}
                    {index === 1 &&
                      "Activate PSPN staking and move beyond preview numbers."}
                    {index === 2 &&
                      "Watch UFC rewards accumulate as live proof of value."}
                    {index === 3 &&
                      "Claim whenever the timing fits your strategy."}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="app-card rounded-[2rem] p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] app-text-subtle">
                Live activity
              </div>
              <div className="mt-2 font-display text-3xl font-semibold app-text">
                Proof that the product is moving.
              </div>
            </div>
            <button
              type="button"
              onClick={handleSecondaryAction}
              className="app-secondary-btn inline-flex min-h-[48px] items-center justify-center rounded-full px-4 py-2 text-sm font-semibold"
            >
              View details
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {SAMPLE_ACTIVITY.map((item, index) => (
              <div
                key={`${item.wallet}-${index}`}
                className="app-panel flex items-center justify-between gap-4 rounded-[1.5rem] p-4"
              >
                <div>
                  <div className="text-sm font-semibold app-text">
                    {item.wallet} {item.action} {item.amount} {item.token}
                  </div>
                  <div className="mt-1 text-sm app-text-muted">
                    Protocol event streamed into the landing experience.
                  </div>
                </div>
                <div className="app-live-pill rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                  live
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.92fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {TOKEN_CARDS.map((token) => (
            <article
              key={token.label}
              className={`app-card relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${token.accent} p-6`}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <img
                    src={token.icon}
                    alt={token.label}
                    className="h-12 w-12 rounded-2xl object-cover"
                  />
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] app-text-subtle">
                      {token.label}
                    </div>
                    <div className="mt-1 text-2xl font-semibold app-text">
                      {token.title}
                    </div>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-7 app-text-muted">
                  {token.copy}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="app-card rounded-[2rem] p-6">
          <div className="text-xs uppercase tracking-[0.24em] app-text-subtle">
            Claim center
          </div>
          <div className="mt-3 text-2xl font-semibold app-text">
            Pending now: {formatAmount(pendingClaim)} PSPN
          </div>
          <p className="mt-3 text-sm leading-7 app-text-muted">
            Claiming remains the strongest product moment, so the interface keeps it visible instead of burying it under passive metrics.
          </p>

          <div className="app-premium-pill mt-5 rounded-[1.5rem] p-5">
            <div className="text-xs uppercase tracking-[0.2em]">
              Total earned
            </div>
            <div className="mt-2 text-3xl font-semibold">
              <AnimatedNumber
                value={totalEarned}
                format={(value) => `${formatAmount(value, 0)} PSPN`}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrimaryAction}
            className="app-primary-btn mt-5 inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
          >
            {primaryActionLabel}
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
