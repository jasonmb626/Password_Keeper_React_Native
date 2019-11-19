import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { NavigationActions } from 'react-navigation';

import MainNavigator from './MainNavigator';

const NavigationContainer = props => {
  const navRef = useRef();

  useEffect(() => {
      navRef.current.dispatch(
        NavigationActions.navigate({ routeName: 'Auth' })
      );
    }, []);

  return <MainNavigator ref={navRef} />;
};

export default NavigationContainer;
