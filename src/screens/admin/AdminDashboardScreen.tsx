import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Animated, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';
import { NIVELES, getTopStands } from '../../data/mockData';

const C = { bg: '#0B1608', card: '#142210', card2: '#1C3018', gold: '#CFA020', goldLight: '#EAC040', text: '#F3EED6', muted: '#6A8060', danger: '#E05050', green: '#00C851', blue: '#4DA8DA' };

const MOCK_BY_NIVEL = [
  { nivel: 'Modo Cafetero', emoji: '☕', count: 847, color: '#8B6914' },
  { nivel: 'Cazador de Granos', emoji: '🔍', count: 291, color: '#2E7D32' },
  { nivel: 'Maestro del Grano', emoji: '🏆', count: 78, color: '#1565C0' },
  { nivel: 'Gold Brew Society', emoji: '👑', count: 27, color: '#CFA020' },
];

export const AdminDashboardScreen = () => {
  const { logout } = useAuth();
  const [kpis, setKpis] = useState<any>(null);
  const [exporting, setExporting] = useState(false);
  const [happyHourLoading, setHappyHourLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadData = async () => {
    const data = await mockDbService.getAdminKPIs();
    setKpis(data);
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleHappyHour = async () => {
    setHappyHourLoading(true);
    await mockDbService.toggleHappyHour();
    await loadData();
    setHappyHourLoading(false);
  };

  const handleExport = async (type: 'kpi' | 'stands') => {
    setExporting(true);
    await new Promise(r => setTimeout(r, 1500));
    setExporting(false);
    Alert.alert('Exportación Exitosa', `${type === 'kpi' ? 'KPIs de la feria' : 'Ranking de stands'} exportado como XLSX.\n\n⚠️ Este reporte no contiene datos personales de visitantes.`);
  };

  if (!kpis) return (
    <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={C.gold} />
    </View>
  );

  const topStands = getTopStands(5);
  const maxStandSales = topStands[0]?.ventas ?? 1;
  const totalRegistrados = MOCK_BY_NIVEL.reduce((a, b) => a + b.count, 0);

  return (
    <LinearGradient colors={[C.bg, '#050E04', C.bg]} style={s.container}>
      <Animated.ScrollView style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Header */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.roleLabel}>🔧  ADMINISTRADOR</Text>
            <Text style={s.title}>PANEL DE CONTROL</Text>
            <Text style={s.subtitle}>Feria Internacional del Café · Chaparral 2026</Text>
          </View>
          <TouchableOpacity onPress={logout} style={s.logoutBtn}>
            <Text style={s.logoutText}>↩ Salir</Text>
          </TouchableOpacity>
        </View>

        {/* System Status */}
        <View style={s.sysRow}>
          <View style={s.sysDot} />
          <Text style={s.sysText}>Sistema Operativo</Text>
          <Text style={s.sysMeta}>Tolima · Mayo 2026</Text>
        </View>

        {/* KPI Grid */}
        <View style={s.kpiGrid}>
          {[
            { icon: '👥', val: kpis.totalVisitors.toLocaleString(), lbl: 'Visitantes Registrados', color: C.blue },
            { icon: '🏪', val: kpis.activeStands.toString(), lbl: 'Stands Activos', color: C.green },
            { icon: '⭐', val: totalRegistrados.toLocaleString(), lbl: 'Con Nivel Gamif.', color: C.gold },
            { icon: '🗺️', val: '38', lbl: 'Municipios Participantes', color: '#7B1FA2' },
          ].map((kpi, i) => (
            <View key={i} style={s.kpiCard}>
              <Text style={s.kpiIcon}>{kpi.icon}</Text>
              <Text style={[s.kpiVal, { color: kpi.color }]}>{kpi.val}</Text>
              <Text style={s.kpiLbl}>{kpi.lbl}</Text>
            </View>
          ))}
        </View>

        {/* Happy Hour Toggle */}
        <LinearGradient
          colors={kpis.happyHour ? ['#7A5200', '#3A2600', C.card] : [C.card2, C.card]}
          style={[s.hhCard, { borderColor: kpis.happyHour ? C.gold : C.muted }]}
        >
          <View style={s.hhContent}>
            <View style={{ flex: 1 }}>
              <Text style={[s.hhTitle, { color: kpis.happyHour ? C.gold : C.text }]}>
                ✨  HAPPY HOUR
              </Text>
              <Text style={s.hhDesc}>
                {kpis.happyHour ? '🟢 ACTIVO — Puntos dobles para todos los visitantes' : 'Inactivo · Actívalo para dar puntos dobles'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleHappyHour} disabled={happyHourLoading} style={[s.hhToggleBtn, { backgroundColor: kpis.happyHour ? C.danger : C.gold }]}>
              {happyHourLoading
                ? <ActivityIndicator size="small" color={C.bg} />
                : <Text style={s.hhToggleText}>{kpis.happyHour ? 'DESACTIVAR' : 'ACTIVAR'}</Text>
              }
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Top Stands Ranking */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🏪  TOP STANDS POR VENTAS</Text>
          {topStands.map((stand, idx) => {
            const pct = ((stand.ventas ?? 0) / maxStandSales) * 100;
            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
            return (
              <View key={stand.id} style={s.standRow}>
                <Text style={s.standMedal}>{medal}</Text>
                <View style={{ flex: 1 }}>
                  <View style={s.standNameRow}>
                    <Text style={s.standName} numberOfLines={1}>{stand.nombre}</Text>
                    <Text style={s.standSales}>{(stand.ventas ?? 0).toLocaleString()} ventas</Text>
                  </View>
                  <View style={s.barBg}>
                    <View style={[s.barFill, { width: `${pct}%` as any, backgroundColor: idx === 0 ? C.gold : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : C.muted }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Visitors by Level */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>📊  VISITANTES POR NIVEL GAMIFICACIÓN</Text>
          {MOCK_BY_NIVEL.map((item) => {
            const pct = (item.count / totalRegistrados) * 100;
            return (
              <View key={item.nivel} style={s.nivelStatRow}>
                <Text style={s.nivelStatEmoji}>{item.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <View style={s.nivelStatNameRow}>
                    <Text style={[s.nivelStatName, { color: item.color }]}>{item.nivel}</Text>
                    <Text style={s.nivelStatCount}>{item.count} ({pct.toFixed(1)}%)</Text>
                  </View>
                  <View style={s.barBg}>
                    <View style={[s.barFill, { width: `${pct}%` as any, backgroundColor: item.color }]} />
                  </View>
                </View>
              </View>
            );
          })}
          <Text style={s.totalNote}>Total con algún nivel: {totalRegistrados.toLocaleString()} visitantes</Text>
        </View>

        {/* Export Section */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>📤  EXPORTAR DATOS DE LA FERIA</Text>
          <View style={s.exportNotice}>
            <Text style={s.exportNoticeText}>⚠️ Los administradores pueden exportar datos de la feria (KPIs, ranking de stands) pero NO datos personales de visitantes. Para exportar datos personales, contacta al CEO.</Text>
          </View>
          <TouchableOpacity onPress={() => handleExport('kpi')} disabled={exporting} activeOpacity={0.8}>
            <LinearGradient colors={[C.blue, '#00509E']} style={s.exportBtn}>
              {exporting ? <ActivityIndicator color="#FFF" /> : (
                <>
                  <Text style={s.exportIcon}>📊</Text>
                  <View>
                    <Text style={s.exportBtnText}>KPIs DE LA FERIA (XLSX)</Text>
                    <Text style={s.exportBtnSub}>Visitantes, stands, puntos · Sin datos personales</Text>
                  </View>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleExport('stands')} disabled={exporting} activeOpacity={0.8} style={{ marginTop: 10 }}>
            <LinearGradient colors={['#1B5E20', '#0D3B15']} style={s.exportBtn}>
              <Text style={s.exportIcon}>🏪</Text>
              <View>
                <Text style={s.exportBtnText}>RANKING DE STANDS (XLSX)</Text>
                <Text style={s.exportBtnSub}>Ventas, municipio, sección</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </LinearGradient>
  );
};

export default AdminDashboardScreen;

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 54, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  roleLabel: { fontSize: 10, color: C.muted, letterSpacing: 2, marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '900', color: C.text, letterSpacing: 1 },
  subtitle: { fontSize: 10, color: C.muted, marginTop: 3 },
  logoutBtn: { backgroundColor: C.card, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: C.muted + '44', marginLeft: 10 },
  logoutText: { fontSize: 12, color: C.danger, fontWeight: '700' },
  sysRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.green + '12', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, alignSelf: 'flex-start', marginBottom: 16, borderWidth: 1, borderColor: C.green + '30' },
  sysDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.green },
  sysText: { fontSize: 11, color: C.green, fontWeight: '700' },
  sysMeta: { fontSize: 10, color: C.muted },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  kpiCard: { width: '47.5%', backgroundColor: C.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.card2, alignItems: 'center' },
  kpiIcon: { fontSize: 24, marginBottom: 6 },
  kpiVal: { fontSize: 28, fontWeight: '900' },
  kpiLbl: { fontSize: 10, color: C.muted, textAlign: 'center', marginTop: 4, lineHeight: 13 },
  hhCard: { borderRadius: 16, borderWidth: 1.5, padding: 18, marginBottom: 16 },
  hhContent: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  hhTitle: { fontSize: 16, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  hhDesc: { fontSize: 11, color: C.muted, lineHeight: 16 },
  hhToggleBtn: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, minWidth: 90, alignItems: 'center' },
  hhToggleText: { fontSize: 10, fontWeight: '900', color: C.bg, letterSpacing: 1 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 10, fontWeight: '900', color: C.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
  standRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  standMedal: { fontSize: 16, width: 30, textAlign: 'center' },
  standNameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  standName: { fontSize: 12, color: C.text, fontWeight: '700', flex: 1 },
  standSales: { fontSize: 11, color: C.gold, fontWeight: '700' },
  barBg: { height: 6, backgroundColor: C.card2, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  nivelStatRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  nivelStatEmoji: { fontSize: 18, width: 26, textAlign: 'center' },
  nivelStatNameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  nivelStatName: { fontSize: 12, fontWeight: '800' },
  nivelStatCount: { fontSize: 11, color: C.muted },
  totalNote: { fontSize: 11, color: C.muted, marginTop: 4 },
  exportNotice: { backgroundColor: '#2A1F00', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: C.gold + '44' },
  exportNoticeText: { fontSize: 11, color: C.muted, lineHeight: 17 },
  exportBtn: { borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  exportIcon: { fontSize: 24 },
  exportBtnText: { fontSize: 12, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
  exportBtnSub: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
});
