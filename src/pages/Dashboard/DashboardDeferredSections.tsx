import React, { useEffect } from "react";
import AnimatedNumber from "../../components/ui/AnimatedNumber";
import {
  ArrowRightIcon,
  BoltIcon,
  ChartIcon,
  ShieldIcon,
  SparkIcon,
} from "../../components/ui/Icons";
import { formatNumberWithCommas } from "../../utils";

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
    accent:
      "from-[rgba(244,197,107,0.18)] via-[rgba(121,78,255,0.1)] to-transparent",
    icon: "/assets/tokens/pspn-96.png",
  },
  {
    label: "UFC",
    title: "Reward output",
    copy: "Accrues while your PSPN position keeps working and becomes the visible proof of value.",
    accent: "from-[rgba(0,255,133,0.16)] via-[rgba(0,255,133,0.06)] to-transparent",
    icon: "/assets/tokens/ufc-96.png",
  },
];

interface DashboardDeferredSectionsProps {
  dailyReturn: number;
  monthlyReturn: number;
  onPrimaryAction: () => void;
  onReady?: (ready: boolean) => void;
  onSecondaryAction: () => void;
  pendingClaim: number;
  primaryActionLabel: string;
  protocolApr: number;
  totalEarned: number;
}

const formatAmount = (value: number, decimals = 1) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  return formatNumberWithCommas(Number(safeValue.toFixed(decimals)), decimals);
};

const DashboardDeferredSections: React.FC<DashboardDeferredSectionsProps> = ({
  dailyReturn,
  monthlyReturn,
  onPrimaryAction,
  onReady,
  onSecondaryAction,
  pendingClaim,
  primaryActionLabel,
  protocolApr,
  totalEarned,
}) => {
  useEffect(() => {
    if (onReady) {
      onReady(true);
    }
  }, [onReady]);

  return (
    <div className="deferred-landing-sections space-y-8">
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
              onClick={onSecondaryAction}
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
                    decoding="async"
                    height={96}
                    loading="lazy"
                    className="h-12 w-12 rounded-2xl object-cover"
                    width={96}
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
            Claiming remains the strongest product moment, so the interface keeps
            it visible instead of burying it under passive metrics.
          </p>

          <div className="app-premium-pill mt-5 rounded-[1.5rem] p-5">
            <div className="text-xs uppercase tracking-[0.2em]">Total earned</div>
            <div className="mt-2 text-3xl font-semibold">
              <AnimatedNumber
                value={totalEarned}
                format={(value) => `${formatAmount(value, 0)} PSPN`}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onPrimaryAction}
            className="app-primary-btn mt-5 inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-transform duration-150 hover:-translate-y-0.5 motion-reduce:transition-none"
          >
            {primaryActionLabel}
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default DashboardDeferredSections;
