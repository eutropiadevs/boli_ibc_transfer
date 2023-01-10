import { comdex, ibcDenoms } from "../config/network";
import { commaSeparator, getExponent } from "./number";
import { ibcDenomToDenom, lowercaseFirstLetter } from "./string";

export const getAmount = (selectedAmount, coinDecimals) =>
  (selectedAmount * (coinDecimals || 10 ** comdex.coinDecimals)).toFixed(0).toString();

export const amountConversionWithComma = (amount, decimals, chainDecimals) => {

  const result = Number(amount) / (chainDecimals || 10 ** comdex.coinDecimals);

  return commaSeparator(result.toFixed(decimals || comdex.coinDecimals));
};

export const amountConversion = (amount, decimals, chainDecimals) => {
  const result = Number(amount) / (chainDecimals || 10 ** comdex.coinDecimals);
  return result.toFixed(decimals || comdex.coinDecimals);
};


export const convertScientificNumberIntoDecimal = (x) => {
  if (Math.abs(x) < 1.0) {
    var e = parseInt(x.toString().split('e-')[1]);
    if (e) {
      x *= Math.pow(10, e - 1);
      x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
    }
  } else {
    var e = parseInt(x.toString().split('+')[1]);
    if (e > 20) {
      e -= 20;
      x /= Math.pow(10, e);
      x += (new Array(e + 1)).join('0');
    }
  }
  return x;
}


export const orderPriceConversion = (amount) => {
  let result = Number(amount) * 10 ** 18;
  result = convertScientificNumberIntoDecimal(result);
  return result.toString();
};

export const orderPriceReverseConversion = (amount) => {
  const result = Number(amount) / 10 ** 18;
  return result.toFixed(comdex.coinDecimals).toString();
};

export const denomConversion = (denom) => {
  if (denom === "weth-wei") {
    return "WETH";
  }
  if (denom === "wbtc-satoshi" || denom === ibcDenoms["wbtc-satoshi"]) {
    return "WBTC";
  }

  if (denom === "stuatom" || denom === ibcDenoms["stuatom"]) {
    return "stATOM";
  }

  if (denom && denom.substr(0, 1) === "u") {
    if (
      denom &&
      denom.substr(0, 2) === "uc" &&
      !(denom.substr(0, 3) === "ucm")
    ) {
      return (
        denom.substr(1, denom.length) &&
        lowercaseFirstLetter(denom.substr(1, denom.length))
      );
    }
    return (
      denom.substr(1, denom.length) &&
      denom.substr(1, denom.length).toUpperCase()
    );
  } else {
    if (denom && denom.substr(0, 3) === "ibc") {
      const voucherDenom = ibcDenomToDenom(denom);

      return voucherDenom.substr(1, voucherDenom.length).toUpperCase();
    }

    return denom;
  }
};

export const getDenomBalance = (balances, denom) =>
  balances &&
  balances.length > 0 &&
  balances.find((item) => item.denom === denom) &&
  balances.find((item) => item.denom === denom).amount;


export const commaSeparatorWithRounding = (amount, round) => {
  return commaSeparator(amount.toFixed(getExponent(round)));
};