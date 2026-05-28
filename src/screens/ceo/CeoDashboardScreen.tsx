import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';
import { LOTES_SUBASTA, getTopStands } from '../../data/mockData';

const C = { bg: '#0B1608', card: '#142210', card2: '#1C3018', gold: '#CFA020', goldLight: '#EAC040', text: '#F3EED6', muted: '#6A8060', danger: '#E05050', green: '#00C851', blue: '#4DA8DA' };

const MOCK_PAISES = [
  { flag: '🇨🇴', pais: 'Colombia', count: 892 },
  { flag: '🇺🇸', pais: 'USA', count: 124 },
  { flag: '🇩🇪', pais: 'Alemania', count: 67 },
  { flag: '🇯🇵', pais: 'Japón', count: 45 },
  { flag: '🇫🇷', pais: 'Francia', count: 38 },
  { flag: '🇬🇧', pais: 'Reino Unido', count: 32 },
  { flag: '🇮🇹', pais: 'Italia', count: 29 },
  { flag: '🇨🇳', pais: 'China', count: 16 },
];

const MOCK_NIVELES = [
  { nivel: 'Modo Cafetero', emoji: '☕', count: 847, color: '#8B6914' },
  { nivel: 'Cazador de Granos', emoji: '🔍', count: 291, color: '#2E7D32' },
  { nivel: 'Maestro del Grano', emoji: '🏆', count: 78, color: '#1565C0' },
  { nivel: 'Gold Brew Society', emoji: '👑', count: 27, color: '#CFA020' },
];

export const CeoDashboardScreen = () => {
  const { user, logout } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(useCallback(() => {
    mockDbService.getCeoMetrics().then(m => {
      setMetrics(m);
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    });
  }, []));

  const handleExport = async (type: 'fair' | 'personal') => {
    if (type === 'personal') {
      Alert.alert(
        '🔒 Exportar Datos Personales',
        'Estás a punto de exportar datos personales de visitantes (nombre, cédula, correo, municipio). Solo el CEO tiene este acceso.\n\n¿Confirmar exportación?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar', style: 'destructive',
            onPress: async () => {
              setExporting('personal');
              await mockDbService.generateDatabaseExport();
              setExporting(null);
              Alert.alert('Exportación CEO Exitosa', 'Datos personales exportados con cifrado AES-256.\nArchivo: registros_feria_2026.xlsx');
            }
          },
        ]
      );
      return;
    }
    setExporting(type);
    await new Promise(r => setTimeout(r, 1500));
    setExporting(null);
    Alert.alert('Exportación Exitosa', 'KPIs de la feria exportados como XLSX.\nArchivo: kpis_feria_2026.xlsx');
  };

  if (!metrics) return (
    <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={C.gold} />
    </View>
  );

  const auctionTotal = LOTES_SUBASTA.reduce((acc, l) => acc + l.puja_actual_usd, 0);
  const topStands = getTopStands(3);
  const totalPaises = MOCK_PAISES.reduce((a, b) => a + b.count, 0);
  const maxPaises = MOCK_PAISES[0].count;

  return (
    <LinearGradient colors={['#000000', '#0A0A00', C.bg]} style={s.container}>
      <Animated.ScrollView style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Crown Header */}
        <LinearGradient colors={['#7A5200', C.gold + 'AA', '#7A5200']} style={s.crownBanner}>
          <Text style={s.crownEmoji}>👑</Text>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={s.crownRole}>CEO · DIRECTORIO EJECUTIVO</Text>
            <Text style={s.crownName}>{user?.name || 'Director Ejecutivo'}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={s.logoutBtn}>
            <Text style={s.logoutText}>↩</Text>
          </TouchableOpacity>
        </LinearGradient>

        <Text style={s.headerSub}>Feria Internacional del Café · Chaparral, Tolima 2026</Text>

        {/* System Status */}
        <View style={s.sysRow}>
          <View style={s.sysDot} />
          <Text style={s.sysText}>Sistema {metrics.sysStatus ?? 'Operativo'}</Text>
          <Text style={s.sysDate}>May 2026</Text>
        </View>

        {/* KPI Grid — full access */}
        <View style={s.kpiGrid}>
          {[
            { icon: '👥', val: metrics.totalUsers.toLocaleString(), lbl: 'Usuarios\nRegistrados', color: C.blue },
            { icon: '🌍', val: metrics.activeBuyers.toString(), lbl: 'Compradores\nInternacionales', color: C.green },
            { icon: '💰', val: `$${auctionTotal.toLocaleString()}`, lbl: 'Valor Total\nSubastas (USD)', color: C.gold },
            { icon: '🏪', val: topStands.length.toString() + '+', lbl: 'Stands\nActivos', color: '#7B1FA2' },
          ].map((kpi, i) => (
            <View key={i} style={s.kpiCard}>
              <Text style={s.kpiIcon}>{kpi.icon}</Text>
              <Text style={[s.kpiVal, { color: kpi.color }]}>{kpi.val}</Text>
              <Text style={s.kpiLbl}>{kpi.lbl}</Text>
            </View>
          ))}
        </View>

        {/* Auction Overview */}
        <LinearGradient colors={['#3A0808', '#1A0404', C.card]} style={s.auctionCard}>
          <Text style={s.auctionTitle}>🔴  SUBASTA INTERNACIONAL — RESUMEN EJECUTIVO</Text>
          {LOTES_SUBASTA.map(lot => (
            <View key={lot.id} style={s.lotRow}>
              <View style={[s.lotDot, { backgroundColor: lot.activa ? C.danger : C.muted }]} />
              <Text style={s.lotFinca} numberOfLines={1}>{lot.finca}</Text>
              <Text style={[s.lotStatus, { color: lot.activa ? '#FF8080' : C.muted }]}>{lot.activa ? 'ACTIVA' : 'CERRADA'}</Text>
              <Text style={s.lotBid}>${lot.puja_actual_usd.toLocaleString()} USD</Text>
            </View>
          ))}
          <View style={s.auctionTotal}>
            <Text style={s.auctionTotalLbl}>VALOR TOTAL ADJUDICADO</Text>
            <Text style={s.auctionTotalVal}>${auctionTotal.toLocaleString()} USD</Text>
          </View>
        </LinearGradient>

        {/* Visitors by Level */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>📊  DISTRIBUCIÓN POR NIVEL GAMIFICACIÓN</Text>
          {MOCK_NIVELES.map((item) => {
            const total = MOCK_NIVELES.reduce((a, b) => a + b.count, 0);
            const pct = (item.count / total) * 100;
            return (
              <View key={item.nivel} style={s.nivelRow}>
                <Text style={s.nivelEmoji}>{item.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <View style={s.nivelNameRow}>
                    <Text style={[s.nivelName, { color: item.color }]}>{item.nivel}</Text>
                    <Text style={s.nivelCount}>{item.count} ({pct.toFixed(1)}%)</Text>
                  </View>
                  <View style={s.barBg}>
                    <View style={[s.barFill, { width: `${pct}%` as any, backgroundColor: item.color }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Countries */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🌐  VISITANTES POR PAÍS DE ORIGEN</Text>
          {MOCK_PAISES.map((item) => {
            const pct = (item.count / totalPaises) * 100;
            const barPct = (item.count / maxPaises) * 100;
            return (
              <View key={item.pais} style={s.paisRow}>
                <Text style={s.paisFlag}>{item.flag}</Text>
                <View style={{ flex: 1 }}>
                  <View style={s.paisNameRow}>
                    <Text style={s.paisName}>{item.pais}</Text>
                    <Text style={s.paisCount}>{item.count} ({pct.toFixed(1)}%)</Text>
                  </View>
                  <View style={s.barBg}>
                    <View style={[s.barFill, { width: `${barPct}%` as any, backgroundColor: C.blue }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Top Stands */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🏪  TOP STANDS (VENTAS)</Text>
          {topStands.map((stand, idx) => {
            const maxV = topStands[0].ventas ?? 1;
            const pct = ((stand.ventas ?? 0) / maxV) * 100;
            return (
              <View key={stand.id} style={s.standRow}>
                <Text style={s.standMedal}>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</Text>
                <View style={{ flex: 1 }}>
                  <View style={s.standNameRow}>
                    <Text style={s.standName} numberOfLines={1}>{stand.nombre}</Text>
                    <Text style={s.standSales}>{(stand.ventas ?? 0).toLocaleString()}</Text>
                  </View>
                  <View style={s.barBg}>
                    <View style={[s.barFill, { width: `${pct}%` as any, backgroundColor: idx === 0 ? C.gold : idx === 1 ? '#C0C0C0' : '#CD7F32' }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Export Section — CEO has full access */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>📤  EXPORTAR DATOS</Text>

          {/* Fair data (same as admin) */}
          <TouchableOpacity onPress={() => handleExport('fair')} disabled={!!exporting} activeOpacity={0.85}>
            <LinearGradient colors={[C.blue, '#00509E']} style={s.exportBtn}>
              {exporting === 'fair' ? <ActivityIndicator color="#FFF" /> : (
                <>
                  <Text style={s.exportIcon}>📊</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.exportBtnText}>EXPORTAR DATOS DE LA FERIA</Text>
                    <Text style={s.exportBtnSub}>KPIs, stands, gamificación · Sin datos personales</Text>
                  </View>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Personal data — CEO exclusive */}
          <View style={s.ceoExclusiveWrap}>
            <View style={s.ceoExclusiveBadge}>
              <Text style={s.ceoExclusiveText}>👑 EXCLUSIVO CEO</Text>
            </View>
            <TouchableOpacity onPress={() => handleExport('personal')} disabled={!!exporting} activeOpacity={0.85} style={{ marginTop: 8 }}>
              <LinearGradient colors={['#7A5200', C.gold, '#7A5200']} style={s.exportBtn}>
                {exporting === 'personal' ? <ActivityIndicator color={C.bg} /> : (
                  <>
                    <Text style={s.exportIcon}>🔐</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.exportBtnText, { color: C.bg }]}>EXPORTAR DATOS PERSONALES</Text>
                      <Text style={[s.exportBtnSub, { color: C.bg + 'CC' }]}>Nombre, cédula, correo, municipio · Cifrado AES-256</Text>
                    </View>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.ScrollView>
    </LinearGradient>
  );
};

export default CeoDashboardScreen;

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 54, paddingBottom: 50 },
  crownBanner: { borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  crownEmoji: { fontSize: 32 },
  crownRole: { fontSize: 9, fontWeight: '900', color: C.bg, letterSpacing: 2, textTransform: 'uppercase' },
  crownName: { fontSize: 16, fontWeight: '900', color: C.bg, marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, padding: 8 },
  logoutText: { fontSize: 16, color: C.bg, fontWeight: '700' },
  headerSub: { fontSize: 10, color: C.muted, marginBottom: 14 },
  sysRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.green + '12', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, alignSelf: 'flex-start', marginBottom: 16, borderWidth: 1, borderColor: C.green + '30' },
  sysDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.green },
  sysText: { fontSize: 11, color: C.green, fontWeight: '700' },
  sysDate: { fontSize: 10, color: C.muted },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  kpiCard: { width: '47.5%', backgroundColor: C.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.card2, alignItems: 'center' },
  kpiIcon: { fontSize: 24, marginBottom: 6 },
  kpiVal: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  kpiLbl: { fontSize: 10, color: C.muted, textAlign: 'center', marginTop: 4, lineHeight: 13 },
  auctionCard: { borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#C62828' + '44' },
  auctionTitle: { fontSize: 10, fontWeight: '900', color: '#FF8080', letterSpacing: 1, marginBottom: 12 },
  lotRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.card2 },
  lotDot: { width: 7, height: 7, borderRadius: 4 },
  lotFinca: { flex: 1, fontSize: 12, color: C.text, fontWeight: '700' },
  lotStatus: { fontSize: 9, fontWeight: '900', letterSpacing: 1, width: 50, textAlign: 'right' },
  lotBid: { fontSize: 12, color: C.gold, fontWeight: '900', width: 90, textAlign: 'right' },
  auctionTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14, paddingTop: 10 },
  auctionTotalLbl: { fontSize: 9, color: C.muted, letterSpacing: 2 },
  auctionTotalVal: { fontSize: 22, fontWeight: '900', color: C.gold },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 10, fontWeight: '900', color: C.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
  nivelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  nivelEmoji: { fontSize: 18, width: 24, textAlign: 'center' },
  nivelNameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  nivelName: { fontSize: 12, fontWeight: '800' },
  nivelCount: { fontSize: 11, color: C.muted },
  barBg: { height: 6, backgroundColor: C.card2, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  paisRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  paisFlag: { fontSize: 18, width: 24, textAlign: 'center' },
  paisNameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  paisName: { fontSize: 12, color: C.text, fontWeight: '700' },
  paisCount: { fontSize: 11, color: C.muted },
  standRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  standMedal: { fontSize: 16, width: 28, textAlign: 'center' },
  standNameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  standName: { fontSize: 12, color: C.text, fontWeight: '700', flex: 1 },
  standSales: { fontSize: 11, color: C.gold, fontWeight: '700' },
  exportBtn: { borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 2 },
  exportIcon: { fontSize: 22 },
  exportBtnText: { fontSize: 12, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
  exportBtnSub: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  ceoExclusiveWrap: { backgroundColor: C.gold + '11', borderRadius: 14, borderWidth: 1.5, borderColor: C.gold + '44', padding: 12, marginTop: 10 },
  ceoExclusiveBadge: { backgroundColor: C.gold, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  ceoExclusiveText: { fontSize: 9, fontWeight: '900', color: C.bg, letterSpacing: 1 },
});
