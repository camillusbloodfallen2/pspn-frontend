import { ChainConfig } from "../config/config";

type WalletProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

const chainIdHex = `0x${ChainConfig.chainId.toString(16)}`;

export const switchNetwork = async (provider: WalletProvider) => {
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });

    return true;
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902 || switchError.code === -32603) {
      try {
        await addNetwork(provider);
        return true;
      } catch (error) {
        alert(error);
        return false;
      }
    }
    return false;
  }
};

export const addNetwork = async (provider: WalletProvider) => {
  await provider.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: chainIdHex,
        chainName: ChainConfig.chainName,
        nativeCurrency: {
          name: "PulseChain",
          symbol: ChainConfig.chainSymbol,
          decimals: 18,
        },
        rpcUrls: [ChainConfig.providerList[0]],
        blockExplorerUrls: [ChainConfig.explorerUrl],
      },
    ],
  });
};
