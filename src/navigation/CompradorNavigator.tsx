import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { CompradorStackParamList } from './types';
import { CompradorRegistroScreen } from '../screens/comprador/CompradorRegistroScreen';
import { CompradorDashboardScreen } from '../screens/comprador/CompradorDashboardScreen';
import { LotDetailScreen } from '../screens/comprador/LotDetailScreen';
import { CompradorPasaporteScreen } from '../screens/comprador/CompradorPasaporteScreen';
import AuctionLiveScreen from '../screens/comprador/AuctionLiveScreen';
import AgendaScreen from '../screens/visitante/AgendaScreen';
import MapaFeriaScreen from '../screens/visitante/MapaFeriaScreen';
import AuspiciadoresScreen from '../screens/visitante/AuspiciadoresScreen';

const Stack = createNativeStackNavigator<CompradorStackParamList>();

export const CompradorNavigator = () => (
  <Stack.Navigator
    initialRouteName="Registro"
    screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
  >
    <Stack.Screen name="Registro" component={CompradorRegistroScreen} />
    <Stack.Screen name="Dashboard" component={CompradorDashboardScreen} />
    <Stack.Screen name="LotDetail" component={LotDetailScreen} />
    <Stack.Screen name="CompradorPasaporte" component={CompradorPasaporteScreen} />
    <Stack.Screen name="AuctionLive" component={AuctionLiveScreen} />
    <Stack.Screen name="Agenda" component={AgendaScreen} />
    <Stack.Screen name="MapaFeria" component={MapaFeriaScreen} />
    <Stack.Screen name="Auspiciadores" component={AuspiciadoresScreen} />
  </Stack.Navigator>
);

export default CompradorNavigator;
