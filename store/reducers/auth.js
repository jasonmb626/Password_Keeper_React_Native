import {
  CLEAR_CREDENTIALS,
  SET_CREDENTIALS,
  SET_MISSING_CREDENTIALS,
  SET_AUTHENTICATED,
  CLEAR_AUTHENTICATED
} from "../actions/auth";

const initialState = {
  username: null,
  password: null,
  missingCredentials: false,
  loading: true,
  authenticated: false
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_CREDENTIALS:
      return {
        username: action.username,
        password: action.password,
        missingCredentials: false,
        loading: false,
        authenticated: false
      };
    case CLEAR_CREDENTIALS:
      return {
        username: null,
        password: null,
        missingCredentials: true,
        loading: false,
        authenticated: false
      };
    case SET_MISSING_CREDENTIALS:
      return {
        username: null,
        password: null,
        missingCredentials: true,
        loading: false,
        authenticated: false
      };
    case SET_AUTHENTICATED:
      return {
        ...state,
        authenticated: true
      };
    case CLEAR_AUTHENTICATED:
      return {
        ...state,
        authenticated: false
      };
    default:
      return state;
  }
};
