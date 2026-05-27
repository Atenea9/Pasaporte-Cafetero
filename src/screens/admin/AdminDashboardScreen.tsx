import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';

export const AdminDashboardScreen = () => {
  const { logout } = useAuth();
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const data = await mockDbService.getAdminKPIs();
    setKpis(data);
    setLoading(false);
  };

  const handleToggleHappyHour = async () => {
    setToggling(true);
    const isActive = await mockDbService.toggleHappyHour();
    setKpis({ ...kpis, happyHour: isActive });
    setToggling(false);
    Alert.alert(
      isActive ? '⚡ Happy Hour Activado' : '🌙 Happy Hour Desactivado',
      isActive ? 'Los puntos ahora se duplican para todos los visitantes.' : 'Los puntos vuelven al valor normal.'
    );
  };

  if (loading) return <ActivityIndicator style={styles.loader} color="#C8860A" />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.badge}>⚙️ ADMINISTRADOR</Text>
        <Text style={styles.title}>Panel de Control</Text>
        <Text onPress={logout} style={styles.logout}>Cerrar Sesión</Text>
      </View>

      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{kpis.totalVisitors.toLocaleString()}</Text>
          <Text style={styles.kpiLabel}>VISITANTES</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{kpis.activeStands}</Text>
          <Text style={styles.kpiLabel}>STANDS</Text>
        </View>
        <View style={[styles.kpiCard, styles.kpiWide]}>
          <Text style={styles.kpiValue}>{kpis.totalPoints.toLocaleString()}</Text>
          <Text style={styles.kpiLabel}>PUNTOS TOTALES</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Control de Happy Hour</Text>
        <Text style={styles.sectionDesc}>
          Cuando está activo, todos los visitantes ganan el doble de puntos por compra.
        </Text>
        <TouchableOpacity
          style={[styles.hhButton, kpis.happyHour && styles.hhActive]}
          onPress={handleToggleHappyHour}
          disabled={toggling}
        >
          {toggling
            ? <ActivityIndicator color="#FFF" />
            : (
              <Text style={styles.hhText}>
                {kpis.happyHour
                  ? '⚡ Happy Hour ACTIVO — Toca para desactivar'
                  : '🌙 Happy Hour INACTIVO — Toca para activar'}
              </Text>
            )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AdminDashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0800' },
  loader: { flex: 1, justifyContent: 'center', backgroundColor: '#0D0800' },
  header: { padding: 30, alignItems: 'center', backgroundColor: '#1A1200' },
  badge: {
    fontSize: 11, color: '#C8860A', letterSpacing: 2,
    backgroundColor: '#C8860A22', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20, marginBottom: 10, overflow: 'hidden',
  },
  title: { fontSize: 22, fontWeight: '900', color: '#C8860A', letterSpacing: 2 },
  logout: { color: '#E07A5F', marginTop: 12, fontSize: 14 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
  kpiCard: {
    flex: 1, minWidth: '40%', backgroundColor: '#1A1200',
    borderRadius: 14, padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#C8860A33',
  },
  kpiWide: { minWidth: '90%' },
  kpiValue: { fontSize: 28, fontWeight: '900', color: '#C8860A' },
  kpiLabel: { fontSize: 10, color: '#888', marginTop: 4, letterSpacing: 1 },
  section: { margin: 16, padding: 20, backgroundColor: '#1A1200', borderRadius: 16, borderWidth: 1, borderColor: '#C8860A33' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#F5E6C8', marginBottom: 8 },
  sectionDesc: { fontSize: 13, color: '#888', marginBottom: 16, lineHeight: 20 },
  hhButton: {
    backgroundColor: '#444', padding: 18, borderRadius: 12, alignItems: 'center',
  },
  hhActive: { backgroundColor: '#C8860A' },
  hhText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
});
