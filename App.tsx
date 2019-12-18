import React from 'react';
import AuthNavigator from './Navigation/AuthNavigator';
import AuthProvider from './context/auth';
import ServicesProvider from './context/services';
import * as SQLite from 'expo-sqlite';

import { initDB, seedData } from './db/db';


//Create database & initialize tables. (Leaves everything untouched if they already exist.)
//initDB();

//Delete all entries and reinitialize from passwords.json if suspect database is corrupt.
//seedData();

export default function App() {
  return <AuthProvider><ServicesProvider><AuthNavigator /></ServicesProvider></AuthProvider>;
}
