import React, { useEffect } from "react";
import { createStore, combineReducers, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import { StyleSheet } from "react-native";
import NavigationContainer from "./Navigation/NavigationContainer";
import servicesReducer from "./store/reducers/services";
import authReducer from "./store/reducers/auth";
import { getLoginCreditials } from "./store/actions/auth";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import { initDB } from "./db";
import useAppState from "react-native-appstate-hook";

const middleware = [thunk];
const rootReducer = combineReducers({
  auth: authReducer,
  services: servicesReducer
});

initDB();

const store = createStore(
  rootReducer,
  {},
  composeWithDevTools(applyMiddleware(...middleware))
);

export default function App() {
  useEffect(() => {
    store.dispatch(getLoginCreditials());
  }, []);
  const { appState } = useAppState({
    onChange: newAppState => console.log("App state changed to ", newAppState),
    onForeground: () => console.log("App went to Foreground"),
    onBackground: () => console.log("App went to background")
  });

  return (
    <Provider store={store}>
      <NavigationContainer />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
