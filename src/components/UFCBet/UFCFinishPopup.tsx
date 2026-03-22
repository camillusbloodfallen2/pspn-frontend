import clsx from "clsx";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { UFCMatches } from "../../constants/ufc";
import { UFCBetResult } from "../../enums/UFCBet";
import { notify } from "../../helper/notify";
import useWallet from "../../hook/useWallet";
import { UFCRound } from "../../interfaces/UFCBetType";
import { AppDispatch } from "../../redux/store";
import { finishRound, getRounds } from "../../redux/ufcSlice";
import { CloseIcon } from "../ui/Icons";

const UFCFinishPopup: React.FC<{
  openModal: boolean;
  setOpenModal: (open: boolean) => void;
  targetRound: UFCRound | undefined;
}> = ({ openModal, setOpenModal, targetRound }) => {
  const { account } = useWallet();
  const dispatch: AppDispatch = useDispatch();
  const [result, setResult] = useState<UFCBetResult | -1>(-1);

  const matchInfo = useMemo(
    () => UFCMatches.find((match) => match.id === targetRound?.roundID),
    [targetRound]
  );

  useEffect(() => {
    if (openModal) {
      setResult(-1);
    }
  }, [openModal, targetRound]);

  if (!openModal || !targetRound || !matchInfo) {
    return null;
  }

  const handleFinishRound = () => {
    if (result === -1) {
      notify.error("Select a result before finishing the round.");
      return;
    }

    if (!account) {
      notify.error("Connect an admin wallet to finish this round.");
      return;
    }

    dispatch(
      finishRound({
        roundId: targetRound.roundID,
        result: Number(result),
        account,
      })
    )
      .unwrap()
      .then(() => {
        dispatch(getRounds());
        setOpenModal(false);
        setResult(-1);
      })
      .catch(() => {
        notify.error("Finish round failed.", "The result could not be submitted.");
      });
  };

  const options = [
    {
      key: UFCBetResult.Player1,
      label: targetRound.player1Name,
      image: `/assets/ufc/${matchInfo.matchId}/${matchInfo.player1.img}.png`,
    },
    {
      key: UFCBetResult.Draw,
      label: "Draw",
      image: "",
    },
    {
      key: UFCBetResult.Player2,
      label: targetRound.player2Name,
      image: `/assets/ufc/${matchInfo.matchId}/${matchInfo.player2.img}.png`,
    },
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <button
        type="button"
        onClick={() => setOpenModal(false)}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        aria-label="Close modal"
      />

      <div className="app-card-strong relative z-10 w-full max-w-3xl rounded-[2rem] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="app-premium-pill inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-[0.28em]">
              Admin tool
            </div>
            <div className="mt-3 font-display text-3xl font-semibold app-text">
              Finish UFC round
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpenModal(false)}
            className="app-secondary-btn inline-flex h-11 w-11 items-center justify-center rounded-2xl"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {options.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() =>
                setResult((current) => (current === option.key ? -1 : option.key))
              }
              className={clsx(
                "rounded-[1.75rem] border p-4 text-left transition",
                result === option.key
                  ? "app-accent-pill shadow-[0_18px_50px_rgba(0,255,133,0.14)]"
                  : "app-card"
              )}
            >
              {option.image ? (
                <img
                  src={option.image}
                  alt={option.label}
                  className="h-56 w-full rounded-[1.25rem] object-cover"
                />
              ) : (
                <div className="app-panel app-text flex h-56 items-center justify-center rounded-[1.25rem] text-3xl font-semibold">
                  Draw
                </div>
              )}
              <div className="app-text-subtle mt-4 text-sm font-semibold uppercase tracking-[0.22em]">
                {option.label}
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleFinishRound}
          className="app-primary-btn mt-6 inline-flex w-full min-h-[48px] items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
        >
          Confirm result
        </button>
      </div>
    </div>
  );
};

export default UFCFinishPopup;
