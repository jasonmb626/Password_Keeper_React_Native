import React, {useContext, useRef, useEffect } from 'react';
import {Auth} from '../context/auth';
import MainNavigator from './MainNavigator';
import { NavigationContainerComponent, NavigationActions } from 'react-navigation';

const AuthNavigator = () => {
    const auth = useContext(Auth);
    const ref = useRef<NavigationContainerComponent>(null);

    useEffect(() => {
    if (!auth.auth.authenticated)
        if (ref && ref.current) {
            ref.current.dispatch(
                NavigationActions.navigate({ routeName: 'Login' })
              );
            }
        }, [auth.auth.authenticated]);
    
    return (<MainNavigator ref={ref}/>);
}

export default AuthNavigator;