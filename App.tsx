import React, { useState, useContext, useEffect, useRef } from 'react';
import AuthNavigator from './Navigation/AuthNavigator';
import { initDB, seedData, getLoginCredentialsFromDB } from './db';
import { AppLoading } from 'expo';
import AuthProvider, { Auth, CurrentUser } from './context/auth';
import ServicesProvider from './context/services';

initDB();
//seedData();

export default function App() {
  return <AuthProvider><ServicesProvider><AuthNavigator /></ServicesProvider></AuthProvider>;
}
