import { Decimal } from "@cosmjs/math";
import { ibcDenoms } from "../config/network";
import { DOLLAR_DECIMALS } from "../constants/common";
import { denomToCoingeckoTokenId } from "./string";

export const formatNumber = (number) => {
  if (number >= 1000 && number < 1000000) {
    return (number / 1000).toFixed(DOLLAR_DECIMALS) + "K";
  } else if (number >= 1000000) {
    return (number / 1000000).toFixed(DOLLAR_DECIMALS) + "M";
  } else if (number < 1000) {
    return number;
  }
};

export const commaSeparator = (value) => {
  const array = value.toString().split(".");
  const stringWithComma = array[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (array[1]) {
    return stringWithComma.concat(".", array[1]);
  }

  return stringWithComma;
};

export const decimalConversion = (data) => {
  return Decimal.fromAtomics(data || "0", 18).toString();
};

export const truncateToDecimals = (num, dec = 2) => {
  const calcDec = Math.pow(10, dec);
  return Math.trunc(num * calcDec) / calcDec;
};

export const marketPrice = (marketsMap, denom, assetId, coinGeckoPrice, cswapPrice) => {
  const value = marketsMap?.map[assetId]
  if (denom === "ucmst") {
    return 1;
  }

  if (denom === ibcDenoms["uusdc"]) {
    return 1;
  }

  if (value && value?.twa && value?.isPriceActive) {
    return value?.twa?.toNumber() / 1000000;
  }


  return 0;
};

export const calculateROI = (principal, interestRate, years, months, days) => {
  const earns =
    Number(principal) *
    (1 + Number(interestRate) / 100) **
    (Number(years) + Number(months) / 12 + Number(days) / 365);
  if (earns) {
    return earns.toFixed(DOLLAR_DECIMALS);
  } else {
    return 0;
  }
};

export const getAccountNumber = (value) => {
  return value === "" ? "0" : value;
};

export const getExponent = (number) => {
  let count = 0;
  while (number > 1) {
    number = number / 10;
    count++;
  }

  return count;
};
