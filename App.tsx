import React, { useState, useContext, useEffect } from 'react';
import AuthNavigator from './Navigation/AuthNavigator';
import { initDB, seedData, getLoginCredentialsFromDB } from './db';
import { AppLoading } from 'expo';
import AuthProvider, { Auth, CurrentUser } from './context/auth';
import ServicesProvider from './context/services';

initDB();
//seedData();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const auth = useContext(Auth);

  useEffect(() => {
    if (!loading) {
      if (auth && auth.setAuth) {
        if (username !== '')
          auth.setAuth({
            authenticated: true,
            loading: false,
            missingCredentials: false,
            password,
            username
          });
        else {
          auth.setAuth({
            authenticated: false,
            loading: false,
            missingCredentials: true,
            password: '',
            username: ''
          });
        }
      }
    }
  }, [loading]);

  if (loading) {
    return (
      <AppLoading
        startAsync={() => {
          return new Promise(async (resolve, reject) => {
            const credentials = (await getLoginCredentialsFromDB()) as CurrentUser;
            if (credentials) {
              setUsername(credentials.email);
              setPassword(credentials.password);
            }
            resolve();
          });
        }}
        onFinish={() => {
          setLoading(false);
        }}
      />
    );
  }
  return <AuthProvider><ServicesProvider><AuthNavigator /></ServicesProvider></AuthProvider>;
}
