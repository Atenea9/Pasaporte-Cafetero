import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { CeoStackParamList } from './types';

import CeoDashboardScreen from '../screens/ceo/CeoDashboardScreen';
import ReportsScreen from '../screens/ceo/ReportsScreen';
import AnalyticsScreen from '../screens/ceo/AnalyticsScreen';

const Stack = createNativeStackNavigator<CeoStackParamList>();

export default function CeoNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="CeoDashboard"
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'web' ? 'none' : 'slide_from_right',
      }}
    >
      <Stack.Screen name="CeoDashboard" component={CeoDashboardScreen} />
      <Stack.Screen name="Reports"      component={ReportsScreen} />
      <Stack.Screen name="Analytics"    component={AnalyticsScreen} />
    </Stack.Navigator>
  );
}
