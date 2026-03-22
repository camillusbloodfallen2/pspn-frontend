import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SwapTokens } from "../../config/config";
import { notify } from "../../helper/notify";
import useWallet from "../../hook/useWallet";
import { AppDispatch, RootState } from "../../redux/store";
import {
  getEstimatedSwapAmount,
  handleInternalSwap,
  setFromAmount,
  setFromTokenIndex,
  setToAmount,
  setToTokenIndex,
} from "../../redux/swapSlice";
import { getTokenBalanceByUser } from "../../redux/userSlice";
import { formatNumberWithCommas } from "../../utils";
import InputSelectCoin from "../InputSelectCoin/Index";
import { ArrowRightIcon, SwapIcon } from "../ui/Icons";

const formatAmount = (value: number, floor = 3) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  return formatNumberWithCommas(Number(safeValue.toFixed(floor)), floor);
};

export const SwapPanel: React.FC = () => {
  const { account, connectWallet } = useWallet();
  const dispatch: AppDispatch = useDispatch();
  const {
    fromTokenIndex,
    toTokenIndex,
    fromAmount,
    toAmount,
    loadingEstimateSwapAmount,
    loadingInternalSwap,
  } = useSelector((state: RootState) => state.swap);

  const quoteReady =
    Number(fromAmount) > 0 && Number(toAmount) > 0 && fromTokenIndex !== toTokenIndex;

  const handleChangeAmount = (
    e: React.ChangeEvent<HTMLInputElement>,
    fromStatus: boolean
  ) => {
    const value = e.target.value;
    fromStatus ? dispatch(setFromAmount(value)) : dispatch(setToAmount(value));

    if (value.trim() === "") {
      fromStatus ? dispatch(setToAmount("")) : dispatch(setFromAmount(""));
      return;
    }

    if (isNaN(Number(value))) {
      fromStatus ? dispatch(setToAmount("")) : dispatch(setFromAmount(""));
      return;
    }

    dispatch(
      getEstimatedSwapAmount({
        from: SwapTokens[fromTokenIndex].address,
        to: SwapTokens[toTokenIndex].address,
        amount: Number(value),
        direction: fromStatus,
      })
    );
  };

  const handleChangeToken = (
    e: React.ChangeEvent<HTMLSelectElement>,
    isFromToken: boolean
  ) => {
    const value = Number(e.target.value);

    if (isFromToken) {
      dispatch(setFromTokenIndex(value));
    } else {
      dispatch(setToTokenIndex(value));
    }

    dispatch(setToAmount(""));
    dispatch(setFromAmount(""));
  };

  const handleClickExcIcon = () => {
    const tempIndex = fromTokenIndex;
    const tempAmount = fromAmount;

    dispatch(setFromTokenIndex(toTokenIndex));
    dispatch(setToTokenIndex(tempIndex));
    dispatch(setFromAmount(toAmount));
    dispatch(setToAmount(tempAmount));
  };

  const handleClickExchange = () => {
    if (fromTokenIndex === -1 || toTokenIndex === -1) {
      notify.error("Choose both tokens first.");
      return;
    }

    if (
      fromAmount !== "" &&
      Number(fromAmount) > 0 &&
      (toAmount === "" || Number(toAmount) === 0)
    ) {
      dispatch(
        getEstimatedSwapAmount({
          from: SwapTokens[fromTokenIndex].address,
          to: SwapTokens[toTokenIndex].address,
          amount: Number(fromAmount),
          direction: true,
        })
      );
      return;
    }

    if (
      fromAmount === "" ||
      Number(fromAmount) === 0 ||
      toAmount === "" ||
      Number(toAmount) === 0
    ) {
      notify.info("Enter an amount to get your quote.");
      return;
    }

    if (!account) {
      connectWallet();
      return;
    }

    dispatch(
      handleInternalSwap({
        from: SwapTokens[fromTokenIndex].address,
        to: SwapTokens[toTokenIndex].address,
        amount: Number(fromAmount),
        account,
      })
    )
      .unwrap()
      .then(() => {
        dispatch(getTokenBalanceByUser({ account }));
        dispatch(setFromAmount(""));
        dispatch(setToAmount(""));
        notify.success("Swap confirmed.", "Balances will refresh automatically.");
      })
      .catch(() => {
        notify.error("Swap failed.", "The protocol could not confirm this swap.");
      });
  };

  useEffect(() => {
    if (fromTokenIndex === -1) {
      return;
    }

    if (fromTokenIndex === toTokenIndex) {
      dispatch(setToTokenIndex(1 - fromTokenIndex));
    }
  }, [dispatch, fromTokenIndex, toTokenIndex]);

  useEffect(() => {
    if (toTokenIndex === -1) {
      return;
    }

    if (fromTokenIndex === toTokenIndex) {
      dispatch(setFromTokenIndex(1 - fromTokenIndex));
    }
  }, [dispatch, fromTokenIndex, toTokenIndex]);

  const primaryLabel = !account
    ? "Connect wallet"
    : loadingInternalSwap
    ? "Confirming swap..."
    : loadingEstimateSwapAmount
    ? "Getting estimate..."
    : !fromAmount
    ? "Enter amount"
    : !quoteReady
    ? "Get estimate"
    : "Confirm swap";

  return (
    <div className="app-card rounded-[2rem] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.28em] app-text-subtle">
            Internal swap
          </div>
          <div className="mt-2 font-display text-3xl font-semibold app-text">
            Swap instantly between PSPN and UFC.
          </div>
          <div className="mt-3 max-w-md text-sm leading-7 app-text-muted">
            Fast, low-friction internal exchange powered by the protocol. The
            quote updates while you type so the next action stays obvious.
          </div>
        </div>

        <button
          type="button"
          onClick={handleClickExcIcon}
          className="app-accent-pill inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition hover:-translate-y-0.5"
          aria-label="Swap direction"
        >
          <SwapIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="app-panel mt-6 rounded-[1.75rem] p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="app-panel rounded-2xl p-4">
            <div className="text-xs uppercase tracking-[0.22em] app-text-subtle">
              Route
            </div>
            <div className="mt-2 text-sm font-semibold app-text">PSPN to UFC</div>
          </div>
          <div className="app-panel rounded-2xl p-4">
            <div className="text-xs uppercase tracking-[0.22em] app-text-subtle">
              Fee
            </div>
            <div className="mt-2 text-sm font-semibold app-text">
              Included in estimate
            </div>
          </div>
          <div className="app-panel rounded-2xl p-4">
            <div className="text-xs uppercase tracking-[0.22em] app-text-subtle">
              Quote
            </div>
            <div className="mt-2 text-sm font-semibold app-text">
              {loadingEstimateSwapAmount ? "Refreshing..." : "Live preview"}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <div className="mb-3 text-xs uppercase tracking-[0.24em] app-text-subtle">
            Pay
          </div>
          <InputSelectCoin
            handleChange={(e) => handleChangeToken(e, true)}
            selectedToken={fromTokenIndex}
            amount={fromAmount}
            handleChangeAmount={(e) => handleChangeAmount(e, true)}
            inputEnabled
          />
        </div>

        <div className="flex justify-center">
          <div className="app-chip rounded-full p-3 app-text">
            <ArrowRightIcon className="h-5 w-5" />
          </div>
        </div>

        <div>
          <div className="mb-3 text-xs uppercase tracking-[0.24em] app-text-subtle">
            Get
          </div>
          <InputSelectCoin
            handleChange={(e) => handleChangeToken(e, false)}
            selectedToken={toTokenIndex}
            amount={toAmount}
            handleChangeAmount={(e) => handleChangeAmount(e, false)}
            inputEnabled
          />
        </div>
      </div>

      <div className="app-panel mt-6 rounded-[1.75rem] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] app-text-subtle">
              Preview
            </div>
            <div className="mt-2 text-xl font-semibold app-text">
              {formatAmount(Number(fromAmount || 0), 2)}{" "}
              {SwapTokens[fromTokenIndex].name}
            </div>
          </div>

          <ArrowRightIcon className="h-5 w-5 app-text-subtle" />

          <div className="text-right">
            <div className="text-xs uppercase tracking-[0.24em] app-text-subtle">
              Estimated output
            </div>
            <div className="app-accent mt-2 text-xl font-semibold">
              {formatAmount(Number(toAmount || 0), 2)} {SwapTokens[toTokenIndex].name}
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm app-text-muted">
          Enter amount, get estimate, then confirm swap. The flow now explains
          itself instead of looking like a cold form.
        </div>
      </div>

      <button
        type="button"
        onClick={handleClickExchange}
        disabled={Boolean(loadingInternalSwap)}
        className="app-primary-btn mt-6 inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {primaryLabel}
      </button>
    </div>
  );
};

export default SwapPanel;
