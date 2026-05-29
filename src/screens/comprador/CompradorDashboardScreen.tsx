import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';
import { LOTES_SUBASTA, NIVELES, getTopStands, getNivelActual, getNivelSiguiente } from '../../data/mockData';

const C = { bg: '#0B1608', card: '#142210', card2: '#1C3018', gold: '#CFA020', goldLight: '#EAC040', text: '#F3EED6', muted: '#6A8060', danger: '#E05050', red: '#C62828' };
const { width } = Dimensions.get('window');

const PREMIO_LABEL: Record<string, string> = {
  cafe: '☕ Café Especial', kits_cafe: '🎁 Kit de Café', cursos: '📚 Curso SCA', visitas_exclusivas: '🏡 Visita Exclusiva',
};

export const CompradorDashboardScreen = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const nav = useNavigation<any>();
  const [stats, setStats] = useState({ visitorCount: 847, activeStands: 11, happyHour: false });
  const [userStats, setUserStats] = useState<any>({ points: 0, stamps: [] });
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.03, duration: 1800, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1.0, duration: 1800, useNativeDriver: true }),
    ])).start();
  }, []);

  useFocusEffect(useCallback(() => {
    let alive = true;
    mockDbService.getHomeStats().then(d => { if (alive) setStats(d); });
    if (user?.uid) mockDbService.getUserStats(user.uid).then(d => { if (alive) setUserStats(d); });
    return () => { alive = false; };
  }, [user]));

  const puntos: number = userStats?.points ?? 0;
  const stampsCount: number = (userStats?.stamps ?? []).length;
  const nivelActual = getNivelActual(puntos);
  const nivelSig = getNivelSiguiente(puntos);
  const progPct = nivelActual && nivelSig ? Math.min(((puntos - nivelActual.minPuntos) / (nivelSig.minPuntos - nivelActual.minPuntos)) * 100, 100) : nivelActual ? 100 : 0;
  const topStands = getTopStands(3);
  const activeLots = LOTES_SUBASTA.filter(l => l.activa);

  const TILES = [
    { icon: '🗺️', label: t('home.fair_map', 'Mapa'), sub: 'Stands y escenarios', screen: 'MapaFeria', grad: ['#1B5E20', C.card] as [string,string] },
    { icon: '📅', label: t('home.agenda', 'Agenda'), sub: '3 días de programa', screen: 'Agenda', grad: ['#1A237E', C.card] as [string,string] },
    { icon: '🏛️', label: t('home.sponsors', 'Auspiciadores'), sub: 'Gobernación', screen: 'Auspiciadores', grad: ['#37474F', C.card] as [string,string] },
    { icon: '🛂', label: 'Mi Pasaporte', sub: `${stampsCount}/38 sellos`, screen: 'CompradorPasaporte', grad: ['#3A2618', C.card] as [string,string] },
    { icon: '🛍️', label: t('comprador.catalog', 'Catálogo'), sub: 'Productos de los stands', screen: 'Catalogo', grad: ['#1A4A10', C.card] as [string,string] },
  ];

  return (
    <LinearGradient colors={[C.bg, '#0A180A', C.bg]} style={s.container}>
      <Animated.ScrollView style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Header */}
        <View style={s.badgeRow}>
          <LinearGradient colors={['#7A5200', C.gold, '#7A5200']} style={s.certBadge}>
            <Text style={s.certText}>🌍  COMPRADOR INTERNACIONAL CERTIFICADO</Text>
          </LinearGradient>
          <TouchableOpacity onPress={logout} style={s.logoutBtn}>
            <Text style={s.logoutText}>↩</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.welcomeName}>{user?.name || 'Comprador'}</Text>
        <Text style={s.welcomeSub}>Portal Comprador · Feria Internacional del Café 2026</Text>

        {/* Stats Strip */}
        <View style={s.statsStrip}>
          {[
            { val: puntos, lbl: 'Puntos' },
            { val: stampsCount, lbl: 'Sellos' },
            { val: activeLots.length, lbl: 'Subastas' },
            { val: stats.activeStands, lbl: 'Stands' },
          ].map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={s.statDiv} />}
              <View style={s.statItem}>
                <Text style={s.statNum}>{item.val}</Text>
                <Text style={s.statLbl}>{item.lbl}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Level Card */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <LinearGradient
            colors={nivelActual ? [nivelActual.color + '44', nivelActual.color + '11', C.card] : [C.card2, C.card]}
            style={[s.levelCard, { borderColor: nivelActual?.color ?? C.muted }]}
          >
            <View style={s.levelRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.levelLabel}>TU NIVEL</Text>
                <Text style={[s.levelName, { color: nivelActual?.color ?? C.muted }]}>
                  {nivelActual ? `${nivelActual.emoji}  ${nivelActual.nombre}` : '☕  ¡Haz tu primera compra!'}
                </Text>
                {nivelSig && <Text style={s.levelNext}>{nivelSig.minPuntos - puntos} pts → {nivelSig.nombre}</Text>}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[s.levelPts, { color: nivelActual?.color ?? C.gold }]}>{puntos}</Text>
                <Text style={s.levelPtsLbl}>pts</Text>
              </View>
            </View>
            <View style={s.progBg}>
              <View style={[s.progFill, { width: `${progPct}%` as any, backgroundColor: nivelActual?.color ?? C.muted }]} />
            </View>
            {nivelActual && <Text style={s.prizeText}>{PREMIO_LABEL[nivelActual.premioKey]} desbloqueado</Text>}
          </LinearGradient>
        </Animated.View>

        {/* Live Auction */}
        <View style={s.section}>
          <View style={s.sectionHeaderRow}>
            <Text style={s.sectionTitle}>🔴  {t('auction.title', 'SUBASTA INTERNACIONAL')}</Text>
            <View style={s.livePill}><Text style={s.livePillText}>EN VIVO</Text></View>
          </View>
          {activeLots.map((lot) => (
            <TouchableOpacity key={lot.id} style={s.lotCard} onPress={() => nav.navigate('AuctionLive', { lotId: lot.id })} activeOpacity={0.85}>
              <LinearGradient colors={['#3A0808', '#1A0404', C.card]} style={s.lotGrad}>
                <View style={s.lotTop}>
                  <View style={s.scaBadge}>
                    <Text style={s.scaNum}>{lot.sca.toFixed(1)}</Text>
                    <Text style={s.scaLbl}>SCA</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.lotFinca}>{lot.finca}</Text>
                    <Text style={s.lotVariedad}>{lot.variedad} · {lot.proceso}</Text>
                    <Text style={s.lotAltitud}>⛰️ {lot.altitud} m.s.n.m. · ⚖️ {lot.peso_kg}kg</Text>
                  </View>
                  <Text style={s.lotArrow}>›</Text>
                </View>
                <View style={s.lotBidRow}>
                  <Text style={s.lotBidLabel}>Puja actual:</Text>
                  <Text style={s.lotBidAmt}>${lot.puja_actual_usd.toLocaleString('en-US')} USD</Text>
                  <Text style={s.lotBidCount}>{lot.num_pujas} pujas</Text>
                </View>
                <View style={s.notesRow}>
                  {lot.notas.slice(0, 3).map((n, i) => (
                    <View key={i} style={s.noteChip}><Text style={s.noteText}>{n}</Text></View>
                  ))}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
          {LOTES_SUBASTA.filter(l => !l.activa).map(lot => (
            <View key={lot.id} style={[s.lotCard, { opacity: 0.5 }]}>
              <View style={s.lotClosed}>
                <Text style={s.lotClosedName}>{lot.finca}</Text>
                <Text style={[s.lotBidAmt, { color: C.muted }]}>🔒 Adjudicado</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Navigation Grid */}
        <Text style={[s.sectionTitle, { marginBottom: 12 }]}>EXPLORAR LA FERIA</Text>
        <View style={s.tileGrid}>
          {TILES.map((tile, idx) => (
            <TouchableOpacity key={idx} style={s.tile} onPress={() => nav.navigate(tile.screen)} activeOpacity={0.8}>
              <LinearGradient colors={tile.grad} style={s.tileGrad}>
                <Text style={s.tileIcon}>{tile.icon}</Text>
                <Text style={s.tileLbl}>{tile.label}</Text>
                <Text style={s.tileSub}>{tile.sub}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Top Stands */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>STANDS MÁS VISITADOS</Text>
          {topStands.map((stand, idx) => {
            const max = topStands[0].ventas ?? 1;
            const pct = ((stand.ventas ?? 0) / max) * 100;
            return (
              <View key={stand.id} style={s.standRow}>
                <Text style={[s.standRank, idx === 0 && { color: C.gold }]}>#{idx + 1}</Text>
                <View style={{ flex: 1 }}>
                  <View style={s.standNameRow}>
                    <Text style={s.standName} numberOfLines={1}>{stand.nombre}</Text>
                    <Text style={s.standSales}>{stand.ventas} ventas</Text>
                  </View>
                  <View style={s.barBg}><View style={[s.barFill, { width: `${pct}%` as any }]} /></View>
                </View>
              </View>
            );
          })}
        </View>
      </Animated.ScrollView>
    </LinearGradient>
  );
};

export default CompradorDashboardScreen;

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 54, paddingBottom: 40 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  certBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, flexShrink: 1 },
  certText: { fontSize: 9, fontWeight: '900', color: C.bg, letterSpacing: 0.8 },
  logoutBtn: { backgroundColor: C.card, borderRadius: 20, padding: 8, borderWidth: 1, borderColor: C.muted + '44' },
  logoutText: { fontSize: 16, color: C.danger },
  welcomeName: { fontSize: 24, fontWeight: '900', color: C.text },
  welcomeSub: { fontSize: 11, color: C.muted, marginTop: 2, marginBottom: 16 },
  statsStrip: { flexDirection: 'row', backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: C.card2 },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '900', color: C.gold },
  statLbl: { fontSize: 9, color: C.muted, marginTop: 2, textTransform: 'uppercase', textAlign: 'center' },
  statDiv: { width: 1, backgroundColor: C.card2 },
  levelCard: { borderRadius: 16, borderWidth: 1.5, padding: 18, marginBottom: 14 },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  levelLabel: { fontSize: 9, color: C.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  levelName: { fontSize: 20, fontWeight: '900' },
  levelNext: { fontSize: 11, color: C.muted, marginTop: 4 },
  levelPts: { fontSize: 38, fontWeight: '900', lineHeight: 42 },
  levelPtsLbl: { fontSize: 12, color: C.muted },
  progBg: { height: 8, backgroundColor: C.card2, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progFill: { height: '100%', borderRadius: 4 },
  prizeText: { fontSize: 10, color: C.muted, textAlign: 'right' },
  section: { marginBottom: 16 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionTitle: { fontSize: 10, fontWeight: '900', color: C.muted, letterSpacing: 2, textTransform: 'uppercase' },
  livePill: { backgroundColor: C.red, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  livePillText: { fontSize: 9, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  lotCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: C.red + '44' },
  lotGrad: { padding: 16 },
  lotTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  scaBadge: { backgroundColor: C.gold, borderRadius: 10, padding: 10, alignItems: 'center', minWidth: 54 },
  scaNum: { fontSize: 20, fontWeight: '900', color: C.bg },
  scaLbl: { fontSize: 8, fontWeight: '900', color: C.bg, letterSpacing: 1 },
  lotFinca: { fontSize: 14, fontWeight: '900', color: C.text },
  lotVariedad: { fontSize: 11, color: C.gold, marginTop: 3, fontWeight: '700' },
  lotAltitud: { fontSize: 10, color: C.muted, marginTop: 3 },
  lotArrow: { fontSize: 22, color: C.gold },
  lotBidRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  lotBidLabel: { fontSize: 11, color: C.muted },
  lotBidAmt: { fontSize: 16, fontWeight: '900', color: C.gold, flex: 1 },
  lotBidCount: { fontSize: 10, color: C.muted },
  notesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  noteChip: { backgroundColor: 'rgba(207,160,32,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  noteText: { fontSize: 10, color: C.goldLight },
  lotClosed: { backgroundColor: C.card, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lotClosedName: { fontSize: 13, color: C.muted, fontWeight: '700' },
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  tile: { width: (width - 50) / 2, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: C.card2 },
  tileGrad: { padding: 16, height: 100, justifyContent: 'space-between' },
  tileIcon: { fontSize: 24 },
  tileLbl: { fontSize: 13, fontWeight: '900', color: C.text },
  tileSub: { fontSize: 10, color: C.muted },
  standRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  standRank: { fontSize: 12, fontWeight: '900', color: C.muted, width: 26, textAlign: 'center' },
  standNameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  standName: { fontSize: 12, color: C.text, fontWeight: '700', flex: 1 },
  standSales: { fontSize: 11, color: C.gold, fontWeight: '700' },
  barBg: { height: 5, backgroundColor: C.card2, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: C.gold, borderRadius: 3 },
});
