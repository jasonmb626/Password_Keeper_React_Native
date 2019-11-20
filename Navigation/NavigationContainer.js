import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavigationActions } from "react-navigation";

import MainNavigator from "./MainNavigator";

const NavigationContainer = props => {
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  const [loaded, setLoaded] = useState(false);

  const navRef = useRef();

  useEffect(() => {
    navRef.current.dispatch(NavigationActions.navigate({ routeName: "Auth" }));
  }, []);

  return <MainNavigator ref={navRef} />;
};

export default NavigationContainer;
