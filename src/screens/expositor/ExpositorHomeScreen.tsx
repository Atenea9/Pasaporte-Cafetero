import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { ExpositorNavProp } from '../../navigation/types';
import { useApp } from '../../context/AppContext';

export default function ExpositorHomeScreen() {
  const navigation = useNavigation<ExpositorNavProp>();
  const { dispatch } = useApp();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>☕ PANEL EXPOSITOR</Text>
        <Text style={styles.subtitle}>Gestiona tu stand</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>VENTAS HOY</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>CLIENTES</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>PUNTOS DADOS</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.scanBtn}
        onPress={() => navigation.navigate('Scanner')}
      >
        <Text style={styles.scanIcon}>📷</Text>
        <Text style={styles.scanBtnText}>ESCANEAR CLIENTE</Text>
        <Text style={styles.scanBtnSub}>Registra compras y otorga puntos</Text>
      </TouchableOpacity>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🔧 PANTALLA EN DESARROLLO</Text>
        <Text style={styles.infoText}>
          Este módulo incluirá:{'\n'}
          • Gestión de productos del stand{'\n'}
          • Historial de ventas del día{'\n'}
          • Estadísticas en tiempo real{'\n'}
          • Escáner de QR integrado{'\n'}
          • Control de inventario
        </Text>
      </View>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => dispatch({ type: 'LOGOUT' } as any)}
      >
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0800', padding: 20 },
  header: { alignItems: 'center', paddingVertical: 30 },
  title: { fontSize: 22, fontWeight: '900', color: '#C8860A', letterSpacing: 2 },
  subtitle: { fontSize: 14, color: '#888', marginTop: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1200',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#C8860A33',
  },
  statNumber: { fontSize: 28, fontWeight: '900', color: '#C8860A' },
  statLabel: { fontSize: 10, color: '#888', marginTop: 4, letterSpacing: 1, textAlign: 'center' },
  scanBtn: {
    backgroundColor: '#C8860A',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  scanIcon: { fontSize: 40, marginBottom: 8 },
  scanBtnText: { fontSize: 18, fontWeight: '900', color: '#0D0800', letterSpacing: 2 },
  scanBtnSub: { fontSize: 12, color: '#0D0800', marginTop: 4, opacity: 0.7 },
  infoCard: {
    backgroundColor: '#1A1200',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#C8860A33',
    marginBottom: 20,
  },
  infoTitle: { fontSize: 14, fontWeight: '800', color: '#C8860A', marginBottom: 12, letterSpacing: 1 },
  infoText: { fontSize: 13, color: '#AAA', lineHeight: 22 },
  logoutBtn: { alignItems: 'center', padding: 16 },
  logoutText: { fontSize: 14, color: '#666', textDecorationLine: 'underline' },
});
