import {
  setLoginCredentialsToDB,
  clearLoginCredentialsFromDB,
  getLoginCredentialsFromDB
} from "../../db";
import { createAppContainer } from "react-navigation";

export const SET_CREDENTIALS = "SET_CREDENTIALS";
export const CLEAR_CREDENTIALS = "CLEAR_CREDENTIALS";
export const SET_MISSING_CREDENTIALS = "SET_MISSING_CREDENTIALS";

export const login = (username, password) => async dispatch => {
  await setLoginCredentialsToDB(username, password);
  dispatch({ type: SET_CREDENTIALS, username, password });
};

export const logout = () => async dispatch => {
  await clearLoginCredentialsFromDB();
  return { type: CLEAR_CREDENTIALS };
};

export const getLoginCreditials = () => async dispatch => {
  console.log("Fetching credentials");
  try {
    const credentials = await getLoginCredentialsFromDB();
    console.log("Displaying credentials");
    console.log(credentials);
    console.log("Displayed credentials");
  } catch (err) {
    //console.log(err);
    console.log("No login credentials");
    return { type: SET_MISSING_CREDENTIALS };
  }
};
