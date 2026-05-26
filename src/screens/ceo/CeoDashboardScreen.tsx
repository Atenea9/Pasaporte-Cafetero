import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CeoNavProp } from '../../navigation/types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../contexts/AuthContext';

const KPI_CARDS = [
  { icon: '💰', label: 'INGRESOS TOTALES', value: '$—', delta: '+—%' },
  { icon: '👥', label: 'VISITANTES', value: '—', delta: '+—%' },
  { icon: '🏪', label: 'STANDS ACTIVOS', value: '—', delta: '—' },
  { icon: '📊', label: 'CONVERSIÓN', value: '—%', delta: '+—%' },
];

export default function CeoDashboardScreen() {
  const navigation = useNavigation<CeoNavProp>();
  const { dispatch } = useApp();
  const { logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.badge}>👔 CEO</Text>
          <Text style={styles.title}>DASHBOARD EJECUTIVO</Text>
          <Text style={styles.subtitle}>Feria del Café Colombiano</Text>
        </View>

        <View style={styles.kpiGrid}>
          {KPI_CARDS.map((kpi) => (
            <View key={kpi.label} style={styles.kpiCard}>
              <Text style={styles.kpiIcon}>{kpi.icon}</Text>
              <Text style={styles.kpiValue}>{kpi.value}</Text>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
              <Text style={styles.kpiDelta}>{kpi.delta}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('Reports')}>
          <Text style={styles.menuIcon}>📄</Text>
          <View style={styles.menuTextWrap}>
            <Text style={styles.menuLabel}>Reportes</Text>
            <Text style={styles.menuSub}>Exporta datos a Excel / PDF</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('Analytics')}>
          <Text style={styles.menuIcon}>📈</Text>
          <View style={styles.menuTextWrap}>
            <Text style={styles.menuLabel}>Analítica Avanzada</Text>
            <Text style={styles.menuSub}>Tendencias y proyecciones</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🔧 MÓDULO EN DESARROLLO</Text>
          <Text style={styles.infoText}>
            Este dashboard incluirá:{'\n'}
            • KPIs en tiempo real con gráficas{'\n'}
            • Comparación de períodos{'\n'}
            • Top stands por ingresos y visitantes{'\n'}
            • Exportación XLSX de todos los datos{'\n'}
            • Mapa de calor de la feria
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
  header: { alignItems: 'center', padding: 30, paddingBottom: 16 },
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
  title: { fontSize: 20, fontWeight: '900', color: '#C8860A', letterSpacing: 2 },
  subtitle: { fontSize: 13, color: '#888', marginTop: 4 },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 10,
  },
  kpiCard: {
    width: '47%',
    backgroundColor: '#1A1200',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C8860A33',
    alignItems: 'center',
  },
  kpiIcon: { fontSize: 28, marginBottom: 8 },
  kpiValue: { fontSize: 22, fontWeight: '900', color: '#C8860A' },
  kpiLabel: { fontSize: 9, color: '#888', letterSpacing: 1, marginTop: 4, textAlign: 'center' },
  kpiDelta: { fontSize: 11, color: '#4CAF50', marginTop: 4, fontWeight: '700' },
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
  menuLabel: { fontSize: 15, fontWeight: '800', color: '#F5E6C8' },
  menuSub: { fontSize: 12, color: '#888', marginTop: 2 },
  arrow: { fontSize: 22, color: '#C8860A' },
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
