import { MARKET_LIST_SET, SET_COINGEKO_PRICE, SET_CSWAP_API_PRICE } from "../constants/oracle";

export const setMarkets = (list, pagination) => {
  const map = list.reduce((map, obj) => {
    map[obj?.assetId] = obj;
    return map;
  }, {});

  return {
    type: MARKET_LIST_SET,
    map,
    pagination,
  };
};

export const setCoingekoPrice = (value) => {
  return {
    type: SET_COINGEKO_PRICE,
    value,
  };
};

export const setCswapApiPrice = (list) => {
  const priceMap = list?.reduce((map, obj) => {
    map[obj?.denom] = obj;
    return map;
  }, {});
  return {
    type: SET_CSWAP_API_PRICE,
    priceMap,
  };
};