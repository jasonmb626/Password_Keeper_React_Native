import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import ServiceListScreen from '../Screens/ServiceListScreen';
import AddEditServiceScreen from '../Screens/AddEditServiceScreen';

const MainNavigator = createStackNavigator({
  ServiceList: ServiceListScreen,
  AddEditService: AddEditServiceScreen
});
    
export default createAppContainer(MainNavigator);