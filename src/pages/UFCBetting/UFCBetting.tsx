import clsx from "clsx";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { UFCMatches } from "../../constants/ufc";
import { UFCBetResult, UFCRoundStatus } from "../../enums/UFCBet";
import { notify } from "../../helper/notify";
import useWallet from "../../hook/useWallet";
import { UFCBet } from "../../interfaces/UFCBetType";
import { AppDispatch, RootState } from "../../redux/store";
import {
  approveAction,
  enterRound,
  getCurrentRound,
} from "../../redux/ufcSlice";
import {
  formatNumberWithCommas,
  formatTimestamp,
  getLocalTimeFromTimestamp,
  getShortAddress,
  remainTime,
} from "../../utils";
import { getOdds } from "../../utils/ufcBet";

const BettingList: React.FC<{ title: string; items: UFCBet[] }> = ({
  title,
  items,
}) => {
  const totalAmount = items.reduce((sum, item) => item.amount + sum, 0);

  return (
    <div className="app-card rounded-[2rem] p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="app-text-subtle text-xs uppercase tracking-[0.24em]">
            {title}
          </div>
          <div className="app-text mt-2 text-2xl font-semibold">
            {items.length} bets
          </div>
        </div>
        <div className="app-panel rounded-2xl px-4 py-3 text-right">
          <div className="app-text-subtle text-xs uppercase tracking-[0.24em]">
            Total pool
          </div>
          <div className="ufc-accent mt-2 text-lg font-semibold">
            {formatNumberWithCommas(totalAmount, 0)} UFC
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <div className="app-panel app-text-muted rounded-2xl border border-dashed p-5 text-sm">
            No bets here yet. This column will fill as users back this side of
            the market.
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={`${item.entryId}-${index}`}
              className="app-panel grid gap-3 rounded-2xl p-4 sm:grid-cols-[3rem_1fr_auto]"
            >
              <div className="app-text-muted text-sm font-semibold">
                #{index + 1}
              </div>
              <div>
                <div className="app-text text-sm font-semibold">
                  {getShortAddress(item.player)}
                </div>
                <div className="app-text-subtle mt-1 text-xs uppercase tracking-[0.18em]">
                  {formatTimestamp(item.timestamp)}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                <div className="ufc-accent text-sm font-semibold">
                  {formatNumberWithCommas(item.amount, 0)} UFC
                </div>
                <a
                  href="https://scan.pulsechain.com"
                  target="_blank"
                  rel="noreferrer"
                  className="app-chip app-text-muted rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                >
                  Scan
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const UFCBetting: React.FC = () => {
  const { id } = useParams();
  const navigation = useNavigate();
  const { account, connectWallet } = useWallet();
  const { myUFCTokenBalance } = useSelector((state: RootState) => state.user);
  const dispatch: AppDispatch = useDispatch();
  const { currentRound } = useSelector((state: RootState) => state.ufc);
  const [betAmount, setBetAmount] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<UFCBetResult | -1>(-1);
  const [curTime, setCurTime] = useState(new Date().getTime() / 1000);

  const roundId = Number(id);
  const matchInfo = useMemo(
    () => UFCMatches.find((info) => info.id === roundId),
    [roundId]
  );

  const handleClickPlayer = (selected: UFCBetResult) => {
    setSelectedPlayer((current) => (current === selected ? -1 : selected));
  };

  const handleClickCreateBet = () => {
    if (!account) {
      connectWallet();
      return;
    }

    if (
      selectedPlayer !== UFCBetResult.Player1 &&
      selectedPlayer !== UFCBetResult.Player2
    ) {
      notify.info("Choose the fighter you want to back first.");
      return;
    }

    if (Number.isNaN(Number(betAmount)) || Number(betAmount) <= 0) {
      notify.error("Enter a valid UFC amount before placing the bet.");
      return;
    }

    if (myUFCTokenBalance < Number(betAmount)) {
      notify.info("Your UFC balance is too low for this bet.");
      return;
    }

    dispatch(approveAction({ amount: Number(betAmount), account }))
      .unwrap()
      .then(() =>
        dispatch(
          enterRound({
            roundId,
            amount: Number(betAmount),
            expectation: selectedPlayer,
            account,
          })
        ).unwrap()
      )
      .then(() => {
        notify.success("Bet placed.", "The market card has been refreshed.");
        dispatch(getCurrentRound({ roundId }));
        setBetAmount("");
      })
      .catch(() => {
        notify.error("Bet failed.", "The market entry was not confirmed.");
      });
  };

  useEffect(() => {
    if (!matchInfo) {
      navigation("/ufc");
    }
  }, [matchInfo, navigation]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurTime(new Date().getTime() / 1000);
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!Number.isNaN(roundId)) {
      dispatch(getCurrentRound({ roundId }));
    }
  }, [dispatch, roundId]);

  if (!currentRound || !matchInfo) {
    return null;
  }

  const marketStatus =
    currentRound.status === UFCRoundStatus.Started && currentRound.closeAt > curTime
      ? {
          label: `Live for ${remainTime((currentRound.closeAt || curTime) - curTime)}`,
          className: "app-live-pill",
        }
      : currentRound.status === UFCRoundStatus.Closed ||
        currentRound.status === UFCRoundStatus.Finishing ||
        (currentRound.status === UFCRoundStatus.Started &&
          currentRound.closeAt <= curTime)
      ? {
          label: "Waiting result",
          className: "app-premium-pill",
        }
      : currentRound.status === UFCRoundStatus.Finished
      ? {
          label:
            currentRound.result === UFCBetResult.Draw
              ? "Completed - Draw"
              : "Completed",
          className: "border-[color:var(--app-border)] bg-[color:var(--app-surface-strong)] [color:var(--ufc-title)]",
        }
      : {
          label: "Upcoming",
          className: "app-accent-pill",
        };

  const betButtonLabel = !account
    ? "Connect wallet"
    : currentRound.status !== UFCRoundStatus.Started
    ? "Market closed"
    : "Create bet";

  return (
    <div className="space-y-8">
      <section className="app-card-strong relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <img
          src={`/assets/main/detailbg${roundId % 8}.png`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-[image:var(--hero-overlay)]" />

        <div className="relative z-10">
          <Link
            to="/ufc"
            className="app-chip app-text inline-flex rounded-full px-4 py-2 text-sm font-semibold"
          >
            Back to live activity
          </Link>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div
                className={clsx(
                  "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]",
                  marketStatus.className
                )}
                >
                {marketStatus.label}
              </div>
              <h1 className="app-text mt-4 font-display text-4xl font-semibold sm:text-5xl">
                {currentRound.player1Name} vs {currentRound.player2Name}
              </h1>
              <p className="app-text-muted mt-4 max-w-3xl text-base leading-7 sm:text-lg">
                Back your side of the fight, follow the odds live, and turn UFC
                activity into a sticky product moment.
              </p>
            </div>

            <div className="app-panel rounded-[1.75rem] p-5 text-right">
              <div className="app-text-subtle text-xs uppercase tracking-[0.24em]">
                Market closes
              </div>
              <div className="app-text mt-2 text-lg font-semibold">
                {getLocalTimeFromTimestamp(currentRound.closeAt || curTime)}
              </div>
              <div className="app-text-muted mt-2 text-sm">
                {matchInfo.weight}
                {matchInfo.eventType ? ` / ${matchInfo.eventType}` : ""}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.88fr_1fr]">
            <button
              type="button"
              onClick={() => handleClickPlayer(UFCBetResult.Player1)}
              className={clsx(
                "rounded-[1.75rem] border p-4 text-left transition",
                selectedPlayer === UFCBetResult.Player1
                  ? "app-accent-pill shadow-[0_18px_50px_rgba(0,255,133,0.14)]"
                  : "app-card"
              )}
            >
              <div className="app-panel flex h-72 w-full items-end justify-center overflow-hidden rounded-[1.25rem]">
                <img
                  src={`/assets/ufc/${matchInfo.matchId}/${matchInfo.player1.img}.png`}
                  alt={currentRound.player1Name}
                  className="h-full w-full object-contain object-top"
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-4">
                <div>
                  <div className="app-text text-2xl font-semibold">
                    {currentRound.player1Name}
                  </div>
                  <div className="app-text-subtle mt-1 text-sm">
                    {matchInfo.player1.stat}
                  </div>
                </div>
                <div className="app-accent-pill rounded-2xl px-3 py-2 text-sm font-semibold">
                  {getOdds(
                    currentRound.player1TotalAmount,
                    currentRound.player2TotalAmount
                  )}
                </div>
              </div>
              <div className="app-text-muted mt-4 text-sm">
                Pool: {formatNumberWithCommas(currentRound.player1TotalAmount, 0)} UFC
              </div>
            </button>

            <div className="app-card rounded-[1.75rem] p-5">
              <div className="app-text-subtle text-xs uppercase tracking-[0.24em]">
                Market summary
              </div>
              <img
                src="/assets/icons/vsicon.png"
                alt="Versus"
                className="mx-auto mt-6 h-20 w-20"
              />
              <div className="mt-5 text-center">
                <div className="app-text text-3xl font-semibold">
                  {getOdds(
                    currentRound.player1TotalAmount,
                    currentRound.player2TotalAmount
                  )}{" "}
                  :{" "}
                  {getOdds(
                    currentRound.player2TotalAmount,
                    currentRound.player1TotalAmount
                  )}
                </div>
                <div className="app-text-muted mt-3 text-sm">
                  Total pool{" "}
                  {formatNumberWithCommas(
                    currentRound.player1TotalAmount +
                    currentRound.player2TotalAmount,
                    0
                  )}{" "}
                  UFC
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <div className="app-panel rounded-2xl p-4">
                  <div className="app-text-subtle text-xs uppercase tracking-[0.22em]">
                    Your UFC balance
                  </div>
                  <div className="app-text mt-2 text-xl font-semibold">
                    {formatNumberWithCommas(myUFCTokenBalance, 0)} UFC
                  </div>
                </div>
                <div className="app-panel rounded-2xl p-4">
                  <div className="app-text-subtle text-xs uppercase tracking-[0.22em]">
                    Picked side
                  </div>
                  <div className="app-text mt-2 text-xl font-semibold">
                    {selectedPlayer === UFCBetResult.Player1
                      ? currentRound.player1Name
                      : selectedPlayer === UFCBetResult.Player2
                      ? currentRound.player2Name
                      : "Choose a side"}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleClickPlayer(UFCBetResult.Player2)}
              className={clsx(
                "rounded-[1.75rem] border p-4 text-left transition",
                selectedPlayer === UFCBetResult.Player2
                  ? "app-accent-pill shadow-[0_18px_50px_rgba(0,255,133,0.14)]"
                  : "app-card"
              )}
            >
              <div className="app-panel flex h-72 w-full items-end justify-center overflow-hidden rounded-[1.25rem]">
                <img
                  src={`/assets/ufc/${matchInfo.matchId}/${matchInfo.player2.img}.png`}
                  alt={currentRound.player2Name}
                  className="h-full w-full object-contain object-top"
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-4">
                <div>
                  <div className="app-text text-2xl font-semibold">
                    {currentRound.player2Name}
                  </div>
                  <div className="app-text-subtle mt-1 text-sm">
                    {matchInfo.player2.stat}
                  </div>
                </div>
                <div className="app-premium-pill rounded-2xl px-3 py-2 text-sm font-semibold">
                  {getOdds(
                    currentRound.player2TotalAmount,
                    currentRound.player1TotalAmount
                  )}
                </div>
              </div>
              <div className="app-text-muted mt-4 text-sm">
                Pool: {formatNumberWithCommas(currentRound.player2TotalAmount, 0)} UFC
              </div>
            </button>
          </div>
        </div>
      </section>

      <section className="app-card rounded-[2rem] p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="app-text-subtle text-xs uppercase tracking-[0.24em]">
              Create bet
            </div>
            <div className="app-text mt-2 font-display text-3xl font-semibold">
              Pick a side, enter UFC, and submit.
            </div>
            <div className="app-text-muted mt-3 text-sm leading-7">
              The action area now explains the market state clearly and keeps
              the next step obvious.
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="app-panel rounded-[1.75rem] p-4">
            <div className="app-text-subtle text-xs uppercase tracking-[0.24em]">
              Bet amount
            </div>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="app-chip flex min-h-14 flex-1 items-center rounded-2xl px-4">
                <img
                  src="/assets/tokens/ufc-96.png"
                  alt="UFC token"
                  decoding="async"
                  height={96}
                  loading="lazy"
                  className="mr-3 h-8 w-8 rounded-xl object-cover"
                  width={96}
                />
                <input
                  value={betAmount}
                  placeholder="Enter UFC amount"
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="app-text w-full bg-transparent py-3 text-lg font-semibold outline-none placeholder:text-[color:var(--app-text-subtle)]"
                />
              </div>
                <button
                  type="button"
                  onClick={handleClickCreateBet}
                  disabled={currentRound.status !== UFCRoundStatus.Started}
                  className="app-primary-btn inline-flex min-h-[48px] items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {betButtonLabel}
                </button>
            </div>
          </div>

          <div className="app-panel rounded-[1.75rem] p-4 lg:min-w-[14rem]">
            <div className="app-text-subtle text-xs uppercase tracking-[0.24em]">
              Selected fighter
            </div>
            <div className="app-text mt-3 text-lg font-semibold">
              {selectedPlayer === UFCBetResult.Player1
                ? currentRound.player1Name
                : selectedPlayer === UFCBetResult.Player2
                ? currentRound.player2Name
                : "Choose a side"}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <BettingList title={currentRound.player1Name} items={currentRound.player1Bets} />
        <BettingList title={currentRound.player2Name} items={currentRound.player2Bets} />
      </section>
    </div>
  );
};

export default UFCBetting;
