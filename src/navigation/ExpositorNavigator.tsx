import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ExpositorStackParamList } from './types';

import ExpositorDashboardScreen from '../screens/expositor/ExpositorDashboardScreen';
import ScannerScreen from '../screens/expositor/ScannerScreen';
import SaleScreen from '../screens/expositor/SaleScreen';
import SubastaDashboardScreen from '../screens/expositor/SubastaDashboardScreen';
import SubastaProfileForm from '../screens/expositor/SubastaProfileForm';
import ScaFormScreen from '../screens/expositor/ScaFormScreen';

const Stack = createNativeStackNavigator<ExpositorStackParamList>();

export default function ExpositorNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Dashboard" component={ExpositorDashboardScreen} />
      <Stack.Screen name="Scanner" component={ScannerScreen} />
      <Stack.Screen name="Sale" component={SaleScreen} />
      <Stack.Screen name="SubastaDashboard" component={SubastaDashboardScreen} />
      <Stack.Screen name="SubastaProfile" component={SubastaProfileForm} />
      <Stack.Screen name="ScaForm" component={ScaFormScreen} />
    </Stack.Navigator>
  );
}
