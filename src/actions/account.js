import { ACCOUNT_ADDRESS_SET, ACCOUNT_NAME_SET } from "../constants/account";

export const setAccountAddress = (value) => {
    return {
      type: ACCOUNT_ADDRESS_SET,
      value,
    };
  };
  
  export const setAccountName = (value) => {
    return {
      type: ACCOUNT_NAME_SET,
      value,
    };
  };