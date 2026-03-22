import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import React from "react";

const LoadingBar: React.FC = () => {
  const { loadingClaimYield } = useSelector((state: RootState) => state.user);
  const { loadingInternalSwap } = useSelector((state: RootState) => state.swap);
  const { loadingCreate, loadingAdmin, loadingGetRounds, loadingApprove } =
    useSelector((state: RootState) => state.ufc);
  const loadingMessage =
    loadingClaimYield ||
    loadingInternalSwap ||
    loadingCreate ||
    loadingAdmin ||
    loadingGetRounds ||
    loadingApprove;

  if (!loadingMessage) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="flex min-w-[16rem] items-center gap-4 rounded-3xl border border-white/10 bg-white/8 px-5 py-4 shadow-[0_24px_100px_rgba(2,132,199,0.22)] backdrop-blur-2xl">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-400/20 border-t-sky-300" />
        <div>
          <div className="text-xs uppercase tracking-[0.28em] text-sky-200/60">
            Protocol action
          </div>
          <div className="mt-1 text-sm font-semibold text-white">
            {loadingMessage}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingBar;
