import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { VisitanteStackParamList } from './types';
import { useAuth } from '../contexts/AuthContext';

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
import CatalogPublicoScreen from '../screens/CatalogPublicoScreen';
import ExpositoresScreen from '../screens/visitante/ExpositoresScreen';
import CatacionScreen from '../screens/visitante/CatacionScreen';
import PremiacionesScreen from '../screens/visitante/PremiacionesScreen';
import AgendaAcademicaScreen from '../screens/visitante/AgendaAcademicaScreen';
import FeriaAnteriorScreen from '../screens/visitante/FeriaAnteriorScreen';
import PerfilScreen        from '../screens/visitante/PerfilScreen';

const Stack = createNativeStackNavigator<VisitanteStackParamList>();

export default function VisitanteNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName={user ? 'Inicio' : 'Welcome'}
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'web' ? 'none' : 'slide_from_right',
      }}
    >
      <Stack.Screen name="Welcome"          component={VisitanteWelcomeScreen} />
      <Stack.Screen name="Login"            component={VisitanteLoginScreen} />
      <Stack.Screen name="Registro"         component={RegistroScreen} />
      <Stack.Screen name="Inicio"           component={HomeScreen} />
      <Stack.Screen name="Pasaporte"        component={PasaporteScreen} />
      <Stack.Screen name="Ranking"          component={RankingScreen} />
      <Stack.Screen name="Vendedor"         component={VendedorScreen} />
      <Stack.Screen name="Agenda"           component={AgendaScreen} />
      <Stack.Screen name="MapaFeria"        component={MapaFeriaScreen} />
      <Stack.Screen name="Auspiciadores"    component={AuspiciadoresScreen} />
      <Stack.Screen name="Catalogo"         component={CatalogPublicoScreen} />
      <Stack.Screen name="Expositores"      component={ExpositoresScreen} />
      <Stack.Screen name="Catacion"         component={CatacionScreen} />
      <Stack.Screen name="Premiaciones"     component={PremiacionesScreen} />
      <Stack.Screen name="AgendaAcademica"  component={AgendaAcademicaScreen} />
      <Stack.Screen name="FeriaAnterior"    component={FeriaAnteriorScreen} />
      <Stack.Screen name="Perfil"           component={PerfilScreen} />
    </Stack.Navigator>
  );
}
