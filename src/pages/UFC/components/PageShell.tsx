import type { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
}

const PageShell: React.FC<PageShellProps> = ({ children }) => (
  <div className="relative isolate overflow-hidden rounded-[2rem] border border-[color:var(--app-border-soft)] bg-[color:var(--app-surface)] p-4 shadow-[0_36px_110px_rgba(2,6,23,0.16)] backdrop-blur-2xl sm:p-6 lg:p-8">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(234,58,58,0.08),transparent)]"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top,rgba(121,78,255,0.16),transparent_54%)]"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-0 right-0 top-[9rem] h-px bg-[linear-gradient(90deg,transparent,var(--app-border),transparent)]"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(0deg,rgba(0,255,133,0.08),transparent)]"
    />
    <div className="relative z-10 space-y-8 lg:space-y-10">{children}</div>
  </div>
);

export default PageShell;
