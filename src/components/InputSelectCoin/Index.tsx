import React from "react";
import { SwapTokens } from "../../config/config";

interface InputSelectCoinProps {
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  selectedToken: number;
  handleChangeAmount: (e: React.ChangeEvent<HTMLInputElement>) => void;
  amount: string;
  inputEnabled: boolean;
}

const InputSelectCoin: React.FC<InputSelectCoinProps> = ({
  handleChange,
  selectedToken,
  handleChangeAmount,
  amount,
  inputEnabled,
}) => {
  const selectedTokenInfo =
    selectedToken >= 0 ? SwapTokens[selectedToken] : undefined;

  return (
    <div className="app-field rounded-[1.75rem] p-4">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.0000"
            onChange={handleChangeAmount}
            value={amount}
            disabled={!inputEnabled}
            className="app-text w-full bg-transparent text-3xl font-semibold outline-none placeholder:text-[color:var(--app-text-subtle)] disabled:cursor-not-allowed disabled:text-[color:var(--app-text-subtle)]"
          />
          <div className="app-text-subtle mt-2 text-xs uppercase tracking-[0.24em]">
            Quote updates while you type
          </div>
        </div>

        <div className="relative">
          <select
            value={selectedToken}
            onChange={handleChange}
            className="app-secondary-btn appearance-none rounded-2xl py-3 pl-4 pr-11 text-sm font-semibold outline-none transition"
          >
            {SwapTokens.map((swapToken, index) => (
              <option key={swapToken.address} value={index} className="bg-slate-900">
                {swapToken.name}
              </option>
            ))}
          </select>
          <div className="app-text-subtle pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 0 1 1.08 1.04l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="app-panel mt-4 flex items-center gap-3 rounded-2xl px-3 py-2">
        <img
          src={`/assets/tokens/${selectedTokenInfo?.logo ?? "pspn-96.png"}`}
          alt={selectedTokenInfo?.name ?? "Token"}
          decoding="async"
          height={96}
          loading="lazy"
          className="h-10 w-10 rounded-2xl object-cover"
          width={96}
        />
        <div>
          <div className="app-text text-sm font-semibold">
            {selectedTokenInfo?.name ?? "Choose token"}
          </div>
          <div className="app-text-subtle text-xs uppercase tracking-[0.22em]">
            Internal protocol route
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputSelectCoin;
