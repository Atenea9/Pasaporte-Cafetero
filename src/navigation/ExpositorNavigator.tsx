import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ExpositorStackParamList } from './types';

import ExpositorDashboardScreen from '../screens/expositor/ExpositorDashboardScreen';
import StandDashboardScreen from '../screens/expositor/StandDashboardScreen';
import StandCatalogScreen from '../screens/expositor/StandCatalogScreen';
import FincaProfileScreen from '../screens/expositor/FincaProfileScreen';
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
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'web' ? 'none' : 'slide_from_right',
      }}
    >
      <Stack.Screen name="Dashboard"        component={ExpositorDashboardScreen} />
      <Stack.Screen name="StandDashboard"   component={StandDashboardScreen} />
      <Stack.Screen name="StandCatalog"     component={StandCatalogScreen} />
      <Stack.Screen name="FincaProfile"     component={FincaProfileScreen} />
      <Stack.Screen name="Scanner"          component={ScannerScreen} />
      <Stack.Screen name="Sale"             component={SaleScreen} />
      <Stack.Screen name="SubastaDashboard" component={SubastaDashboardScreen} />
      <Stack.Screen name="SubastaProfile"   component={SubastaProfileForm} />
      <Stack.Screen name="ScaForm"          component={ScaFormScreen} />
    </Stack.Navigator>
  );
}
