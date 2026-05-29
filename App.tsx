import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider } from './src/context/AppContext';
import { AuthProvider } from './src/contexts/AuthContext';
import './src/i18n';
import { initSavedLanguage } from './src/i18n';
import RootNavigator from './src/navigation/RootNavigator';
import SplashScreen from './src/screens/SplashScreen';

const linking = {
  prefixes: [],
  config: {
    screens: {
      Login: 'login',
      Welcome: 'bienvenida',
      Registro: 'registro',
      Inicio: 'inicio',
      Pasaporte: 'pasaporte',
      Ranking: 'ranking',
      MapaFeria: 'mapa',
      Agenda: 'agenda',
      Auspiciadores: 'auspiciadores',
      Catalogo: 'catalogo',
      Vendedor: 'vendedor',
      Dashboard: 'dashboard',
      Scanner: 'escaner',
      Sale: 'venta',
      StandDashboard: 'stand',
      StandCatalog: 'catalogo-stand',
      SubastaDashboard: 'subasta',
      LotDetail: 'lote',
      AuctionLive: 'subasta-live',
      AdminDashboard: 'admin',
      UsersManagement: 'admin-usuarios',
      StandsManagement: 'admin-stands',
      HappyHourControl: 'admin-happy-hour',
      SendNotification: 'admin-notificaciones',
      CeoDashboard: 'ceo',
      Analytics: 'ceo-analytics',
    },
  },
};

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    initSavedLanguage();
  }, []);

  if (!splashDone) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  return (
    <AppProvider>
      <AuthProvider>
        <NavigationContainer linking={linking}>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </AppProvider>
  );
}
