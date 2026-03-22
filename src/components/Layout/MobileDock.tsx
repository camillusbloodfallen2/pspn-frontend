import clsx from "clsx";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MenuItems } from "../../constants/layout";
import { BoltIcon, HomeIcon, SwapIcon } from "../ui/Icons";

const iconMap = {
  home: HomeIcon,
  swap: SwapIcon,
  ufc: BoltIcon,
} as const;

const MobileDock: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--app-border-soft)] bg-[color:var(--app-panel-strong)]/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-2xl md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-3 gap-2">
        {MenuItems.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap] ?? HomeIcon;
          const isActive = item.href.some((href) => href === location.pathname);

          return (
            <Link
              key={item.label}
              to={item.href[0]}
              className={clsx(
                "flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold transition",
                isActive ? "app-nav-active" : "app-nav-item app-secondary-btn"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileDock;
