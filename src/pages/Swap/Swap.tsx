import React from "react";
import { ContractConfig } from "../../config/config";
import SwapPanel from "../../components/SwapPanel/Index";
import { ArrowRightIcon, ChartIcon, ShieldIcon } from "../../components/ui/Icons";
import { useTheme } from "../../theme/ThemeProvider";

const Swap: React.FC = () => {
  const { theme } = useTheme();
  const marketUrl = `https://widget.piteas.io/#/swap?theme=${theme}&inputCurrency=PLS&outputCurrency=${ContractConfig.TokenAddress}&exactField=input`;

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="app-card rounded-[2rem] p-6 sm:p-8">
          <div className="app-premium-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em]">
            Internal exchange
          </div>

          <h1 className="mt-6 font-display text-4xl font-semibold leading-tight app-text sm:text-5xl">
            Swap instantly between PSPN and UFC.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 app-text-muted sm:text-lg">
            Fast, low-fee internal exchange powered by the protocol. The page stays consistent with the active theme while keeping the flow simple across desktop, tablet and mobile.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="app-panel rounded-3xl p-5">
              <ShieldIcon className="app-gold h-5 w-5" />
              <div className="mt-4 text-sm font-semibold app-text">Fee included</div>
              <div className="mt-2 text-sm app-text-muted">
                The quote card makes cost expectation visible before submit.
              </div>
            </div>
            <div className="app-panel rounded-3xl p-5">
              <ChartIcon className="app-accent h-5 w-5" />
              <div className="mt-4 text-sm font-semibold app-text">Estimate first</div>
              <div className="mt-2 text-sm app-text-muted">
                Enter amount, watch the preview update, then confirm.
              </div>
            </div>
            <div className="app-panel rounded-3xl p-5">
              <ArrowRightIcon className="h-5 w-5 app-text" />
              <div className="mt-4 text-sm font-semibold app-text">
                PSPN to UFC flow
              </div>
              <div className="mt-2 text-sm app-text-muted">
                Clear route, clear output, stronger confidence.
              </div>
            </div>
          </div>
        </div>

        <SwapPanel />
      </section>

      <section className="app-card rounded-[2rem] p-4 sm:p-6">
        <div className="app-divider flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-end">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] app-text-subtle">
              External market depth
            </div>
            <div className="mt-2 font-display text-2xl font-semibold app-text">
              Need broader routing after the internal quote?
            </div>
            <div className="mt-2 max-w-2xl text-sm leading-7 app-text-muted">
              The external market widget stays available as a secondary option,
              but it no longer overwhelms the page or hides the protocol value.
            </div>
          </div>
          <a
            href={marketUrl}
            target="_blank"
            rel="noreferrer"
            className="app-secondary-btn inline-flex min-h-[48px] items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
          >
            Open external route
            <ArrowRightIcon className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-4 overflow-hidden rounded-[1.75rem] border border-[color:var(--app-border)] bg-[color:var(--app-panel-strong)]">
          <iframe
            src={marketUrl}
            title="Piteas market route"
            className="h-[30rem] w-full border-0"
          />
        </div>
      </section>
    </div>
  );
};

export default Swap;
