import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider } from './src/context/AppContext';
import { AuthProvider } from './src/contexts/AuthContext';
import './src/i18n';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </AppProvider>
  );
}
