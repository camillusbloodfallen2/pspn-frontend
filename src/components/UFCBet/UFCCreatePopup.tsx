import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import useWallet from "../../hook/useWallet";
import { notify } from "../../helper/notify";
import { AppDispatch } from "../../redux/store";
import { createRound, getRounds } from "../../redux/ufcSlice";
import { CloseIcon } from "../ui/Icons";

const buildDefaultCloseAt = () => {
  const now = new Date(Date.now() + 60 * 60 * 1000);
  const timezoneOffset = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const UFCCreatePopup: React.FC<{
  openModal: boolean;
  setOpenModal: (open: boolean) => void;
}> = ({ openModal, setOpenModal }) => {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [closeAt, setCloseAt] = useState(buildDefaultCloseAt());
  const { account } = useWallet();
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (!openModal) {
      return;
    }

    setPlayer1("");
    setPlayer2("");
    setCloseAt(buildDefaultCloseAt());
  }, [openModal]);

  if (!openModal) {
    return null;
  }

  const handleCreateRound = () => {
    const timestamp = Math.floor(new Date(closeAt).getTime() / 1000);

    if (!player1 || !player2 || !closeAt || Number.isNaN(timestamp)) {
      notify.error("Fill every field before creating a round.");
      return;
    }

    if (!account) {
      notify.error("Connect an admin wallet to create a round.");
      return;
    }

    dispatch(
      createRound({
        player1,
        player2,
        closeAt: timestamp,
        account,
      })
    )
      .unwrap()
      .then(() => {
        setOpenModal(false);
        dispatch(getRounds());
        notify.success("Round created.", "The live activity feed was refreshed.");
      })
      .catch(() => {
        notify.error("Round creation failed.", "Please verify the wallet action and try again.");
      });
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <button
        type="button"
        onClick={() => setOpenModal(false)}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        aria-label="Close modal"
      />

      <div className="app-card-strong relative z-10 w-full max-w-lg rounded-[2rem] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="app-premium-pill inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-[0.28em]">
              Admin tool
            </div>
            <div className="mt-3 font-display text-3xl font-semibold app-text">
              Create UFC round
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

        <div className="mt-6 space-y-4">
          <label className="block">
            <div className="app-text-subtle mb-2 text-xs uppercase tracking-[0.24em]">
              Fighter one
            </div>
            <input
              value={player1}
              onChange={(e) => setPlayer1(e.target.value)}
              placeholder="Player 1"
              className="app-field w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
            />
          </label>

          <label className="block">
            <div className="app-text-subtle mb-2 text-xs uppercase tracking-[0.24em]">
              Fighter two
            </div>
            <input
              value={player2}
              onChange={(e) => setPlayer2(e.target.value)}
              placeholder="Player 2"
              className="app-field w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
            />
          </label>

          <label className="block">
            <div className="app-text-subtle mb-2 text-xs uppercase tracking-[0.24em]">
              Market close time
            </div>
            <input
              type="datetime-local"
              value={closeAt}
              onChange={(e) => setCloseAt(e.target.value)}
              className="app-field w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handleCreateRound}
          className="app-primary-btn mt-6 inline-flex w-full min-h-[48px] items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
        >
          Confirm round
        </button>
      </div>
    </div>
  );
};

export default UFCCreatePopup;
