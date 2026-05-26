import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { VisitanteStackParamList } from './types';

import HomeScreen from '../screens/HomeScreen';
import PasaporteScreen from '../screens/PasaporteScreen';
import RankingScreen from '../screens/RankingScreen';
import VendedorScreen from '../screens/VendedorScreen';

const Stack = createNativeStackNavigator<VisitanteStackParamList>();

export default function VisitanteNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Inicio"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Inicio" component={HomeScreen} />
      <Stack.Screen name="Pasaporte" component={PasaporteScreen} />
      <Stack.Screen name="Ranking" component={RankingScreen} />
      <Stack.Screen name="Vendedor" component={VendedorScreen} />
    </Stack.Navigator>
  );
}
