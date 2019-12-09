import React, { useState, useContext, useEffect } from 'react';
import MainNavigator from './Navigation/MainNavigator';
import { initDB, seedData, getLoginCredentialsFromDB } from './db';
import { AppLoading } from 'expo';
import { Auth, CurrentUser } from './context/auth';

initDB();
//seedData();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const auth = useContext(Auth);

  useEffect(() => {
    console.log('loading state changed credentials');
    if (!loading) {
      console.log(auth);
      if (auth && auth.setAuth) {
        console.log('missing credentials');
        if (username !== '')
          auth.setAuth({
            authenticated: true,
            loading: false,
            missingCredentials: false,
            password,
            username
          });
        else {
          console.log('not authenticated');
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
          console.log('done loading');
          setLoading(false);
        }}
      />
    );
  }
  return <MainNavigator />;
}
