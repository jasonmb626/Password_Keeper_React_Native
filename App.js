import React, { useState } from "react";
import { createStore, combineReducers, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import { AppLoading } from "expo";
import MainNavigator from "./Navigation/MainNavigator";
import servicesReducer from "./store/reducers/services";
import authReducer from "./store/reducers/auth";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import { initDB, seedData } from "./db";
import useAppState from "react-native-appstate-hook";
import { getLoginCreditials, clearAuthenticated } from "./store/actions/auth";

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
      <MainNavigator />
    </Provider>
  );
}
