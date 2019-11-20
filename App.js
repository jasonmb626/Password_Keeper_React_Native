import React, { useState } from "react";
import { createStore, combineReducers, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import { StyleSheet } from "react-native";
import { AppLoading } from "expo";
import NavigationContainer from "./Navigation/NavigationContainer";
import servicesReducer from "./store/reducers/services";
import authReducer from "./store/reducers/auth";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import { initDB, seedData } from "./db";
import useAppState from "react-native-appstate-hook";
import { getLoginCreditials, clearAuthenticated } from "./store/actions/auth";
import { clearServices } from "./store/actions/services";

const middleware = [thunk];
const rootReducer = combineReducers({
  auth: authReducer,
  services: servicesReducer
});

initDB();
//seedData();

const store = createStore(
  rootReducer,
  {},
  composeWithDevTools(applyMiddleware(...middleware))
);

export default function App() {
  const [loading, setLoading] = useState(true);
  const { appState } = useAppState({
    onForeground: async () => {
      await store.dispatch(clearAuthenticated());
      setLoading(true);
    }
  });

  if (loading) {
    return (
      <AppLoading
        startAsync={() => store.dispatch(getLoginCreditials())}
        onFinish={() => {
          setLoading(false);
        }}
      />
    );
  }

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
