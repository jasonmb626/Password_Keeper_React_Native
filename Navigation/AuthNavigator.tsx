import React, {useContext, useRef, useEffect } from 'react';
import {Auth} from '../context/auth';
import MainNavigator from './MainNavigator';
import { NavigationContainerComponent, NavigationActions } from 'react-navigation';
// import useAppState from "react-native-appstate-hook";

const AuthNavigator: React.FC = () => {
    const auth = useContext(Auth);
    const ref = useRef<NavigationContainerComponent>(null);

    // const { appState } = useAppState({
    //     onForeground: async () => {
    //       await clearAuthenticated();
    //       setLoading(true);
    //     }
    //   });

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