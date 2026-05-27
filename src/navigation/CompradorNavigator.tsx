import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CompradorDashboardScreen } from '../screens/comprador/CompradorDashboardScreen';
import { LotDetailScreen } from '../screens/comprador/LotDetailScreen';
import { CompradorPasaporteScreen } from '../screens/comprador/CompradorPasaporteScreen';

const Stack = createNativeStackNavigator();

export const CompradorNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="Dashboard" component={CompradorDashboardScreen} />
    <Stack.Screen name="LotDetail" component={LotDetailScreen} />
    <Stack.Screen name="CompradorPasaporte" component={CompradorPasaporteScreen} />
  </Stack.Navigator>
);

export default CompradorNavigator;
