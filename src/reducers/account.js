import { ACCOUNT_ADDRESS_SET } from '../constants/account';

import { combineReducers } from "redux";

const address = (state = "", action) => {
    if (action.type === ACCOUNT_ADDRESS_SET) {
        return action.value;
    }

    return state;
};

export default combineReducers({
    address,
});
