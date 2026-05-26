import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider } from './src/context/AppContext';
import i18n from './src/i18n';
import { I18nextProvider } from 'react-i18next';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AppProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AppProvider>
    </I18nextProvider>
  );
}
