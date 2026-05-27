import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { VisitanteStackParamList } from './types';

import RegistroScreen from '../screens/RegistroScreen';
import HomeScreen from '../screens/visitante/HomeScreen';
import PasaporteScreen from '../screens/visitante/PasaporteScreen';
import RankingScreen from '../screens/visitante/RankingScreen';
import VendedorScreen from '../screens/VendedorScreen';

const Stack = createNativeStackNavigator<VisitanteStackParamList>();

export default function VisitanteNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Registro"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Registro" component={RegistroScreen} />
      <Stack.Screen name="Inicio" component={HomeScreen} />
      <Stack.Screen name="Pasaporte" component={PasaporteScreen} />
      <Stack.Screen name="Ranking" component={RankingScreen} />
      <Stack.Screen name="Vendedor" component={VendedorScreen} />
    </Stack.Navigator>
  );
}
