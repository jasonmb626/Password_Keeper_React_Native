import React, { createContext, useState, useEffect } from 'react';
import { logoutAllUsersFromDB, getLoggedInUserFromDB, registerUserToDB, dbSecret, establishDBConnection, seedData, printDB, db } from '../db/db';
import useAppState  from 'react-native-appstate-hook';
import {UserModel} from '../db/User';
import CryptoJS from 'crypto-js';
import { Connection } from 'typeorm';

export interface IAuth {
  id?: string;
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
    const credentials = (await getLoggedInUserFromDB()) as UserModel;
    const bytes = CryptoJS.AES.decrypt(credentials.password, dbSecret);
    credentials.password = bytes.toString(CryptoJS.enc.Utf8);
    return credentials;
  } catch (err) {
    return null;
  }
};

export const registerUser = async (newUser : UserModel) => {
  newUser.password = CryptoJS.AES.encrypt(
    newUser.password,
    dbSecret
  ).toString();
  return registerUserToDB(newUser);
}

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
    id: '',
    username: '',
    password: '',
    missingCredentials: true,
    loading: true,
    authenticated: false
  });

  useAppState({
    onForeground: async () => {
      setAuth({...auth, authenticated: false});
    }
  });

  useEffect(() => {
    establishDBConnection().then(async () => {
      //Delete all entries and reinitialize from passwords.json if suspect database is corrupt.
      console.log('Seeding data');
      try {
       //await seedData();
       printDB();
      } catch (err) {
        console.error(err);
      }
    });
    getLoginCreditials().then(credentials => {
      if (credentials) {
        console.log(credentials);
        setAuth({...auth, id: credentials.id, username: credentials.email, password: credentials.password, missingCredentials: false});
        setTimeout(() => {
          console.log('auth:');
          console.log(auth);
        }, 5000);
      } else {
        setAuth({...auth, missingCredentials: true})
      }
    });
    //Close database connection if application loses focus or closes
    return (() => {
      if (db.Connection)
        db.Connection.close();
    });
  }, []);

  return (
    <Auth.Provider value={{ auth, setAuth }}>{props.children}</Auth.Provider>
  );
};

export const logout = async () => {
  await logoutAllUsersFromDB();
};

export default AuthProvider;
