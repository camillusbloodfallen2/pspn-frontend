import React, { ReactNode, useEffect, useState } from "react";
import TopBar from "./TopBar";
import useWallet from "../../hook/useWallet";
import { ChainConfig } from "../../config/config";
import { switchNetwork } from "../../helper/network";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { getTokenBalanceByUser, setTokenBalance } from "../../redux/userSlice";
import MobileSideBar from "./SideBar";
import LoadingBar from "./LoadingBar";
import ToastViewport from "../ui/ToastViewport";
import MobileDock from "./MobileDock";

interface LayoutProps {
  children: ReactNode;
}

const LayoutIndex: React.FC<LayoutProps> = ({ children }) => {
  const { wallet, disconnectWallet, connectWallet, account } = useWallet();
  const dispatch: AppDispatch = useDispatch();
  const [showMobileSideBar, setShowMobileSideBar] = useState(false);

  useEffect(() => {
    const currentChain = wallet?.chains?.[0]?.id;

    if (!wallet || !currentChain) {
      return;
    }

    if (currentChain === `0x${ChainConfig.chainId.toString(16)}`) {
      return;
    }

    switchNetwork(wallet.provider).then((switched) => {
      if (!switched) {
        void disconnectWallet();
      }
    });
  }, [wallet, disconnectWallet]);

  useEffect(() => {
    if (account) {
      dispatch(getTokenBalanceByUser({ account }));
    } else {
      dispatch(setTokenBalance(0));
    }
  }, [account, dispatch]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-[-10rem] z-0 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(109,71,255,0.28),transparent_44%)]" />
      <div className="landing-orb pointer-events-none absolute right-[-8rem] top-[18rem] z-0 h-72 w-72 rounded-full bg-[color:var(--app-accent-soft)] blur-3xl" />
      <div className="landing-orb pointer-events-none absolute left-[-6rem] top-[32rem] z-0 h-80 w-80 rounded-full bg-[rgba(244,197,107,0.08)] blur-3xl" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.06))]" />

      <LoadingBar />
      <TopBar showMobileSideBar={() => setShowMobileSideBar(true)} />
      <ToastViewport />

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-28 pt-6 sm:px-6 md:pb-20 lg:px-8">
        {children}
      </main>

      <MobileSideBar
        showMobileSideBar={showMobileSideBar}
        toggleMobileSideBar={setShowMobileSideBar}
        onConnectWallet={connectWallet}
      />
      <MobileDock />
    </div>
  );
};

export default LayoutIndex;
