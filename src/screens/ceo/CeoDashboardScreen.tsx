import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView, SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CeoStackParamList } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';
import { PremiumTheme } from '../../theme/PremiumTheme';

export const CeoDashboardScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<CeoStackParamList>>();
  const [metrics, setMetrics] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  useFocusEffect(useCallback(() => { mockDbService.getCeoMetrics().then(setMetrics); }, []));

  const handleExport = async () => {
    setExporting(true);
    await mockDbService.generateDatabaseExport();
    setExporting(false);
    Alert.alert('Exportación Exitosa', 'Archivo generado en servidor mock.');
  };

  if (!metrics) {
    return (
      <LinearGradient colors={['#000', PremiumTheme.colors.bgMedium]} style={styles.loaderWrap}>
        <ActivityIndicator size="large" color={PremiumTheme.colors.goldPrimary} />
      </LinearGradient>
    );
  }

  const isCeo = user?.role === 'ceo';
  const displayName = user?.name || 'Director Ejecutivo';

  return (
    <LinearGradient colors={['#000000', '#1A0F00', PremiumTheme.colors.bgMedium]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {isCeo && (
                <View style={styles.crownBadge}>
                  <Text style={styles.crownEmoji}>👑</Text>
                  <Text style={styles.crownText}>CEO</Text>
                </View>
              )}
              <Text style={styles.title}>DIRECTORIO EJECUTIVO</Text>
              <Text style={styles.displayName}>{displayName}</Text>
              <Text style={styles.subtitle}>Visión Global del Sistema · Feria 2026</Text>
            </View>
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>↩ Salir</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sysStatusRow}>
            <View style={styles.sysStatusDot} />
            <Text style={styles.sysStatusText}>Sistema {metrics.sysStatus}</Text>
            <Text style={styles.sysStatusDate}>Tolima · Mayo 2026</Text>
          </View>

          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiIcon}>👥</Text>
              <Text style={styles.kpiVal}>{metrics.totalUsers.toLocaleString()}</Text>
              <Text style={styles.kpiLabel}>Usuarios Totales</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiIcon}>🌍</Text>
              <Text style={styles.kpiVal}>{metrics.activeBuyers}</Text>
              <Text style={styles.kpiLabel}>Compradores Activos</Text>
            </View>
          </View>

          <LinearGradient
            colors={[PremiumTheme.colors.goldPrimary + '22', PremiumTheme.colors.goldPrimary + '08']}
            style={styles.glassCard}
          >
            <View style={styles.glassCardInner}>
              <Text style={styles.label}>VALOR TOTAL SUBASTA</Text>
              <Text style={styles.valGold}>${metrics.totalAuctionValueUSD.toLocaleString()} USD</Text>
              <View style={styles.divider} />
              <Text style={styles.label}>COMPRADORES INTERNACIONALES</Text>
              <Text style={styles.val}>{metrics.activeBuyers} activos</Text>
            </View>
          </LinearGradient>

          <View style={styles.navRow}>
            <TouchableOpacity
              style={styles.navCard}
              onPress={() => navigation.navigate('Analytics')}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#1a3a2a', '#0d2218']} style={styles.navCardGradient}>
                <Text style={styles.navCardIcon}>📊</Text>
                <Text style={styles.navCardTitle}>ANALÍTICA PREMIUM</Text>
                <Text style={styles.navCardSub}>Tendencias, gráficos y KPIs en tiempo real</Text>
                <Text style={styles.navCardArrow}>→</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navCard}
              onPress={() => navigation.navigate('Reports')}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#1a2540', '#0d1a30']} style={styles.navCardGradient}>
                <Text style={styles.navCardIcon}>📋</Text>
                <Text style={styles.navCardTitle}>REPORTES</Text>
                <Text style={styles.navCardSub}>Informes ejecutivos y exportaciones</Text>
                <Text style={styles.navCardArrow}>→</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleExport} disabled={exporting} activeOpacity={0.8} style={{ marginHorizontal: 20, marginBottom: 30 }}>
            <LinearGradient colors={['#4DA8DA', '#00509E']} style={styles.exportBtn}>
              {exporting
                ? <ActivityIndicator color="#FFF" />
                : <>
                    <Text style={styles.exportIcon}>📤</Text>
                    <Text style={styles.exportText}>EXPORTAR BASE DE DATOS (XLSX)</Text>
                  </>
              }
            </LinearGradient>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default CeoDashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 24, paddingTop: 20 },
  headerLeft: { flex: 1 },
  crownBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: PremiumTheme.colors.goldPrimary + '20', borderWidth: 1, borderColor: PremiumTheme.colors.goldPrimary + '60', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 10 },
  crownEmoji: { fontSize: 16 },
  crownText: { fontSize: 12, fontWeight: '900', color: PremiumTheme.colors.goldPrimary, letterSpacing: 2 },
  title: { fontSize: 18, fontWeight: '900', color: PremiumTheme.colors.textLight, letterSpacing: 2 },
  displayName: { fontSize: 13, color: PremiumTheme.colors.goldLight, fontWeight: '700', marginTop: 4 },
  subtitle: { fontSize: 11, color: PremiumTheme.colors.textMuted, marginTop: 3 },
  logoutBtn: { paddingTop: 4 },
  logoutText: { color: '#ff6b6b', fontWeight: '700', fontSize: 13 },
  sysStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 24, marginBottom: 20, backgroundColor: 'rgba(0,200,80,0.08)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, alignSelf: 'flex-start' },
  sysStatusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00C851' },
  sysStatusText: { fontSize: 11, color: '#00C851', fontWeight: '700' },
  sysStatusDate: { fontSize: 10, color: PremiumTheme.colors.textMuted },
  kpiRow: { flexDirection: 'row', marginHorizontal: 20, gap: 12, marginBottom: 16 },
  kpiCard: { flex: 1, backgroundColor: PremiumTheme.colors.glassBg, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: PremiumTheme.colors.glassBorder },
  kpiIcon: { fontSize: 24, marginBottom: 6 },
  kpiVal: { fontSize: 24, fontWeight: '900', color: PremiumTheme.colors.textLight },
  kpiLabel: { fontSize: 10, color: PremiumTheme.colors.textMuted, textAlign: 'center', marginTop: 4, fontWeight: '600' },
  glassCard: { margin: 20, marginTop: 0, borderRadius: 16, borderWidth: 1, borderColor: PremiumTheme.colors.goldPrimary + '30' },
  glassCardInner: { padding: 24 },
  label: { fontSize: 11, color: PremiumTheme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  val: { fontSize: 28, fontWeight: '900', color: PremiumTheme.colors.textLight },
  valGold: { fontSize: 32, fontWeight: '900', color: PremiumTheme.colors.goldPrimary },
  divider: { height: 1, backgroundColor: PremiumTheme.colors.glassBorder, marginVertical: 18 },
  navRow: { flexDirection: 'row', marginHorizontal: 20, gap: 12, marginBottom: 16 },
  navCard: { flex: 1, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: PremiumTheme.colors.glassBorder },
  navCardGradient: { padding: 18 },
  navCardIcon: { fontSize: 28, marginBottom: 8 },
  navCardTitle: { fontSize: 11, fontWeight: '900', color: PremiumTheme.colors.goldLight, letterSpacing: 1, marginBottom: 4 },
  navCardSub: { fontSize: 10, color: PremiumTheme.colors.textMuted, lineHeight: 14, marginBottom: 12 },
  navCardArrow: { fontSize: 18, color: PremiumTheme.colors.goldPrimary, fontWeight: '700' },
  exportBtn: { padding: 18, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 },
  exportIcon: { fontSize: 18 },
  exportText: { color: '#FFF', fontWeight: '900', letterSpacing: 1, fontSize: 13 },
});
