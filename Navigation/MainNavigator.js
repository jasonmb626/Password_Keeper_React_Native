import React from 'react';
import { TouchableNativeFeedback } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { Ionicons } from '@expo/vector-icons';

import PasswordListScreen from '../Screens/PasswordListScreen';

const MainNavigator = createStackNavigator({
    PasswordList: {
        screen: PasswordListScreen,
        navigationOptions: {
            title: 'All Passwords',
            headerRight: () => (
                <TouchableNativeFeedback
                  onPress={() => alert('This is a button!')}
                  title="Info"
                  color="#fff"
                >
            <Ionicons
              name='md-add-circle-outline'
              size={23}
            />
            </TouchableNativeFeedback>
          )
        }}});
    


export default createAppContainer(MainNavigator);