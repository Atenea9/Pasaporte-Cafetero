import React from 'react';
import { BackHandler } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { VisitanteStackParamList } from './types';

import VisitanteWelcomeScreen from '../screens/visitante/VisitanteWelcomeScreen';
import VisitanteLoginScreen from '../screens/visitante/VisitanteLoginScreen';
import RegistroScreen from '../screens/RegistroScreen';
import HomeScreen from '../screens/visitante/HomeScreen';
import PasaporteScreen from '../screens/visitante/PasaporteScreen';
import RankingScreen from '../screens/visitante/RankingScreen';
import VendedorScreen from '../screens/VendedorScreen';
import AgendaScreen from '../screens/visitante/AgendaScreen';
import MapaFeriaScreen from '../screens/visitante/MapaFeriaScreen';
import AuspiciadoresScreen from '../screens/visitante/AuspiciadoresScreen';

const Stack = createNativeStackNavigator<VisitanteStackParamList>();

export default function VisitanteNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Welcome"       component={VisitanteWelcomeScreen} />
      <Stack.Screen name="Login"         component={VisitanteLoginScreen} />
      <Stack.Screen name="Registro"      component={RegistroScreen} />
      <Stack.Screen name="Inicio"        component={HomeScreen} />
      <Stack.Screen name="Pasaporte"     component={PasaporteScreen} />
      <Stack.Screen name="Ranking"       component={RankingScreen} />
      <Stack.Screen name="Vendedor"      component={VendedorScreen} />
      <Stack.Screen name="Agenda"        component={AgendaScreen} />
      <Stack.Screen name="MapaFeria"     component={MapaFeriaScreen} />
      <Stack.Screen name="Auspiciadores" component={AuspiciadoresScreen} />
    </Stack.Navigator>
  );
}
