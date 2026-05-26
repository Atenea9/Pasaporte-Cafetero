import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import { NavProvider, useNav } from './src/context/NavContext';
import HomeScreen from './src/screens/HomeScreen';
import RegistroScreen from './src/screens/RegistroScreen';
import PasaporteScreen from './src/screens/PasaporteScreen';
import VendedorScreen from './src/screens/VendedorScreen';
import RankingScreen from './src/screens/RankingScreen';

function RootNavigator() {
  const { state } = useApp();
  const { screen } = useNav();

  if (!state.usuario) return <RegistroScreen onRegistrado={() => {}} />;

  return (
    <View style={styles.root}>
      {screen === 'home'      && <HomeScreen />}
      {screen === 'pasaporte' && <PasaporteScreen />}
      {screen === 'vendedor'  && <VendedorScreen />}
      {screen === 'ranking'   && <RankingScreen />}
    </View>
  );
}

export default function App() {
  return (
    <AppProvider>
      <NavProvider>
        <RootNavigator />
      </NavProvider>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0800' },
});
