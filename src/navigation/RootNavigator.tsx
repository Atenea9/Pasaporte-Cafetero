import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

import AuthStack from './AuthStack';
import VisitanteNavigator from './VisitanteNavigator';
import ExpositorNavigator from './ExpositorNavigator';
import CompradorNavigator from './CompradorNavigator';
import AdminNavigator from './AdminNavigator';
import CeoNavigator from './CeoNavigator';

export default function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0800' }}>
        <ActivityIndicator size="large" color="#C8860A" />
      </View>
    );
  }

  if (!user) {
    return <AuthStack />;
  }

  switch (user.role) {
    case 'expositor':
      return <ExpositorNavigator />;
    case 'comprador':
      return <CompradorNavigator />;
    case 'admin':
      return <AdminNavigator />;
    case 'ceo':
      return <CeoNavigator />;
    default:
      return <VisitanteNavigator />;
  }
}
