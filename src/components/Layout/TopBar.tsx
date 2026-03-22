import useWallet from "../../hook/useWallet";
import { formatNumberWithCommas, getShortAddress } from "../../utils";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";
import { MenuItems } from "../../constants/layout";
import React from "react";
import Avatar from "../Blockies/Blockies";
import {
  MenuIcon,
  MoonIcon,
  PowerIcon,
  SunIcon,
  WalletIcon,
} from "../ui/Icons";
import { useTheme } from "../../theme/ThemeProvider";

const TopBar: React.FC<{ showMobileSideBar: () => void }> = ({
  showMobileSideBar,
}) => {
  const { connectWallet, disconnectWallet, account, isConnected } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const { myTokenBalance, myUFCTokenBalance } = useSelector(
    (state: RootState) => state.user
  );
  const currentRoute = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--app-border-soft)] bg-[color:var(--app-panel-strong)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={showMobileSideBar}
          className="app-chip inline-flex h-11 w-11 items-center justify-center rounded-2xl text-[color:var(--app-text)] md:hidden"
          aria-label="Open navigation"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <Link
          to="/"
          className="app-chip flex min-w-0 items-center gap-3 rounded-full px-3 py-2"
        >
          <img
            src="/assets/main/logo-36.png"
            srcSet="/assets/main/logo-72.png 2x"
            alt="PSPN"
            decoding="async"
            height={36}
            className="h-9 w-9 rounded-full object-cover"
            width={36}
          />
          <div className="min-w-0">
            <div className="font-display text-sm font-semibold tracking-[0.2em] app-text">
              PSPN
            </div>
            <div className="text-xs app-text-subtle">Real-time yield engine</div>
          </div>
        </Link>

        <nav className="ml-3 hidden flex-1 items-center gap-2 md:flex">
          {MenuItems.map((menu) => (
            <Link
              key={menu.label}
              to={menu.href[0]}
              className={clsx(
                "rounded-full px-4 py-2 text-sm font-medium",
                menu.href.some((href) => href === currentRoute.pathname)
                  ? "app-nav-active"
                  : "app-nav-item hover:bg-[color:var(--app-chip)] hover:text-[color:var(--app-text)]"
              )}
            >
              {menu.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <div className="app-chip rounded-2xl px-4 py-2">
            <div className="text-[0.65rem] uppercase tracking-[0.24em] app-text-subtle">
              PSPN staked
            </div>
            <div className="mt-1 text-sm font-semibold app-text">
              {formatNumberWithCommas(myTokenBalance, 0)} PSPN
            </div>
          </div>

          <div className="app-chip rounded-2xl px-4 py-2">
            <div className="text-[0.65rem] uppercase tracking-[0.24em] app-text-subtle">
              UFC rewards
            </div>
            <div className="mt-1 text-sm font-semibold app-accent">
              {formatNumberWithCommas(myUFCTokenBalance, 0)} UFC
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="app-chip inline-flex h-11 w-11 items-center justify-center rounded-full app-text"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? (
              <SunIcon className="h-4 w-4" />
            ) : (
              <MoonIcon className="h-4 w-4" />
            )}
          </button>

          {isConnected ? (
            <div className="app-accent-pill hidden items-center gap-2 rounded-full px-3 py-2 text-sm md:flex">
              <Avatar address={account} width={28} />
              <span className="font-medium">{getShortAddress(account)}</span>
            </div>
          ) : null}

          <button
            type="button"
            onClick={
              isConnected ? () => disconnectWallet() : () => connectWallet()
            }
            className={clsx(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold",
              isConnected
                ? "app-chip app-text"
                : "app-primary-btn transition-transform duration-150 hover:-translate-y-0.5 motion-reduce:transition-none"
            )}
            aria-label={isConnected ? "Disconnect wallet" : "Start earning"}
          >
            {isConnected ? (
              <PowerIcon className="h-4 w-4" />
            ) : (
              <WalletIcon className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isConnected ? "Disconnect" : "Start Earning"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
