import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { CompradorStackParamList } from './types';

import CompradorHomeScreen from '../screens/comprador/CompradorHomeScreen';
import CatalogScreen from '../screens/comprador/CatalogScreen';
import AuctionsScreen from '../screens/comprador/AuctionsScreen';
import MyOrdersScreen from '../screens/comprador/MyOrdersScreen';

const Stack = createNativeStackNavigator<CompradorStackParamList>();

export default function CompradorNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="CompradorHome"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="CompradorHome" component={CompradorHomeScreen} />
      <Stack.Screen name="Catalog" component={CatalogScreen} />
      <Stack.Screen name="Auctions" component={AuctionsScreen} />
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
    </Stack.Navigator>
  );
}
