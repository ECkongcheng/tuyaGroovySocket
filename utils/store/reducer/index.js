import { combineReducers } from "../../../libs/redux";

export default combineReducers({ 
  foo: function (state = null, action) {
    switch (action.type) {
        case 'MY_ACTION_TYPE':
          return action.payload
    }
    return state;
  }
});