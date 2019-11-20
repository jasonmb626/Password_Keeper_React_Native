import {
  setLoginCredentialsToDB,
  clearLoginCredentialsFromDB,
  getLoginCredentialsFromDB
} from "../../db";

export const SET_CREDENTIALS = "SET_CREDENTIALS";
export const CLEAR_CREDENTIALS = "CLEAR_CREDENTIALS";
export const SET_MISSING_CREDENTIALS = "SET_MISSING_CREDENTIALS";
export const SET_AUTHENTICATED = "SET_AUTHENTICATED";
export const CLEAR_AUTHENTICATED = "CLEAR_AUTHENTICATED";
export const UPDATE_PASSWORD = "UPDATE_PASSWORD";

export const login = (username, password) => async dispatch => {
  await setLoginCredentialsToDB(username, password);
  dispatch({ type: SET_CREDENTIALS, username, password });
};

export const logout = () => async dispatch => {
  await clearLoginCredentialsFromDB();
  dispatch({ type: CLEAR_CREDENTIALS });
};

export const setAuthenticated = () => async dispatch => {
  dispatch({ type: SET_AUTHENTICATED });
};

export const clearAuthenticated = () => async dispatch => {
  dispatch({ type: CLEAR_AUTHENTICATED });
};

export const getLoginCreditials = () => async dispatch => {
  try {
    const credentials = await getLoginCredentialsFromDB();
    dispatch({
      type: SET_CREDENTIALS,
      username: credentials.email,
      password: credentials.password
    });
  } catch (err) {
    dispatch({ type: SET_MISSING_CREDENTIALS });
  }
};
