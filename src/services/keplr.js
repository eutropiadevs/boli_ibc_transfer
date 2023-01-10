import {
  AccountSetBase,
  ChainStore,
  getKeplrFromWindow
} from "@keplr-wallet/stores";
import { cmst, comdex, harbor } from "../config/network";

export const contractAddress = process.env.REACT_APP_GOVERNANCE_CONTRACT;
export const lockingContractAddress = process.env.REACT_APP_LOCKING_CONTRACT;
export const airdropContractAddress = process.env.REACT_APP_AIRDROP_CONTRACT;

const getCurrencies = (chain) => {
  if (chain?.rpc === comdex?.rpc) {
    return [
      {
        coinDenom: chain?.coinDenom,
        coinMinimalDenom: chain?.coinMinimalDenom,
        coinDecimals: chain?.coinDecimals,
        coinGeckoId: chain?.coinGeckoId,
      },
      {
        coinDenom: cmst?.coinDenom,
        coinMinimalDenom: cmst?.coinMinimalDenom,
        coinDecimals: cmst?.coinDecimals,
      },
      {
        coinDenom: harbor?.coinDenom,
        coinMinimalDenom: harbor?.coinMinimalDenom,
        coinDecimals: harbor?.coinDecimals,
      },
    ];
  } else {
    return [
      {
        coinDenom: chain?.coinDenom,
        coinMinimalDenom: chain?.coinMinimalDenom,
        coinDecimals: chain?.coinDecimals,
        coinGeckoId: chain?.coinGeckoId,
      },
    ];
  }
};


const getFeatures = (chain) => {
  if (chain?.coinDenom === "INJ") {
    return ([
      "ibc-transfer",
      "ibc-go",
      "eth-address-gen",
      "eth-key-sign"
    ])
  }
}

export const getChainConfig = (chain = comdex) => {
  return {
    chainId: chain?.chainId,
    chainName: chain?.chainName,
    rpc: chain?.rpc,
    rest: chain?.rest,
    stakeCurrency: {
      coinDenom: chain?.coinDenom,
      coinMinimalDenom: chain?.coinMinimalDenom,
      coinDecimals: chain?.coinDecimals,
      coinGeckoId: chain?.coinGeckoId,
    },
    walletUrlForStaking: chain?.walletUrlForStaking,
    bip44: {
      coinType: chain?.coinType,
    },
    bech32Config: {
      bech32PrefixAccAddr: `${chain?.prefix}`,
      bech32PrefixAccPub: `${chain?.prefix}pub`,
      bech32PrefixValAddr: `${chain?.prefix}valoper`,
      bech32PrefixValPub: `${chain?.prefix}valoperpub`,
      bech32PrefixConsAddr: `${chain?.prefix}valcons`,
      bech32PrefixConsPub: `${chain?.prefix}valconspub`,
    },
    currencies: getCurrencies(chain),
    feeCurrencies: [
      {
        coinDenom: chain?.coinDenom,
        coinMinimalDenom: chain?.coinMinimalDenom,
        coinDecimals: chain?.coinDecimals,
        coinGeckoId: chain?.coinGeckoId,
        gasPriceStep: {
          low: 0.01,
          average: 0.025,
          high: 0.04,
        },
      },
    ],
    features: getFeatures(chain),
    coinType: chain?.coinType,
  };
};

export const initializeChain = (callback) => {
  (async () => {
    if (!window.getOfflineSignerAuto || !window.keplr) {
      const error = "Please install keplr extension";
      callback(error);
    } else {
      if (window.keplr.experimentalSuggestChain) {
        try {
          await window.keplr.experimentalSuggestChain(getChainConfig());
          const offlineSigner = await window.getOfflineSignerAuto(
            comdex?.chainId
          );
          const accounts = await offlineSigner.getAccounts();

          callback(null, accounts[0]);
        } catch (error) {
          callback(error?.message);
        }
      } else {
        const versionError = "Please use the recent version of keplr extension";
        callback(versionError);
      }
    }
  })();
};

export const magicInitializeChain = (networkChain, callback) => {
  (async () => {
    if (!window.getOfflineSignerAuto || !window.keplr) {
      const error = "Please install keplr extension";
      callback(error);
    } else {
      if (window.keplr.experimentalSuggestChain) {
        try {
          await window.keplr.experimentalSuggestChain(
            getChainConfig(networkChain)
          );
          const offlineSigner = await window.getOfflineSignerAuto(
            networkChain?.chainId
          );
          const accounts = await offlineSigner.getAccounts();

          callback(null, accounts[0]);
        } catch (error) {
          callback(error?.message);
        }
      } else {
        const versionError = "Please use the recent version of keplr extension";
        callback(versionError);
      }
    }
  })();
};

export const initializeIBCChain = (config, callback) => {
  (async () => {
    if (!window.getOfflineSignerAuto || !window.keplr) {
      const error = "Please install keplr extension";

      callback(error);
    } else {
      if (window.keplr.experimentalSuggestChain) {
        try {
          await window.keplr.experimentalSuggestChain(config);
          const offlineSigner = await window.getOfflineSignerAuto(
            config?.chainId
          );
          const accounts = await offlineSigner.getAccounts();
          callback(null, accounts[0]);
        } catch (error) {
          callback(error?.message);
        }
      } else {
        const versionError = "Please use the recent version of keplr extension";
        callback(versionError);
      }
    }
  })();
};

export const fetchKeplrAccountName = async () => {
  const chainStore = new ChainStore([getChainConfig()]);

  const accountSetBase = new AccountSetBase(
    {
      // No need
      addEventListener: () => {},
      removeEventListener: () => {},
    },
    chainStore,
    comdex?.chainId,
    {
      suggestChain: false,
      autoInit: true,
      getKeplr: getKeplrFromWindow,
    }
  );

  // Need wait some time to get the Keplr.
  await (() => {
    return new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  })();

  return accountSetBase?.name;
};
export const KeplrWallet = async (chainID = comdex?.chainId) => {
  await window.keplr.enable(chainID);
  const offlineSigner = await window.getOfflineSignerAuto(chainID);
  const accounts = await offlineSigner.getAccounts();
  return [offlineSigner, accounts];
};
