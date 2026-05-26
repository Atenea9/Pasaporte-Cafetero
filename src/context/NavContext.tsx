/**
 * NavContext — Compatibility shim for React Navigation.
 *
 * The old custom history-stack is replaced by React Navigation
 * (@react-navigation/native-stack). This file keeps the original
 * `useNav()` API so that existing screens compile without changes.
 *
 * New screens should import `useNavigation` directly from
 * '@react-navigation/native' and use the typed param-list helpers
 * in src/navigation/types.ts.
 */

import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { VisitanteStackParamList } from '../navigation/types';

export type Screen = 'home' | 'pasaporte' | 'vendedor' | 'ranking';

const SCREEN_MAP: Record<Screen, keyof VisitanteStackParamList> = {
  home:      'Inicio',
  pasaporte: 'Pasaporte',
  vendedor:  'Vendedor',
  ranking:   'Ranking',
};

interface NavCompatValue {
  screen: Screen;
  navigate: (s: Screen) => void;
  goBack: () => void;
  canGoBack: boolean;
}

/**
 * NavProvider is now a no-op wrapper kept for backward-compatibility.
 * NavigationContainer in App.tsx is the actual provider.
 */
export function NavProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/**
 * Compatibility hook. Maps the old API surface to React Navigation calls.
 * Must be used inside a screen that is mounted within a Navigator.
 */
export function useNav(): NavCompatValue {
  const navigation = useNavigation<
    NativeStackNavigationProp<VisitanteStackParamList>
  >();

  return {
    screen: 'home',
    navigate: (s: Screen) => {
      const target = SCREEN_MAP[s];
      navigation.navigate(target);
    },
    goBack: () => {
      if (navigation.canGoBack()) navigation.goBack();
    },
    canGoBack: navigation.canGoBack(),
  };
}
