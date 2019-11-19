import React from 'react';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { StyleSheet, Text, View } from 'react-native';
import NavigationContainer from './Navigation/NavigationContainer';
import servicesReducer from './store/reducers/services';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { init, seedData, printServices } from './db';

const middleware = [thunk];
const rootReducer = combineReducers({
  services: servicesReducer
});

init();

const store = createStore(rootReducer, {}, composeWithDevTools(applyMiddleware(...middleware)));

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
