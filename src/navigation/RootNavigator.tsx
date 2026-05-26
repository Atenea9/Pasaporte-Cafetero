import React from 'react';
import { useApp } from '../context/AppContext';

import RegistroScreen from '../screens/RegistroScreen';
import VisitanteNavigator from './VisitanteNavigator';
import ExpositorNavigator from './ExpositorNavigator';
import CompradorNavigator from './CompradorNavigator';
import AdminNavigator from './AdminNavigator';
import CeoNavigator from './CeoNavigator';

type UserRole = 'visitante' | 'expositor' | 'comprador' | 'admin' | 'ceo';

export default function RootNavigator() {
  const { state } = useApp();
  const usuario = state.usuario as (Record<string, unknown> & { rol?: UserRole }) | null;

  if (!usuario) {
    return <RegistroScreen onRegistrado={() => {}} />;
  }

  const role: UserRole = usuario.rol ?? 'visitante';

  switch (role) {
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
