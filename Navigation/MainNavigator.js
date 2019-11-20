import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";

import ServiceListScreen from "../Screens/ServiceListScreen";
import AddEditServiceScreen from "../Screens/AddEditServiceScreen";
import LoginScreen from "../Screens/LoginScreen";
import ChangePasswordScreen from "../Screens/ChangePassword";

const MainNavigator = createStackNavigator({
  Login: LoginScreen,
  ServiceList: ServiceListScreen,
  AddEditService: AddEditServiceScreen,
  ChangePassword: ChangePasswordScreen
});

export default createAppContainer(MainNavigator);
