import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  SafeAreaView, TouchableOpacity, ActivityIndicator, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { mockDbService } from '../../services/mockDb.service';
import { PremiumTheme } from '../../theme/PremiumTheme';

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_W = SCREEN_W - 80;

const formatCOP = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : `$${(n / 1_000).toFixed(0)}K`;

export default function AnalyticsScreen() {
  const navigation = useNavigation();
  const [data, setData] = useState<any>(null);

  useFocusEffect(useCallback(() => { mockDbService.getAnalyticsData().then(setData); }, []));

  if (!data) {
    return (
      <LinearGradient colors={['#000', PremiumTheme.colors.bgMedium]} style={styles.loaderWrap}>
        <ActivityIndicator size="large" color={PremiumTheme.colors.goldPrimary} />
        <Text style={styles.loaderText}>Cargando analítica…</Text>
      </LinearGradient>
    );
  }

  const maxAttendance = Math.max(...data.attendanceTrend.map((d: any) => d.count));
  const maxStandVisits = data.topStands[0].visits;

  return (
    <LinearGradient colors={['#000000', '#0d0500', PremiumTheme.colors.bgMedium]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>‹ Volver</Text>
            </TouchableOpacity>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerBadge}>📊 PREMIUM</Text>
              <Text style={styles.headerTitle}>ANALÍTICA AVANZADA</Text>
              <Text style={styles.headerSub}>Feria Internacional del Café · Tolima 2026</Text>
            </View>
          </View>

          {/* KPI ROW */}
          <View style={styles.kpiGrid}>
            <View style={[styles.kpiCard, styles.kpiCardGold]}>
              <Text style={styles.kpiEmoji}>👥</Text>
              <Text style={styles.kpiValBig}>{data.kpis.totalAttendees.toLocaleString()}</Text>
              <Text style={styles.kpiLabel}>Asistentes Totales</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiEmoji}>💰</Text>
              <Text style={styles.kpiVal}>{formatCOP(data.kpis.totalRevenueCOP)}</Text>
              <Text style={styles.kpiLabel}>Ingresos Totales</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiEmoji}>⭐</Text>
              <Text style={styles.kpiVal}>{data.kpis.avgRating}/5</Text>
              <Text style={styles.kpiLabel}>Valoración Media</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiEmoji}>☕</Text>
              <Text style={styles.kpiVal}>{data.kpis.activeLots}</Text>
              <Text style={styles.kpiLabel}>Lotes Activos</Text>
            </View>
          </View>

          {/* ATTENDANCE TREND */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>TENDENCIA DE ASISTENCIA</Text>
              <Text style={styles.sectionSub}>Últimos 7 días</Text>
            </View>
            <View style={styles.chartWrap}>
              <View style={styles.barChart}>
                {data.attendanceTrend.map((d: any, i: number) => {
                  const heightPct = d.count / maxAttendance;
                  const isMax = d.count === maxAttendance;
                  return (
                    <View key={i} style={styles.barGroup}>
                      <Text style={styles.barValue}>{d.count}</Text>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            { height: `${Math.round(heightPct * 100)}%` as any },
                            isMax && styles.barFillMax,
                          ]}
                        />
                      </View>
                      <Text style={styles.barDay}>{d.day}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* TOP STANDS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>TOP STANDS POR VISITAS</Text>
              <Text style={styles.sectionSub}>Engagement acumulado</Text>
            </View>
            <View style={styles.chartWrap}>
              {data.topStands.map((stand: any, i: number) => {
                const pct = stand.visits / maxStandVisits;
                return (
                  <View key={i} style={styles.hBarRow}>
                    <View style={styles.hBarMeta}>
                      <Text style={styles.hBarRank}>#{i + 1}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.hBarName} numberOfLines={1}>{stand.name}</Text>
                        <Text style={styles.hBarSub}>{stand.municipality}</Text>
                      </View>
                      <Text style={styles.hBarVal}>{stand.visits}</Text>
                    </View>
                    <View style={styles.hBarTrack}>
                      <View style={[styles.hBarFill, { width: `${Math.round(pct * 100)}%` as any }, i === 0 && styles.hBarFillGold]} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* GEOGRAPHIC */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>DISTRIBUCIÓN GEOGRÁFICA</Text>
              <Text style={styles.sectionSub}>Asistentes por región del Tolima</Text>
            </View>
            <View style={styles.chartWrap}>
              {data.geographic.map((g: any, i: number) => (
                <View key={i} style={styles.geoRow}>
                  <View style={styles.geoHeader}>
                    <Text style={styles.geoRegion}>{g.region}</Text>
                    <Text style={styles.geoCount}>{g.count} · <Text style={styles.geoPct}>{g.pct}%</Text></Text>
                  </View>
                  <View style={styles.geoTrack}>
                    <LinearGradient
                      colors={[PremiumTheme.colors.goldPrimary, PremiumTheme.colors.goldLight]}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={[styles.geoFill, { width: `${g.pct}%` as any }]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* REVENUE */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>INGRESOS POR CATEGORÍA</Text>
              <Text style={styles.sectionSub}>Distribución del total recaudado</Text>
            </View>
            <View style={styles.chartWrap}>
              {data.revenueByCategory.map((r: any, i: number) => {
                const colors: [string, string][] = [
                  [PremiumTheme.colors.goldPrimary, PremiumTheme.colors.goldLight],
                  ['#4DA8DA', '#00509E'],
                  ['#2E8B57', '#3CB371'],
                ];
                return (
                  <View key={i} style={styles.revRow}>
                    <View style={styles.revInfo}>
                      <Text style={styles.revLabel}>{r.label}</Text>
                      <Text style={styles.revAmount}>{formatCOP(r.amount)}</Text>
                      <Text style={styles.revPct}>{r.pct}%</Text>
                    </View>
                    <View style={styles.revTrack}>
                      <LinearGradient
                        colors={colors[i] ?? colors[0]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={[styles.revFill, { width: `${r.pct}%` as any }]}
                      />
                    </View>
                  </View>
                );
              })}
              <View style={styles.revTotal}>
                <Text style={styles.revTotalLabel}>TOTAL RECAUDADO</Text>
                <Text style={styles.revTotalVal}>{formatCOP(data.kpis.totalRevenueCOP)}</Text>
              </View>
            </View>
          </View>

          {/* LEAD CAPTURE */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>CAPTACIÓN DE LEADS</Text>
              <Text style={styles.sectionSub}>Pasaportes digitales registrados</Text>
            </View>
            <View style={[styles.chartWrap, { flexDirection: 'row', gap: 12 }]}>
              {[
                { label: 'Visitantes', count: 1248, icon: '🎫', color: PremiumTheme.colors.goldPrimary },
                { label: 'Compradores', count: 145, icon: '🌍', color: '#4DA8DA' },
                { label: 'Expositores', count: 45, icon: '☕', color: '#2E8B57' },
              ].map((item, i) => (
                <View key={i} style={[styles.leadCard, { borderColor: item.color + '40' }]}>
                  <Text style={styles.leadIcon}>{item.icon}</Text>
                  <Text style={[styles.leadCount, { color: item.color }]}>{item.count}</Text>
                  <Text style={styles.leadLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loaderText: { color: PremiumTheme.colors.textMuted, fontSize: 13 },

  header: { padding: 20, paddingBottom: 12 },
  backBtn: { marginBottom: 12 },
  backText: { fontSize: 16, color: PremiumTheme.colors.goldPrimary, fontWeight: '700' },
  headerTitleWrap: {},
  headerBadge: { fontSize: 11, fontWeight: '800', color: PremiumTheme.colors.goldPrimary, letterSpacing: 2, marginBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: PremiumTheme.colors.textLight, letterSpacing: 2 },
  headerSub: { fontSize: 11, color: PremiumTheme.colors.textMuted, marginTop: 4 },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginHorizontal: 20, marginBottom: 8 },
  kpiCard: { flex: 1, minWidth: '40%', backgroundColor: PremiumTheme.colors.glassBg, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: PremiumTheme.colors.glassBorder },
  kpiCardGold: { borderColor: PremiumTheme.colors.goldPrimary + '50', backgroundColor: PremiumTheme.colors.goldPrimary + '10' },
  kpiEmoji: { fontSize: 22, marginBottom: 4 },
  kpiValBig: { fontSize: 26, fontWeight: '900', color: PremiumTheme.colors.goldPrimary },
  kpiVal: { fontSize: 20, fontWeight: '900', color: PremiumTheme.colors.textLight },
  kpiLabel: { fontSize: 10, color: PremiumTheme.colors.textMuted, textAlign: 'center', marginTop: 3, fontWeight: '600' },

  section: { marginHorizontal: 20, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: PremiumTheme.colors.goldPrimary, letterSpacing: 1 },
  sectionSub: { fontSize: 10, color: PremiumTheme.colors.textMuted },
  chartWrap: { backgroundColor: PremiumTheme.colors.glassBg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: PremiumTheme.colors.glassBorder },

  barChart: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 6 },
  barGroup: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barValue: { fontSize: 8, color: PremiumTheme.colors.textMuted, marginBottom: 2 },
  barTrack: { width: '100%', height: 90, backgroundColor: PremiumTheme.colors.glassBorder, borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', backgroundColor: PremiumTheme.colors.goldPrimary + '70', borderRadius: 4 },
  barFillMax: { backgroundColor: PremiumTheme.colors.goldPrimary },
  barDay: { fontSize: 9, color: PremiumTheme.colors.textMuted, marginTop: 4, fontWeight: '700' },

  hBarRow: { marginBottom: 12 },
  hBarMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  hBarRank: { fontSize: 11, fontWeight: '900', color: PremiumTheme.colors.goldPrimary, width: 22 },
  hBarName: { fontSize: 12, fontWeight: '700', color: PremiumTheme.colors.textLight },
  hBarSub: { fontSize: 10, color: PremiumTheme.colors.textMuted },
  hBarVal: { fontSize: 13, fontWeight: '800', color: PremiumTheme.colors.textLight },
  hBarTrack: { height: 8, backgroundColor: PremiumTheme.colors.glassBorder, borderRadius: 4, overflow: 'hidden' },
  hBarFill: { height: '100%', backgroundColor: PremiumTheme.colors.goldPrimary + '80', borderRadius: 4 },
  hBarFillGold: { backgroundColor: PremiumTheme.colors.goldPrimary },

  geoRow: { marginBottom: 12 },
  geoHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  geoRegion: { fontSize: 12, color: PremiumTheme.colors.textLight, fontWeight: '600' },
  geoCount: { fontSize: 11, color: PremiumTheme.colors.textMuted },
  geoPct: { color: PremiumTheme.colors.goldPrimary, fontWeight: '700' },
  geoTrack: { height: 10, backgroundColor: PremiumTheme.colors.glassBorder, borderRadius: 5, overflow: 'hidden' },
  geoFill: { height: '100%', borderRadius: 5 },

  revRow: { marginBottom: 14 },
  revInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
  revLabel: { flex: 1, fontSize: 12, color: PremiumTheme.colors.textLight, fontWeight: '600' },
  revAmount: { fontSize: 13, color: PremiumTheme.colors.goldPrimary, fontWeight: '800' },
  revPct: { fontSize: 11, color: PremiumTheme.colors.textMuted, marginLeft: 8 },
  revTrack: { height: 12, backgroundColor: PremiumTheme.colors.glassBorder, borderRadius: 6, overflow: 'hidden' },
  revFill: { height: '100%', borderRadius: 6 },
  revTotal: { borderTopWidth: 1, borderTopColor: PremiumTheme.colors.glassBorder, marginTop: 8, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
  revTotalLabel: { fontSize: 11, fontWeight: '900', color: PremiumTheme.colors.textMuted, letterSpacing: 1 },
  revTotalVal: { fontSize: 18, fontWeight: '900', color: PremiumTheme.colors.goldPrimary },

  leadCard: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1 },
  leadIcon: { fontSize: 24, marginBottom: 6 },
  leadCount: { fontSize: 22, fontWeight: '900' },
  leadLabel: { fontSize: 10, color: PremiumTheme.colors.textMuted, marginTop: 4, textAlign: 'center' },
});
