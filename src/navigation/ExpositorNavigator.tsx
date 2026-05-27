import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ExpositorStackParamList } from './types';

import ExpositorDashboardScreen from '../screens/expositor/ExpositorDashboardScreen';
import ScannerScreen from '../screens/expositor/ScannerScreen';
import SaleScreen from '../screens/expositor/SaleScreen';

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
    </Stack.Navigator>
  );
}
