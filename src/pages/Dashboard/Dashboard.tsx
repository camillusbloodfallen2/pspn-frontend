import React, { Suspense, lazy, useEffect, useState } from "react";
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
} from "../../redux/userSlice";
import { formatNumberWithCommas } from "../../utils";
import AnimatedNumber from "../../components/ui/AnimatedNumber";
import { ArrowRightIcon, SparkIcon } from "../../components/ui/Icons";

const DashboardDeferredSections = lazy(
  () => import("./DashboardDeferredSections")
);

const PREVIEW_MODE = {
  apr: 12.4,
  daily: 2.3,
  monthly: 69,
  pending: 7.8,
  totalEarned: 2487,
  pspnBalance: 1250,
  ufcBalance: 640,
};

const formatAmount = (value: number, decimals = 1) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  return formatNumberWithCommas(Number(safeValue.toFixed(decimals)), decimals);
};

const Dashboard: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { account, connectWallet } = useWallet();
  const [expectedYieldAmount, setExpectedYieldAmount] = useState(0);
  const [showDeferredSections, setShowDeferredSections] = useState(false);
  const [deferredSectionsReady, setDeferredSectionsReady] = useState(false);
  const [shouldScrollToProof, setShouldScrollToProof] = useState(false);

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

    setShowDeferredSections(true);
    setShouldScrollToProof(true);
  };

  useEffect(() => {
    if (!hasLivePosition || dailyYieldRate <= 0 || yieldInfo.lastClaimTimestamp === 0) {
      setExpectedYieldAmount(yieldInfo.yieldToClaim);
      return;
    }

    const updatePendingClaim = () => {
      const timeElapsed =
        new Date().getTime() / 1000 - yieldInfo.lastClaimTimestamp;

      const pendingYield =
        (myUFCTokenBalance * dailyYieldRate * timeElapsed) /
        (3600 * 24) /
        10000;

      setExpectedYieldAmount(pendingYield + yieldInfo.yieldToClaim);
    };

    updatePendingClaim();

    const interval = window.setInterval(updatePendingClaim, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    dailyYieldRate,
    hasLivePosition,
    myUFCTokenBalance,
    yieldInfo.lastClaimTimestamp,
    yieldInfo.yieldToClaim,
  ]);

  useEffect(() => {
    if (!hasLivePosition) {
      return;
    }

    dispatch(getYieldRate());
  }, [dispatch, hasLivePosition]);

  useEffect(() => {
    if (account && hasLivePosition) {
      dispatch(getYieldInfo({ account }));
      return;
    }

    dispatch(initYieldInfo());
    setExpectedYieldAmount(0);
  }, [account, dispatch, hasLivePosition]);

  useEffect(() => {
    let isCancelled = false;
    let fallbackTimer = 0;

    const revealDeferredSections = () => {
      if (!isCancelled) {
        setShowDeferredSections(true);
      }
    };

    const idleWindow = window as typeof window & {
      requestIdleCallback?: (
        callback: () => void,
        options?: { timeout: number }
      ) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (idleWindow.requestIdleCallback) {
      const idleId = idleWindow.requestIdleCallback(revealDeferredSections, {
        timeout: 1400,
      });

      return () => {
        isCancelled = true;
        if (idleWindow.cancelIdleCallback) {
          idleWindow.cancelIdleCallback(idleId);
        }
      };
    }

    fallbackTimer = window.setTimeout(revealDeferredSections, 700);

    return () => {
      isCancelled = true;
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  useEffect(() => {
    if (!shouldScrollToProof || !deferredSectionsReady) {
      return;
    }

    const scrollTimer = window.setTimeout(() => {
      const target = document.getElementById("proof-block");

      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      setShouldScrollToProof(false);
    }, 32);

    return () => {
      window.clearTimeout(scrollTimer);
    };
  }, [deferredSectionsReady, shouldScrollToProof]);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="app-card-strong relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
          <img
            src="/assets/main/background.png"
            alt=""
            decoding="async"
            fetchPriority="high"
            loading="eager"
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
                className="app-primary-btn inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform duration-150 hover:-translate-y-0.5 motion-reduce:transition-none"
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

      {showDeferredSections ? (
        <Suspense fallback={null}>
          <DashboardDeferredSections
            dailyReturn={dailyReturn}
            monthlyReturn={monthlyReturn}
            onPrimaryAction={handlePrimaryAction}
            onReady={setDeferredSectionsReady}
            onSecondaryAction={handleSecondaryAction}
            pendingClaim={pendingClaim}
            primaryActionLabel={primaryActionLabel}
            protocolApr={protocolApr}
            totalEarned={totalEarned}
          />
        </Suspense>
      ) : null}
    </div>
  );
};

export default Dashboard;
