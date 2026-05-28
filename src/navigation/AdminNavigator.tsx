import React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AdminStackParamList } from './types';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UsersManagementScreen from '../screens/admin/UsersManagementScreen';
import StandsManagementScreen from '../screens/admin/StandsManagementScreen';
import HappyHourControlScreen from '../screens/admin/HappyHourControlScreen';
import SendNotificationScreen from '../screens/admin/SendNotificationScreen';

const Stack = createNativeStackNavigator<AdminStackParamList>();

export default function AdminNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="AdminDashboard"
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'web' ? 'none' : 'slide_from_right',
      }}
    >
      <Stack.Screen name="AdminDashboard"    component={AdminDashboardScreen} />
      <Stack.Screen name="UsersManagement"   component={UsersManagementScreen} />
      <Stack.Screen name="StandsManagement"  component={StandsManagementScreen} />
      <Stack.Screen name="HappyHourControl"  component={HappyHourControlScreen} />
      <Stack.Screen name="SendNotification"  component={SendNotificationScreen} />
    </Stack.Navigator>
  );
}
