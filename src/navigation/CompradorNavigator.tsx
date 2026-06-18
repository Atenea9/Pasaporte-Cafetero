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
import Top40CafesScreen from '../screens/comprador/Top40CafesScreen';
import AgendaScreen from '../screens/visitante/AgendaScreen';
import MapaFeriaScreen from '../screens/visitante/MapaFeriaScreen';
import AuspiciadoresScreen from '../screens/visitante/AuspiciadoresScreen';
import CatalogPublicoScreen from '../screens/CatalogPublicoScreen';
import ExpositoresScreen from '../screens/visitante/ExpositoresScreen';
import CatacionScreen from '../screens/visitante/CatacionScreen';
import PremiacionesScreen from '../screens/visitante/PremiacionesScreen';
import AgendaAcademicaScreen from '../screens/visitante/AgendaAcademicaScreen';
import FeriaAnteriorScreen from '../screens/visitante/FeriaAnteriorScreen';

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
    <Stack.Screen name="Top40Cafes"         component={Top40CafesScreen} />
    <Stack.Screen name="Expositores"        component={ExpositoresScreen} />
    <Stack.Screen name="Catacion"           component={CatacionScreen} />
    <Stack.Screen name="Premiaciones"       component={PremiacionesScreen} />
    <Stack.Screen name="AgendaAcademica"    component={AgendaAcademicaScreen} />
    <Stack.Screen name="FeriaAnterior"      component={FeriaAnteriorScreen} />
  </Stack.Navigator>
  );
};

export default CompradorNavigator;
