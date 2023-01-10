import { sha256, stringToPath } from "@cosmjs/crypto";
import moment from "moment";
import { comdex, ibcDenoms } from "../config/network";
import { denomConversion } from "./coin";

const encoding = require("@cosmjs/encoding");

export const decode = (hash) =>
  decodeURIComponent(hash.replace("#", "")) || undefined;

export const generateHash = (txBytes) =>
  encoding.toHex(sha256(txBytes)).toUpperCase();

export const ibcDenomToDenom = (key) => {
  switch (key) {

    case ibcDenoms["uatom"]:
      return "uatom";
    case ibcDenoms["uosmo"]:
      return "uosmo";
    case ibcDenoms["uusdc"]:
      return "USDC";
    case ibcDenoms["weth-wei"]:
      return "WETH";
    case ibcDenoms["ujuno"]:
      return "ujuno";
    case ibcDenoms["wbtc-satoshi"]:
      return "wbtc-satoshi";
    case ibcDenoms["stuatom"]:
      return "stuatom";
    default:
      return "";
  }
};

// For getIcon From extendedPair name 
export const symbolToDenom = (key) => {
  switch (key) {
    case "atom":
    case ibcDenoms["uatom"]:
      return "uatom";
    case "osmo":
    case ibcDenoms["uosmo"]:
      return "uosmo";
    case "juno":
    case ibcDenoms["ujuno"]:
      return "ujuno";
    case "usdc":
    case ibcDenoms["uusdc"]:
      return "uusdc";
    case "weth":
    case ibcDenoms["weth-wei"]:
      return "weth-wei";
    case "wbtc-satoshi" || "wbtc":
    case ibcDenoms["wbtc-satoshi"]:
      return "wbtc-satoshi";
    case "stuatom":
    case ibcDenoms["stuatom"]:
      return "stuatom";
    case "cmdx":
      return "ucmdx";
    case "cmst":
      return "ucmst";
    case "harbor":
      return "uharbor";
    default:
      return "";
  }
};

export const denomToSymbol = (key) => {
  switch (key) {
    case "uatom":
    case ibcDenoms["uatom"]:
      return "ATOM";
    case "uosmo":
    case ibcDenoms["uosmo"]:
      return "OSMO";
    case "ucmdx":
      return "CMDX";
    case "ucmst":
      return "CMST";
    case "uharbor":
      return "HARBOR";
    case "uusdc":
    case ibcDenoms["uusdc"]:
      return "USDC";
    case "ujuno":
    case ibcDenoms["ujuno"]:
      return "JUNO";
    case "weth-wei":
    case "uweth":
    case ibcDenoms["weth-wei"]:
      return "WETH";
    case "wbtc-satoshi":
    case ibcDenoms["wbtc-satoshi"]:
      return "WBTC";
    case "stuatom":
    case ibcDenoms["stuatom"]:
      return "stATOM";
    default:
      return "";
  }
};
export const denomToCoingeckoTokenId = (key) => {
  switch (key) {
    case "uatom":
    case ibcDenoms["uatom"]:
      return "cosmos";
    case "uosmo":
    case ibcDenoms["uosmo"]:
      return "osmosis";
    case "ucmdx":
      return "comdex";
    case "uusdc":
    case ibcDenoms["uusdc"]:
      return "axlusdc";
    case "weth-wei":
    case "uweth":
    case ibcDenoms["weth-wei"]:
      return "axlweth";
    default:
      return "";
  }
};

export const minimalDenomToDenom = (key) => {
  switch (key) {
    case "uatom":
    case ibcDenoms["uatom"]:
      return "atom";
    case "udvpn":
      return "dvpn";
    case "uxprt":
    case ibcDenoms["uxprt"]:
      return "xprt";
    case "uosmo":
    case ibcDenoms["uosmo"]:
      return "osmo";
    case "ujuno":
    case ibcDenoms["ujuno"]:
      return "juno";
    case "ucmdx":
      return "cmdx";
    default:
      return "";
  }
};

export const iconNameFromDenom = (key) => {
  switch (key) {
    case "uatom":
    case ibcDenoms["uatom"]:
      return "atom-icon";
    case "ucmdx":
      return "comdex-icon";
    case "uxprt":
      return "xprt-icon";
    case "uosmo":
    case ibcDenoms["uosmo"]:
      return "osmosis-icon";
    case "ucmst":
      return "cmst-icon";
    case "uharbor":
      return "harbor-icon";
    case "uusdc":
    case ibcDenoms["uusdc"]:
      return "usdc-icon";
    case "ujuno":
    case ibcDenoms["ujuno"]:
      return "juno-icon";
    case "weth-wei":
    case "uweth":
    case ibcDenoms["weth-wei"]:
      return "weth-icon";
    case "wbtc-satoshi":
    case ibcDenoms["wbtc-satoshi"]:
      return "wbtc-icon";
    case "stuatom":
    case ibcDenoms["stuatom"]:
      return "statom-icon";
    default:
      return "";
  }
};

export const orderStatusText = (key) => {
  switch (key) {
    case 0:
      return "UNSPECIFIED";
    case 1:
      return "NOT EXECUTED";
    case 2:
      return "NOT MATCHED";
    case 3:
      return "PARTIALLY MATCHED";
    case 4:
      return "COMPLETED";
    case 5:
      return "CANCELED";
    case 6:
      return "EXPIRED";
    default:
      return "";
  }
};

export const trimWhiteSpaces = (data) => data.split(" ").join("");

export const truncateString = (string, front, back) =>
  `${string.substr(0, front)}...${string.substr(
    string.length - back,
    string.length
  )}`;

export const lowercaseFirstLetter = (string) => {
  return string.charAt(0).toLowerCase() + string.slice(1).toUpperCase();
};

//Considering input with given decimal point only.
export const toDecimals = (value, decimal = comdex.coinDecimals) =>
  value.indexOf(".") >= 0
    ? value.substr(0, value.indexOf(".")) +
    value.substr(value.indexOf("."), decimal + 1)
    : value;

export const showUserAssetCount = (assetShare, denom) => {
  return `${assetShare} ${denomConversion(denom) || ""}`;
};

export const uniqueDenoms = (list, type) => {
  return [
    ...new Set(
      list && list.length > 0
        ? list.map((item) => (type === "in" ? item.denomIn : item.denomOut))
        : []
    ),
  ];
};

export const uniqueLiquidityPairDenoms = (list, type) => {
  return [
    ...new Set(
      list && list.length > 0
        ? list.map((item) =>
          type === "in" ? item.baseCoinDenom : item.quoteCoinDenom
        )
        : []
    ),
  ];
};

export const uniqueQuoteDenomsForBase = (list, type, denom) => {
  const quoteList =
    list && list.length > 0
      ? list.filter((item) =>
        type === "in"
          ? item.baseCoinDenom === denom
          : item.quoteCoinDenom === denom
      )
      : [];

  const quoteMap = quoteList.map((item) =>
    type === "in" ? item.quoteCoinDenom : item.baseCoinDenom
  );

  return [...new Set(quoteMap)];
};

export const makeHdPath = (
  accountNumber = "0",
  addressIndex = "0",
  coinType = comdex.coinType
) => {
  return stringToPath(
    "m/44'/" + coinType + "'/" + accountNumber + "'/0/" + addressIndex
  );
};

export const unixToGMTTime = (time) => {
  let newTime = Math.floor(time / 1000000000);
  var timestamp = moment.unix(newTime);
  timestamp = timestamp.format("DD/MMMM/YYYY")
  return timestamp;
}

export const stringTagParser = input => {
  const lines = input.split('\n')
  const output = []
  lines.forEach((d, i) => {
    if (i > 0) {
      output.push(<br />)
    }
    output.push(d)
  })
  return output
}