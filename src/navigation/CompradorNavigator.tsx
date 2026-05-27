import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { CompradorStackParamList } from './types';
import { CompradorRegistroScreen } from '../screens/comprador/CompradorRegistroScreen';
import { CompradorDashboardScreen } from '../screens/comprador/CompradorDashboardScreen';
import { LotDetailScreen } from '../screens/comprador/LotDetailScreen';
import { CompradorPasaporteScreen } from '../screens/comprador/CompradorPasaporteScreen';

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
  </Stack.Navigator>
);

export default CompradorNavigator;
