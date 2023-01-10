import { combineReducers } from "redux";
import { MARKET_LIST_SET, SET_COINGEKO_PRICE, SET_CSWAP_API_PRICE } from "../constants/oracle";

const market = (
  state = {
    map: {},
    pagination: {},
    coingekoPrice: {},
    cswapApiPrice: {},
  },
  action
) => {
  switch (action.type) {
    case MARKET_LIST_SET:
      return {
        ...state,
        map: action.map,
        pagination: action.pagination,
      };
    case SET_COINGEKO_PRICE:
      return {
        ...state,
        coingekoPrice: action.value,
      };
    case SET_CSWAP_API_PRICE:
      return {
        ...state,
        cswapApiPrice: action.priceMap,
      };
    default:
      return state;
  }

};

export default combineReducers({
  market,
});
