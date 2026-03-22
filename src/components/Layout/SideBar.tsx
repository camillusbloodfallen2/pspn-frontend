import clsx from "clsx";
import React from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { MenuItems } from "../../constants/layout";
import useWallet from "../../hook/useWallet";
import { RootState } from "../../redux/store";
import { formatNumberWithCommas, getShortAddress } from "../../utils";
import Avatar from "../Blockies/Blockies";
import {
  CloseIcon,
  MoonIcon,
  PowerIcon,
  SunIcon,
  WalletIcon,
} from "../ui/Icons";
import { useTheme } from "../../theme/ThemeProvider";

const MobileSideBar = ({
  showMobileSideBar,
  toggleMobileSideBar,
  onConnectWallet,
}: {
  showMobileSideBar: boolean;
  toggleMobileSideBar: React.Dispatch<React.SetStateAction<boolean>>;
  onConnectWallet: () => void;
}) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { account, disconnectWallet, isConnected } = useWallet();
  const { myTokenBalance, myUFCTokenBalance } = useSelector(
    (state: RootState) => state.user
  );

  return (
    <div
      className={clsx(
        "fixed inset-0 z-[120] md:hidden",
        showMobileSideBar ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      <button
        type="button"
        onClick={() => toggleMobileSideBar(false)}
        className={clsx(
          "absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition",
          showMobileSideBar ? "opacity-100" : "opacity-0"
        )}
        aria-label="Close navigation"
      />

      <aside
        className={clsx(
          "absolute left-0 top-0 flex h-full w-[min(24rem,86vw)] flex-col border-r border-[color:var(--app-border)] bg-[color:var(--app-panel-strong)] p-5 shadow-[0_20px_80px_rgba(2,8,23,0.45)] transition-transform duration-300",
          showMobileSideBar ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between">
          <Link
            to="/"
            onClick={() => toggleMobileSideBar(false)}
            className="flex items-center gap-3"
          >
            <img
              src="/assets/main/logo.png"
              alt="PSPN"
              className="h-12 w-12 rounded-full object-cover"
            />
              <div>
                <div className="font-display text-lg font-semibold app-text">PSPN</div>
                <div className="text-xs uppercase tracking-[0.28em] app-text-subtle">
                  Yield machine
                </div>
              </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="app-chip inline-flex h-11 w-11 items-center justify-center rounded-2xl app-text"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              {theme === "dark" ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => toggleMobileSideBar(false)}
              className="app-chip inline-flex h-11 w-11 items-center justify-center rounded-2xl app-text"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="app-chip mt-6 rounded-3xl p-4">
          {isConnected ? (
            <div className="flex items-center gap-3">
              <Avatar address={account} width={44} />
              <div>
                <div className="text-xs uppercase tracking-[0.24em] app-text-subtle">
                  Connected wallet
                </div>
                <div className="mt-1 text-sm font-semibold app-text">
                  {getShortAddress(account)}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-xs uppercase tracking-[0.24em] app-text-subtle">
                Visitor mode
              </div>
              <div className="mt-2 text-sm app-text-muted">
                Preview earnings first, then connect when you are ready to activate live rewards.
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={
              isConnected ? () => disconnectWallet() : () => onConnectWallet()
            }
            className={clsx(
              "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition",
              isConnected
                ? "app-panel app-text"
                : "app-primary-btn"
            )}
          >
            {isConnected ? (
              <PowerIcon className="h-4 w-4" />
            ) : (
              <WalletIcon className="h-4 w-4" />
            )}
            {isConnected ? "Disconnect wallet" : "Start earning"}
          </button>
        </div>

        <nav className="mt-6 flex flex-col gap-2">
          {MenuItems.map((menu) => {
            const isActive = menu.href.some((href) => href === location.pathname);

            return (
              <Link
                key={menu.label}
                to={menu.href[0]}
                onClick={() => toggleMobileSideBar(false)}
                className={clsx(
                  "rounded-2xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "app-nav-active"
                    : "app-chip app-nav-item hover:text-[color:var(--app-text)]"
                )}
              >
                {menu.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto grid gap-3">
          <div className="app-chip rounded-2xl p-4">
            <div className="text-xs uppercase tracking-[0.24em] app-text-subtle">
              PSPN staked
            </div>
            <div className="mt-2 text-lg font-semibold app-text">
              {formatNumberWithCommas(myTokenBalance, 0)} PSPN
            </div>
          </div>

          <div className="app-chip rounded-2xl p-4">
            <div className="text-xs uppercase tracking-[0.24em] app-text-subtle">
              UFC rewards
            </div>
            <div className="mt-2 text-lg font-semibold app-accent">
              {formatNumberWithCommas(myUFCTokenBalance, 0)} UFC
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default MobileSideBar;
