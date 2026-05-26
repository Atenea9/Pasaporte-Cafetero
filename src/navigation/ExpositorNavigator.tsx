import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ExpositorStackParamList } from './types';

import ExpositorHomeScreen from '../screens/expositor/ExpositorHomeScreen';
import ScannerScreen from '../screens/expositor/ScannerScreen';

const Stack = createNativeStackNavigator<ExpositorStackParamList>();

export default function ExpositorNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="ExpositorHome"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="ExpositorHome" component={ExpositorHomeScreen} />
      <Stack.Screen name="Scanner" component={ScannerScreen} />
    </Stack.Navigator>
  );
}
