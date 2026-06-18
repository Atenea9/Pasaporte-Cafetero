import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { CompradorStackParamList } from './types';
import { useAuth } from '../contexts/AuthContext';
import CompradorWelcomeScreen from '../screens/comprador/CompradorWelcomeScreen';
import CompradorLoginScreen from '../screens/comprador/CompradorLoginScreen';
import { CompradorRegistroScreen } from '../screens/comprador/CompradorRegistroScreen';
import { CompradorDashboardScreen } from '../screens/comprador/CompradorDashboardScreen';
import { LotDetailScreen } from '../screens/comprador/LotDetailScreen';
import { CompradorPasaporteScreen } from '../screens/comprador/CompradorPasaporteScreen';
import AuctionLiveScreen from '../screens/comprador/AuctionLiveScreen';
import AgendaScreen from '../screens/visitante/AgendaScreen';
import MapaFeriaScreen from '../screens/visitante/MapaFeriaScreen';
import AuspiciadoresScreen from '../screens/visitante/AuspiciadoresScreen';
import CatalogPublicoScreen from '../screens/CatalogPublicoScreen';

const Stack = createNativeStackNavigator<CompradorStackParamList>();

export const CompradorNavigator = () => {
  const { user } = useAuth();
  return (
  <Stack.Navigator
    initialRouteName={user ? 'Dashboard' : 'Welcome'}
    screenOptions={{
      headerShown: false,
      animation: Platform.OS === 'web' ? 'none' : 'slide_from_right',
    }}
  >
    <Stack.Screen name="Welcome"            component={CompradorWelcomeScreen} />
    <Stack.Screen name="Login"              component={CompradorLoginScreen} />
    <Stack.Screen name="Registro"           component={CompradorRegistroScreen} />
    <Stack.Screen name="Dashboard"          component={CompradorDashboardScreen} />
    <Stack.Screen name="LotDetail"          component={LotDetailScreen} />
    <Stack.Screen name="CompradorPasaporte" component={CompradorPasaporteScreen} />
    <Stack.Screen name="AuctionLive"        component={AuctionLiveScreen} />
    <Stack.Screen name="Agenda"             component={AgendaScreen} />
    <Stack.Screen name="MapaFeria"          component={MapaFeriaScreen} />
    <Stack.Screen name="Auspiciadores"      component={AuspiciadoresScreen} />
    <Stack.Screen name="Catalogo"           component={CatalogPublicoScreen} />
  </Stack.Navigator>
  );
};

export default CompradorNavigator;
