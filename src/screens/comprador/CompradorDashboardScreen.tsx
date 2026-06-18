import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, SafeAreaView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, G, Circle } from 'react-native-svg';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';
import { LOTES_SUBASTA, getTopStands, getNivelActual, getNivelSiguiente } from '../../data/mockData';

const T = {
  bg: '#F9F3E3', card: '#FFFDF8', parchment: '#F5EDD0', parchDark: '#EAD9AA',
  dark: '#2C1A0E', body: '#5C3520', muted: '#9B7B5A', amber: '#C8960C',
  amberLight: '#E8B820', amberPale: '#FBF0C8', amberDark: '#8B6308',
  coffee: '#7B4A2A', coffeeDark: '#4A2010', border: '#EDD9A8',
  borderMed: '#D4B886', danger: '#C0392B', gold: '#B8860B', goldLight: '#D4A520',
  red: '#C62828',
};

const { width, height: screenHeight } = Dimensions.get('window');

const PREMIO_LABEL: Record<string, string> = {
  cafe: '☕ Café Especial', kits_cafe: '🎁 Kit de Café',
  cursos: '📚 Curso SCA', visitas_exclusivas: '🏡 Visita Exclusiva',
};

const CoffeePlantBg = () => {
  const w = width, h = screenHeight;
  const leaf = (hw: number, hh: number) =>
    `M 0,${hh} C ${-hw},${hh * 0.5} ${-hw},${-hh * 0.5} 0,${-hh} C ${hw},${-hh * 0.5} ${hw},${hh * 0.5} 0,${hh} Z`;
  return (
    <Svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' } as any}>
      <G opacity={0.14}>
        <G transform="translate(-8, 8)">
          <Path d="M 18 140 Q 35 90 48 12" stroke="#2A5E2A" strokeWidth="2.5" fill="none" />
          <G transform="translate(25,108) rotate(-55)"><Path d={leaf(13,34)} fill="#3A7A3A" /></G>
          <G transform="translate(36,72) rotate(-25)"><Path d={leaf(11,28)} fill="#4A8C4A" /></G>
          <G transform="translate(44,40) rotate(5)"><Path d={leaf(9,22)} fill="#3A7A3A" /></G>
          <Circle cx="30" cy="65" r="4.5" fill="#C0392B" opacity={0.72} />
          <Circle cx="22" cy="58" r="3" fill="#E74C3C" opacity={0.55} />
        </G>
        <G transform={`translate(${w + 8}, 8) scale(-1,1)`}>
          <Path d="M 18 140 Q 35 90 48 12" stroke="#2A5E2A" strokeWidth="2.5" fill="none" />
          <G transform="translate(25,108) rotate(-55)"><Path d={leaf(13,34)} fill="#4A8C4A" /></G>
          <G transform="translate(36,72) rotate(-25)"><Path d={leaf(11,28)} fill="#3A7A3A" /></G>
          <Circle cx="30" cy="65" r="4" fill="#C0392B" opacity={0.68} />
        </G>
        <G transform={`translate(-14, ${h * 0.42})`}>
          <G transform="rotate(-65)"><Path d={leaf(15,40)} fill="#2D6A2D" /></G>
        </G>
        <G transform={`translate(${w + 14}, ${h * 0.42})`}>
          <G transform="rotate(55)"><Path d={leaf(15,40)} fill="#2D6A2D" /></G>
        </G>
        <G transform={`translate(-6, ${h - 90})`}>
          <Path d="M 22 80 Q 40 45 50 5" stroke="#2A5E2A" strokeWidth="2" fill="none" />
          <G transform="translate(28,60) rotate(-50)"><Path d={leaf(11,28)} fill="#4A8C4A" /></G>
          <Circle cx="36" cy="48" r="3.5" fill="#C0392B" opacity={0.65} />
        </G>
      </G>
    </Svg>
  );
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
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.015, duration: 2800, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1.0,   duration: 2800, useNativeDriver: true }),
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
  const nivelSig    = getNivelSiguiente(puntos);
  const progPct     = nivelActual && nivelSig
    ? Math.min(((puntos - nivelActual.minPuntos) / (nivelSig.minPuntos - nivelActual.minPuntos)) * 100, 100)
    : nivelActual ? 100 : 0;

  const activeLots = LOTES_SUBASTA.filter(l => l.activa);
  const top20 = [...LOTES_SUBASTA].sort((a, b) => b.sca - a.sca);

  const TILES = [
    { icon: '🗺️', label: t('home.fair_map', 'Mapa'),       sub: 'Stands y escenarios', screen: 'MapaFeria',         c1: '#1B5E20', c2: '#2E7D32' },
    { icon: '📅', label: t('home.agenda', 'Agenda'),        sub: '3 días de programa',  screen: 'Agenda',            c1: '#1A237E', c2: '#283593' },
    { icon: '🏛️', label: 'Aliados',                        sub: 'Gobernación',          screen: 'Auspiciadores',     c1: '#37474F', c2: '#455A64' },
    { icon: '🛂', label: 'Mi Pasaporte',                    sub: `${stampsCount}/38 sellos`, screen: 'CompradorPasaporte', c1: '#4A2010', c2: '#7B4A2A' },
    { icon: '🛍️', label: t('comprador.catalog','Catálogo'), sub: 'Productos de stands',  screen: 'Catalogo',          c1: '#1A4A10', c2: '#2E7D22' },
    { icon: '⚡',  label: 'Subasta Live',                   sub: 'Pujas en tiempo real', screen: 'AuctionLive',       c1: '#7A1A1A', c2: '#B71C1C' },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <CoffeePlantBg />
      <Animated.ScrollView style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={s.headerRow}>
          <LinearGradient colors={[T.coffeeDark, T.coffee]} style={s.certBadge}>
            <Text style={s.certText}>🌍 COMPRADOR INTERNACIONAL</Text>
          </LinearGradient>
          <TouchableOpacity onPress={logout} style={s.logoutBtn}>
            <Text style={s.logoutText}>↩</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.welcomeName}>{user?.name || 'Comprador'}</Text>
        <Text style={s.welcomeSub}>Portal Comprador · Feria Internacional del Café 2026</Text>

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <View style={s.statsStrip}>
          <LinearGradient colors={[T.parchment, '#FFFBF0', T.parchment]} style={StyleSheet.absoluteFill} />
          {[
            { val: puntos,           lbl: 'Puntos',   icon: '🪙' },
            { val: stampsCount,      lbl: 'Sellos',   icon: '✅' },
            { val: activeLots.length,lbl: 'Subastas', icon: '🔴' },
            { val: stats.activeStands, lbl: 'Stands', icon: '🏪' },
          ].map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={s.statDiv} />}
              <View style={s.statItem}>
                <Text style={s.statIcon}>{item.icon}</Text>
                <Text style={s.statNum}>{item.val}</Text>
                <Text style={s.statLbl}>{item.lbl}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* ── Level Card ─────────────────────────────────────────────────── */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <LinearGradient
            colors={nivelActual ? [nivelActual.color + '22', T.card] : [T.parchment, T.card]}
            style={[s.levelCard, { borderColor: nivelActual?.color ?? T.borderMed }]}
          >
            <View style={s.levelRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.levelLabel}>TU NIVEL</Text>
                <Text style={[s.levelName, { color: nivelActual?.color ?? T.amber }]}>
                  {nivelActual ? `${nivelActual.emoji}  ${nivelActual.nombre}` : '☕  ¡Haz tu primera compra!'}
                </Text>
                {nivelSig && <Text style={s.levelNext}>{nivelSig.minPuntos - puntos} pts → {nivelSig.nombre}</Text>}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[s.levelPts, { color: nivelActual?.color ?? T.amber }]}>{puntos}</Text>
                <Text style={s.levelPtsLbl}>pts</Text>
              </View>
            </View>
            <View style={s.progBg}>
              <View style={[s.progFill, { width: `${progPct}%` as any, backgroundColor: nivelActual?.color ?? T.amber }]} />
            </View>
            {nivelActual && <Text style={s.prizeText}>{PREMIO_LABEL[nivelActual.premioKey]} desbloqueado</Text>}
          </LinearGradient>
        </Animated.View>

        {/* ── Live Auction ───────────────────────────────────────────────── */}
        <View style={s.section}>
          <View style={s.sectionHeaderRow}>
            <Text style={s.sectionTitle}>🔴  SUBASTA INTERNACIONAL</Text>
            <View style={s.livePill}><Text style={s.livePillText}>EN VIVO</Text></View>
          </View>
          {activeLots.map(lot => (
            <TouchableOpacity key={lot.id} style={s.lotCard} onPress={() => nav.navigate('AuctionLive', { lotId: lot.id })} activeOpacity={0.85}>
              <LinearGradient colors={[T.coffeeDark + 'EE', T.coffee + 'CC', T.card]} style={s.lotGrad}>
                <View style={s.lotTop}>
                  <LinearGradient colors={[T.amber, T.amberDark]} style={s.scaBadge}>
                    <Text style={s.scaNum}>{lot.sca.toFixed(1)}</Text>
                    <Text style={s.scaLbl}>SCA</Text>
                  </LinearGradient>
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
              <View style={[s.lotGrad, { padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: T.parchment, borderRadius: 14 }]}>
                <Text style={s.lotFinca}>{lot.finca}</Text>
                <Text style={{ color: T.muted, fontSize: 12, fontWeight: '700' }}>🔒 Adjudicado</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Top 20 Cafés ───────────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🏆  TOP {top20.length} CAFÉS DE LA SUBASTA</Text>
          <Text style={s.sectionSub}>Ordenados por puntaje SCA</Text>
          {top20.map((lot, idx) => {
            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
            const barPct = ((lot.sca - 80) / (92 - 80)) * 100;
            const isActive = lot.activa;
            return (
              <TouchableOpacity
                key={lot.id}
                style={s.top20Card}
                onPress={() => isActive && nav.navigate('AuctionLive', { lotId: lot.id })}
                activeOpacity={isActive ? 0.8 : 1}
              >
                <View style={s.top20Left}>
                  <Text style={s.top20Medal}>{medal}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.top20NameRow}>
                    <Text style={s.top20Finca} numberOfLines={1}>{lot.finca}</Text>
                    {isActive && <View style={s.liveDot}><Text style={s.liveDotText}>LIVE</Text></View>}
                  </View>
                  <Text style={s.top20Info}>{lot.variedad} · {lot.proceso} · ⛰️ {lot.altitud}m</Text>
                  <View style={s.notesRow}>
                    {lot.notas.slice(0, 2).map((n, i) => (
                      <View key={i} style={s.noteChipSmall}><Text style={s.noteTextSmall}>{n}</Text></View>
                    ))}
                  </View>
                  <View style={s.top20BarBg}>
                    <View style={[s.top20BarFill, { width: `${Math.max(barPct, 8)}%` as any, backgroundColor: idx === 0 ? '#B8860B' : idx === 1 ? '#9B7B5A' : idx === 2 ? '#C0892A' : T.amber }]} />
                  </View>
                </View>
                <View style={s.top20Right}>
                  <Text style={[s.top20Sca, { color: idx < 3 ? T.gold : T.amber }]}>{lot.sca.toFixed(1)}</Text>
                  <Text style={s.top20ScaLbl}>SCA</Text>
                  <Text style={s.top20Usd}>${(lot.puja_actual_usd / 1000).toFixed(1)}k</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Navigation Tiles ───────────────────────────────────────────── */}
        <Text style={[s.sectionTitle, { marginBottom: 10 }]}>EXPLORAR LA FERIA</Text>
        <View style={s.tileGrid}>
          {TILES.map((tile, idx) => (
            <TouchableOpacity key={idx} style={s.tile} onPress={() => nav.navigate(tile.screen)} activeOpacity={0.8}>
              <LinearGradient colors={[tile.c1, tile.c2]} style={s.tileGrad}>
                <Text style={s.tileIcon}>{tile.icon}</Text>
                <Text style={s.tileLbl}>{tile.label}</Text>
                <Text style={s.tileSub}>{tile.sub}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default CompradorDashboardScreen;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  scroll: { padding: 20, paddingTop: 54, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  certBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, flexShrink: 1 },
  certText: { fontSize: 9, fontWeight: '900', color: '#FFF8E0', letterSpacing: 0.8 },
  logoutBtn: { backgroundColor: T.card, borderRadius: 20, padding: 8, borderWidth: 1, borderColor: T.borderMed },
  logoutText: { fontSize: 16, color: T.danger },
  welcomeName: { fontSize: 24, fontWeight: '900', color: T.dark },
  welcomeSub: { fontSize: 11, color: T.muted, marginTop: 2, marginBottom: 16 },
  statsStrip: { flexDirection: 'row', borderRadius: 16, borderWidth: 1, borderColor: T.border, padding: 14, marginBottom: 14, overflow: 'hidden' },
  statItem: { flex: 1, alignItems: 'center' },
  statIcon: { fontSize: 16, marginBottom: 2 },
  statNum: { fontSize: 18, fontWeight: '900', color: T.amber },
  statLbl: { fontSize: 9, color: T.muted, marginTop: 1, textTransform: 'uppercase', textAlign: 'center' },
  statDiv: { width: 1, backgroundColor: T.border },
  levelCard: { borderRadius: 16, borderWidth: 1.5, padding: 18, marginBottom: 14, backgroundColor: T.card },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  levelLabel: { fontSize: 9, color: T.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  levelName: { fontSize: 19, fontWeight: '900' },
  levelNext: { fontSize: 11, color: T.muted, marginTop: 4 },
  levelPts: { fontSize: 36, fontWeight: '900', lineHeight: 40 },
  levelPtsLbl: { fontSize: 12, color: T.muted },
  progBg: { height: 8, backgroundColor: T.parchDark, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progFill: { height: '100%', borderRadius: 4 },
  prizeText: { fontSize: 10, color: T.muted, textAlign: 'right' },
  section: { marginBottom: 16 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionTitle: { fontSize: 10, fontWeight: '900', color: T.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
  sectionSub: { fontSize: 10, color: T.muted, marginTop: -8, marginBottom: 12 },
  livePill: { backgroundColor: T.red, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  livePillText: { fontSize: 9, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  lotCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: T.coffee + '66' },
  lotGrad: { padding: 16 },
  lotTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  scaBadge: { borderRadius: 10, padding: 10, alignItems: 'center', minWidth: 54 },
  scaNum: { fontSize: 20, fontWeight: '900', color: '#FFF8E0' },
  scaLbl: { fontSize: 8, fontWeight: '900', color: '#FFF8E0', letterSpacing: 1 },
  lotFinca: { fontSize: 14, fontWeight: '900', color: T.dark },
  lotVariedad: { fontSize: 11, color: T.coffee, marginTop: 3, fontWeight: '700' },
  lotAltitud: { fontSize: 10, color: T.muted, marginTop: 3 },
  lotArrow: { fontSize: 22, color: T.amber },
  lotBidRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  lotBidLabel: { fontSize: 11, color: T.muted },
  lotBidAmt: { fontSize: 16, fontWeight: '900', color: T.gold, flex: 1 },
  lotBidCount: { fontSize: 10, color: T.muted },
  notesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  noteChip: { backgroundColor: T.amberPale, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: T.border },
  noteText: { fontSize: 10, color: T.coffee },
  top20Card: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.card, borderRadius: 14, borderWidth: 1, borderColor: T.border, padding: 12, marginBottom: 8, gap: 10 },
  top20Left: { width: 32, alignItems: 'center' },
  top20Medal: { fontSize: 18 },
  top20NameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  top20Finca: { fontSize: 12, fontWeight: '900', color: T.dark, flex: 1 },
  top20Info: { fontSize: 10, color: T.muted, marginBottom: 4 },
  top20BarBg: { height: 4, backgroundColor: T.parchDark, borderRadius: 2, overflow: 'hidden', marginTop: 6 },
  top20BarFill: { height: '100%', borderRadius: 2 },
  top20Right: { alignItems: 'flex-end', minWidth: 46 },
  top20Sca: { fontSize: 18, fontWeight: '900' },
  top20ScaLbl: { fontSize: 8, color: T.muted, letterSpacing: 1 },
  top20Usd: { fontSize: 10, color: T.muted, marginTop: 2 },
  liveDot: { backgroundColor: T.red, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  liveDotText: { fontSize: 7, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
  noteChipSmall: { backgroundColor: T.amberPale, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  noteTextSmall: { fontSize: 9, color: T.coffee },
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  tile: { width: (width - 50) / 2, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: T.borderMed },
  tileGrad: { padding: 16, height: 90, justifyContent: 'space-between' },
  tileIcon: { fontSize: 22 },
  tileLbl: { fontSize: 13, fontWeight: '900', color: '#FFF8E0' },
  tileSub: { fontSize: 10, color: 'rgba(255,248,224,0.7)' },
});
