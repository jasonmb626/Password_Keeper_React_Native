import React from 'react';
import AuthNavigator from './Navigation/AuthNavigator';
import { initDB, seedData } from './db/db';
import AuthProvider from './context/auth';
import ServicesProvider from './context/services';

//Create database & initialize tables. (Leaves everything untouched if they already exist.)
initDB();

//Delete all entries and reinitialize from passwords.json if suspect database is corrupt.
//seedData();

export default function App() {
  return <AuthProvider><ServicesProvider><AuthNavigator /></ServicesProvider></AuthProvider>;
}
