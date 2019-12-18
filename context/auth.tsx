import React, { createContext, useState, useEffect } from 'react';
import { clearLoginCredentialsFromDB, getLoginCredentialsFromDB } from '../db/db';
import useAppState  from 'react-native-appstate-hook';
import {Current_User_Model} from '../db/Current_User';

export interface IAuth {
  username: string;
  password: string;
  missingCredentials: boolean;
  loading: boolean;
  authenticated: boolean;
}

interface AuthProvider {
  auth: IAuth;
  setAuth: React.Dispatch<React.SetStateAction<IAuth>> | null;
}

export const getLoginCreditials = async () => {
  try {
    const credentials = (await getLoginCredentialsFromDB()) as Current_User_Model;
    return {
      username: credentials.email,
      password: credentials.password
    };
  } catch (err) {
    return null;
  }
};

export const Auth = createContext<AuthProvider>({
  auth: {
    username: '',
    password: '',
    missingCredentials: false,
    loading: true,
    authenticated: false
  },
  setAuth: null
});

const AuthProvider: React.FC = props => {
  const [auth, setAuth] = useState<IAuth>({
    username: '',
    password: '',
    missingCredentials: false,
    loading: true,
    authenticated: false
  });

  useAppState({
    onForeground: async () => {
      setAuth({...auth, authenticated: false});
    }
  });


  useEffect(() => {
    getLoginCreditials().then(credentials => {
      if (credentials) {
        setAuth({...auth, username: credentials.username, password: credentials.password});
      } else {
        setAuth({...auth, missingCredentials: true})
      }
    });

  }, []);

  return (
    <Auth.Provider value={{ auth, setAuth }}>{props.children}</Auth.Provider>
  );
};

export const logout = async () => {
  await clearLoginCredentialsFromDB();
};

export default AuthProvider;
