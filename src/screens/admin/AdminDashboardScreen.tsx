import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { AdminNavProp } from '../../navigation/types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../contexts/AuthContext';

const MENU_ITEMS = [
  { icon: '👥', label: 'Gestión de Usuarios', screen: 'UsersManagement' as const, sub: 'Ver y editar visitantes registrados' },
  { icon: '🏪', label: 'Gestión de Stands', screen: 'StandsManagement' as const, sub: 'Administra stands y PINs' },
  { icon: '⚡', label: 'Happy Hour', screen: 'HappyHourControl' as const, sub: 'Activa multiplicadores de puntos' },
  { icon: '🔔', label: 'Notificaciones', screen: 'SendNotification' as const, sub: 'Envía push a todos los usuarios' },
];

export default function AdminDashboardScreen() {
  const navigation = useNavigation<AdminNavProp>();
  const { dispatch } = useApp();
  const { logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.badge}>⚙️ ADMINISTRADOR</Text>
          <Text style={styles.title}>PANEL DE CONTROL</Text>
          <Text style={styles.subtitle}>Feria del Café Colombiano</Text>
        </View>

        <View style={styles.statsRow}>
          {[
            { n: '—', l: 'VISITANTES' },
            { n: '—', l: 'STANDS' },
            { n: '—', l: 'VENTAS' },
          ].map((s) => (
            <View key={s.l} style={styles.statCard}>
              <Text style={styles.statN}>{s.n}</Text>
              <Text style={styles.statL}>{s.l}</Text>
            </View>
          ))}
        </View>

        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.screen}
            style={styles.menuCard}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuSub}>{item.sub}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🔧 MÓDULO EN DESARROLLO</Text>
          <Text style={styles.infoText}>
            Este panel incluirá:{'\n'}
            • Dashboard con métricas en tiempo real{'\n'}
            • Control de Happy Hour{'\n'}
            • Gestión completa de stands{'\n'}
            • Envío de notificaciones push{'\n'}
            • Exportación de datos a Excel
          </Text>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => logout()}
        >
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0800' },
  header: { alignItems: 'center', padding: 30, paddingBottom: 20 },
  badge: {
    fontSize: 11,
    color: '#C8860A',
    letterSpacing: 2,
    backgroundColor: '#C8860A22',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
  },
  title: { fontSize: 22, fontWeight: '900', color: '#C8860A', letterSpacing: 2 },
  subtitle: { fontSize: 13, color: '#888', marginTop: 4 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1200',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8860A33',
  },
  statN: { fontSize: 24, fontWeight: '900', color: '#C8860A' },
  statL: { fontSize: 9, color: '#888', marginTop: 4, letterSpacing: 1, textAlign: 'center' },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1200',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#C8860A33',
  },
  menuIcon: { fontSize: 28, marginRight: 14 },
  menuTextWrap: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '800', color: '#F5E6C8', letterSpacing: 0.5 },
  menuSub: { fontSize: 12, color: '#888', marginTop: 2 },
  arrow: { fontSize: 22, color: '#C8860A', fontWeight: '300' },
  infoCard: {
    backgroundColor: '#1A1200',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    borderWidth: 1,
    borderColor: '#C8860A33',
  },
  infoTitle: { fontSize: 13, fontWeight: '800', color: '#C8860A', marginBottom: 10, letterSpacing: 1 },
  infoText: { fontSize: 13, color: '#AAA', lineHeight: 22 },
  logoutBtn: { alignItems: 'center', padding: 16, marginBottom: 20 },
  logoutText: { fontSize: 14, color: '#666', textDecorationLine: 'underline' },
});
