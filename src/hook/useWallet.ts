import { useEffect, useSyncExternalStore } from "react";
import { AppConfig, ChainConfig } from "../config/config";

type ConnectOptions = {
  autoSelect?: {
    label: string;
    disableModals: boolean;
  };
};

type DisconnectOptions = {
  label: string;
};

type WalletState = {
  label: string;
  provider: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  };
  accounts: Array<{ address: string }>;
  chains: Array<{ id: string }>;
};

type OnboardAPI = {
  connectWallet: (options?: ConnectOptions) => Promise<WalletState[]>;
  disconnectWallet: (options: DisconnectOptions) => Promise<WalletState[]>;
  state: {
    get: () => { wallets: WalletState[] };
    select: (
      key: "wallets"
    ) => {
      subscribe: (
        callback: (wallets: WalletState[]) => void
      ) => { unsubscribe: () => void };
    };
  };
};

type WalletSnapshot = {
  wallet: WalletState | null;
  account: string;
  isConnected: boolean;
  isConnecting: boolean;
};

const LAST_WALLET_KEY = "pspn:last-wallet-label";

const listeners = new Set<() => void>();

let snapshot: WalletSnapshot = {
  wallet: null,
  account: "",
  isConnected: false,
  isConnecting: false,
};

let onboardPromise: Promise<OnboardAPI> | null = null;
let walletSubscription: { unsubscribe: () => void } | null = null;
let restoreScheduled = false;

const emit = () => {
  listeners.forEach((listener) => listener());
};

const updateSnapshot = (next: Partial<WalletSnapshot>) => {
  snapshot = { ...snapshot, ...next };
  emit();
};

const getSnapshot = () => snapshot;

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

const syncWalletState = (wallet: WalletState | null) => {
  const account = wallet?.accounts[0]?.address ?? "";

  if (typeof window !== "undefined") {
    (window as Window & { provider?: unknown }).provider = wallet?.provider ?? null;

    if (wallet) {
      window.localStorage.setItem(LAST_WALLET_KEY, wallet.label);
    } else {
      window.localStorage.removeItem(LAST_WALLET_KEY);
    }
  }

  updateSnapshot({
    wallet,
    account,
    isConnected: Boolean(wallet),
  });
};

const getChainIdHex = () => `0x${ChainConfig.chainId.toString(16)}`;

const loadOnboard = async () => {
  if (onboardPromise) {
    return onboardPromise;
  }

  onboardPromise = (async () => {
    const [
      { init },
      { default: coinbaseWalletModule },
      { default: injectedModule },
      { default: trustModule },
    ] = await Promise.all([
      import("@web3-onboard/react"),
      import("@web3-onboard/coinbase"),
      import("@web3-onboard/injected-wallets"),
      import("@web3-onboard/trust"),
    ]);

    const onboard = init({
      chains: [
        {
          id: getChainIdHex(),
          token: ChainConfig.chainSymbol,
          label: ChainConfig.chainName,
          rpcUrl: ChainConfig.providerList[0],
        },
      ],
      wallets: [injectedModule(), trustModule(), coinbaseWalletModule()],
      connect: {
        autoConnectAllPreviousWallet: false,
        autoConnectLastWallet: false,
      },
      accountCenter: {
        desktop: { enabled: false },
        mobile: { enabled: false },
      },
      appMetadata: {
        name: AppConfig.title,
        description: AppConfig.title,
      },
      disableFontDownload: true,
      theme: "dark",
    });

    if (!walletSubscription) {
      walletSubscription = onboard.state
        .select("wallets")
        .subscribe((wallets: WalletState[]) => {
          syncWalletState(wallets[0] ?? null);
        });
    }

    syncWalletState(onboard.state.get().wallets[0] ?? null);

    return onboard;
  })().catch((error) => {
    onboardPromise = null;
    throw error;
  });

  return onboardPromise;
};

const connectWallet = async (options?: ConnectOptions) => {
  updateSnapshot({ isConnecting: true });

  try {
    const onboard = await loadOnboard();
    const wallets = await onboard.connectWallet(options);
    syncWalletState(wallets[0] ?? null);
    return wallets;
  } finally {
    updateSnapshot({ isConnecting: false });
  }
};

const disconnectWallet = async (options?: DisconnectOptions) => {
  const label = options?.label ?? snapshot.wallet?.label;

  if (!label) {
    syncWalletState(null);
    return [];
  }

  updateSnapshot({ isConnecting: true });

  try {
    const onboard = await loadOnboard();
    const wallets = await onboard.disconnectWallet({ label });
    syncWalletState(wallets[0] ?? null);
    return wallets;
  } finally {
    updateSnapshot({ isConnecting: false });
  }
};

const restoreWallet = async () => {
  if (typeof window === "undefined") {
    return;
  }

  const label = window.localStorage.getItem(LAST_WALLET_KEY);

  if (!label) {
    return;
  }

  try {
    await connectWallet({
      autoSelect: {
        disableModals: true,
        label,
      },
    });
  } catch {
    window.localStorage.removeItem(LAST_WALLET_KEY);
  }
};

const scheduleRestore = () => {
  if (restoreScheduled || typeof window === "undefined") {
    return;
  }

  restoreScheduled = true;

  if (!window.localStorage.getItem(LAST_WALLET_KEY)) {
    return;
  }

  const startRestore = () => {
    void restoreWallet();
  };

  const idleWindow = window as Window & {
    requestIdleCallback?: (
      callback: () => void,
      options?: { timeout: number }
    ) => number;
  };

  if (typeof idleWindow.requestIdleCallback === "function") {
    idleWindow.requestIdleCallback(startRestore, { timeout: 2500 });
    return;
  }

  window.setTimeout(startRestore, 1500);
};

const useWallet = () => {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    scheduleRestore();
  }, []);

  return {
    ...state,
    connectWallet,
    disconnectWallet,
  };
};

export default useWallet;
