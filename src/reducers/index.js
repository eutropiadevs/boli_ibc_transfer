import { combineReducers } from "redux";
import account from "./account";

const app = combineReducers({
    account,
});

const root = (state, action) => {
    if (action.type === "ACCOUNT_ADDRESS_SET" && action.value === "") {
        state.account = undefined; //explicitly clearing account data
    }
    return app(state, action);
};

export default root;
