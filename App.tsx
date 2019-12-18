import * as SQLite from 'expo-sqlite';
import React from 'react';
import AuthNavigator from './Navigation/AuthNavigator';
import AuthProvider from './context/auth';
import ServicesProvider from './context/services';

import { seedData } from './db/db';

//Delete all entries and reinitialize from passwords.json if suspect database is corrupt.
//seedData();

//Tell typescript that window has an Expo property. Could not determine its exact type so just went with any.
declare global {
  interface Window { Expo: any; }
}

//This line is necessary for typeorm to find expo-sqlite. I think one if its default imports is using old syntax.
window.Expo = Object.freeze({ ...window.Expo, SQLite });

export default function App() {
  return <AuthProvider><ServicesProvider><AuthNavigator /></ServicesProvider></AuthProvider>;
}
