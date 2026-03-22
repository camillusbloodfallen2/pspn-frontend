import React from "react";

interface IconProps {
  className?: string;
}

const IconBase: React.FC<React.PropsWithChildren<IconProps>> = ({
  className,
  children,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const MenuIcon: React.FC<IconProps> = ({ className }) => (
  <IconBase className={className}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </IconBase>
);

export const WalletIcon: React.FC<IconProps> = ({ className }) => (
  <IconBase className={className}>
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h11A2.5 2.5 0 0 1 19 7.5V9h-3.5A2.5 2.5 0 0 0 13 11.5v1A2.5 2.5 0 0 0 15.5 15H19v1.5A2.5 2.5 0 0 1 16.5 19h-11A2.5 2.5 0 0 1 3 16.5z" />
    <path d="M15 11.5a1 1 0 0 1 1-1H21v4h-5a1 1 0 0 1-1-1z" />
  </IconBase>
);

export const PowerIcon: React.FC<IconProps> = ({ className }) => (
  <IconBase className={className}>
    <path d="M12 3v8" />
    <path d="M8 5.5a7 7 0 1 0 8 0" />
  </IconBase>
);

export const CloseIcon: React.FC<IconProps> = ({ className }) => (
  <IconBase className={className}>
    <path d="m6 6 12 12" />
    <path d="m18 6-12 12" />
  </IconBase>
);

export const ArrowRightIcon: React.FC<IconProps> = ({ className }) => (
  <IconBase className={className}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </IconBase>
);

export const HomeIcon: React.FC<IconProps> = ({ className }) => (
  <IconBase className={className}>
    <path d="m4 10 8-6 8 6" />
    <path d="M6.5 9.5V20h11V9.5" />
    <path d="M10 20v-5h4v5" />
  </IconBase>
);

export const SwapIcon: React.FC<IconProps> = ({ className }) => (
  <IconBase className={className}>
    <path d="M7 7h12" />
    <path d="m15 3 4 4-4 4" />
    <path d="M17 17H5" />
    <path d="m9 13-4 4 4 4" />
  </IconBase>
);

export const SparkIcon: React.FC<IconProps> = ({ className }) => (
  <IconBase className={className}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
  </IconBase>
);

export const ChartIcon: React.FC<IconProps> = ({ className }) => (
  <IconBase className={className}>
    <path d="M4 19h16" />
    <path d="M7 15V9" />
    <path d="M12 15V5" />
    <path d="M17 15v-3" />
  </IconBase>
);

export const ShieldIcon: React.FC<IconProps> = ({ className }) => (
  <IconBase className={className}>
    <path d="M12 3 5 6v5c0 4.2 2.8 8.1 7 10 4.2-1.9 7-5.8 7-10V6z" />
    <path d="m9.5 12 1.8 1.8L15 10" />
  </IconBase>
);

export const BoltIcon: React.FC<IconProps> = ({ className }) => (
  <IconBase className={className}>
    <path d="M13 2 6 13h5l-1 9 7-11h-5z" />
  </IconBase>
);

export const SunIcon: React.FC<IconProps> = ({ className }) => (
  <IconBase className={className}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2.2" />
    <path d="M12 19.3v2.2" />
    <path d="m4.9 4.9 1.5 1.5" />
    <path d="m17.6 17.6 1.5 1.5" />
    <path d="M2.5 12h2.2" />
    <path d="M19.3 12h2.2" />
    <path d="m4.9 19.1 1.5-1.5" />
    <path d="m17.6 6.4 1.5-1.5" />
  </IconBase>
);

export const MoonIcon: React.FC<IconProps> = ({ className }) => (
  <IconBase className={className}>
    <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4 6.8 6.8 0 0 0 20 14.5z" />
  </IconBase>
);
