import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import HeaderRight from '../Components/HeaderRight';

import PasswordListScreen from '../Screens/PasswordListScreen';

const MainNavigator = createStackNavigator({
  PasswordList: {
    screen: PasswordListScreen,
    navigationOptions: {
      title: 'All Passwords',
      headerRight: () => (<HeaderRight />)
    }
  }
});
    
export default createAppContainer(MainNavigator);