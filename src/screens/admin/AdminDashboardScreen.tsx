import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';
import { PremiumTheme } from '../../theme/PremiumTheme';

export const AdminDashboardScreen = () => {
  const { logout } = useAuth();
  const [kpis, setKpis] = useState<any>(null);

  const loadData = async () => setKpis(await mockDbService.getAdminKPIs());

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleHappyHour = async () => {
    await mockDbService.toggleHappyHour();
    loadData();
  };

  if (!kpis) return <ActivityIndicator style={styles.loader} color={PremiumTheme.colors.goldPrimary} />;

  return (
    <LinearGradient colors={[PremiumTheme.colors.bgDark, '#000']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PANEL DE CONTROL</Text>
        <Text style={styles.subtitle}>Administración del Evento</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}><Text style={styles.logoutText}>Cerrar Sesión</Text></TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <View style={styles.glassCard}><Text style={styles.val}>{kpis.totalVisitors}</Text><Text style={styles.label}>Visitantes</Text></View>
        <View style={styles.glassCard}><Text style={styles.val}>{kpis.activeStands}</Text><Text style={styles.label}>Stands</Text></View>
      </View>

      <TouchableOpacity onPress={handleHappyHour} activeOpacity={0.8}>
        <LinearGradient
          colors={kpis.happyHour ? [PremiumTheme.colors.danger, '#8B2635'] : [PremiumTheme.colors.goldPrimary, PremiumTheme.colors.goldDark]}
          style={styles.btnGradient}
        >
          <Text style={styles.btnText}>{kpis.happyHour ? 'DESACTIVAR HAPPY HOUR' : 'ACTIVAR HAPPY HOUR'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default AdminDashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', backgroundColor: PremiumTheme.colors.bgDark },
  header: { padding: 25, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: PremiumTheme.colors.glassBorder, marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: PremiumTheme.colors.textLight, letterSpacing: 2 },
  subtitle: { fontSize: 12, color: PremiumTheme.colors.textMuted, marginTop: 5 },
  logoutBtn: { position: 'absolute', top: 60, right: 25 },
  logoutText: { color: PremiumTheme.colors.danger, fontWeight: 'bold' },
  grid: { flexDirection: 'row', padding: 20, justifyContent: 'space-between' },
  glassCard: { backgroundColor: PremiumTheme.colors.glassBg, padding: 20, borderRadius: 15, width: '48%', alignItems: 'center', borderWidth: 1, borderColor: PremiumTheme.colors.glassBorder, ...PremiumTheme.shadows.card },
  val: { fontSize: 28, fontWeight: 'bold', color: PremiumTheme.colors.goldPrimary },
  label: { color: PremiumTheme.colors.textMuted, fontSize: 12, textTransform: 'uppercase', marginTop: 5 },
  btnGradient: { margin: 20, padding: 20, borderRadius: 15, alignItems: 'center', ...PremiumTheme.shadows.glow },
  btnText: { color: PremiumTheme.colors.bgDark, fontWeight: 'bold', letterSpacing: 1 }
});
