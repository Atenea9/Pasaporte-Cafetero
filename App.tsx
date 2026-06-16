import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider } from './src/context/AppContext';
import { AuthProvider } from './src/contexts/AuthContext';
import './src/i18n';
import { initSavedLanguage } from './src/i18n';
import RootNavigator from './src/navigation/RootNavigator';
import VideoIntroScreen from './src/screens/VideoIntroScreen';

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

type Stage = 'video' | 'app';

export default function App() {
  const [stage, setStage] = useState<Stage>('video');

  useEffect(() => {
    initSavedLanguage();
  }, []);

  if (stage === 'video') {
    return <VideoIntroScreen onFinish={() => setStage('app')} />;
  }

  return (
    <AppProvider>
      <AuthProvider>
        <View style={appStyles.root}>
          <NavigationContainer linking={linking}>
            <RootNavigator />
          </NavigationContainer>
          {/* Copyright footer — visible en todas las pantallas */}
          <View style={appStyles.copyright}>
            <Text style={appStyles.copyrightText}>© APEX 2026 · TODOS LOS DERECHOS RESERVADOS</Text>
          </View>
        </View>
      </AuthProvider>
    </AppProvider>
  );
}

const appStyles = StyleSheet.create({
  root:          { flex: 1 },
  copyright:     { backgroundColor: '#2C1A0E', paddingVertical: 5, alignItems: 'center', justifyContent: 'center' },
  copyrightText: { color: '#C8960C', fontSize: 9, fontWeight: '800', letterSpacing: 2 } as any,
});
