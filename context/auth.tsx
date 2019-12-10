import React, { createContext, useState, useEffect } from 'react';
import { clearLoginCredentialsFromDB, getLoginCredentialsFromDB } from '../db';

export interface IAuth {
  username: string | null;
  password: string | null;
  missingCredentials: boolean;
  loading: boolean;
  authenticated: boolean;
}

export interface CurrentUser {
  email: string;
  password: string;
}

interface AuthProvider {
  auth: IAuth;
  setAuth: React.Dispatch<React.SetStateAction<IAuth>> | null;
}

export const getLoginCreditials = async () => {
  try {
    const credentials = (await getLoginCredentialsFromDB()) as CurrentUser;
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
    username: null,
    password: null,
    missingCredentials: false,
    loading: true,
    authenticated: false
  },
  setAuth: null
});

const AuthProvider: React.FC = props => {
  const [auth, setAuth] = useState<IAuth>({
    username: null,
    password: null,
    missingCredentials: false,
    loading: true,
    authenticated: false
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
