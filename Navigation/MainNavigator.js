import React from "react";
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";

import ServiceListScreen from "../Screens/ServiceListScreen";
import AddEditServiceScreen from "../Screens/AddEditServiceScreen";
import LoginScreen from "../Screens/LoginScreen";

const MainNavigator = createStackNavigator({
  Login: LoginScreen,
  ServiceList: ServiceListScreen,
  AddEditService: AddEditServiceScreen
});

export default createAppContainer(MainNavigator);
