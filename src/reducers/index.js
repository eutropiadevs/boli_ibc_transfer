import { combineReducers } from "redux";


const app = combineReducers({

});

const root = (state, action) => {
    if (action.type === "ACCOUNT_ADDRESS_SET" && action.value === "") {
        state.account = undefined; //explicitly clearing account data
    }
    return app(state, action);
};

export default root;
