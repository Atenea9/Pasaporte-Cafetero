import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  SafeAreaView, StatusBar, Animated, View, Text, TouchableOpacity,
  StyleSheet, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../context/AppContext';
import { mockDbService } from '../../services/mockDb.service';
import { LOTES_SUBASTA, getNivelActual, getNivelSiguiente } from '../../data/mockData';
import CopyrightFooter from '../../components/CopyrightFooter';
import {
  T, CoffeePlantBg, FeriaHeroBanner, FeriaHappyHour, FeriaStatsStrip,
  FeriaLevelCard, FeriaPassportCard, FeriaPrizeRow,
  FeriaTopStands, FeriaTileGrid, FeriaTurismo, FeriaFeriasAnteriores,
  FeriaNiveles, FeriaLogoutBtn,
} from '../../components/FeriaHomeSections';

const TILES = [
  { label: 'MAPA',      img: require('../../../assets/tile-jungle.jpg'),      screen: 'MapaFeria' },
  { label: 'AGENDA',    img: require('../../../assets/tile-toucan.jpg'),       screen: 'Agenda' },
  { label: 'ALIADOS',   img: require('../../../assets/tile-barranquero.jpg'), screen: 'Auspiciadores' },
  { label: 'PASAPORTE', img: require('../../../assets/tile-ocelot.jpg'),      screen: 'CompradorPasaporte' },
];

const PROGRAM_TILES = [
  { label: 'EXPOSITORES',     img: require('../../../assets/tile-tapir.jpg'),   screen: 'Expositores' },
  { label: 'CATACIÓN',        img: require('../../../assets/tile-redbird.jpg'), screen: 'Catacion' },
  { label: 'PREMIACIONES',    img: require('../../../assets/tile-bear.jpg'),    screen: 'Premiaciones' },
  { label: 'AGENDA ACADÉMICA',img: require('../../../assets/tile-deer.jpg'),    screen: 'AgendaAcademica' },
];

export const CompradorDashboardScreen = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { state } = useApp();
  const nav = useNavigation<any>();
  const [globalStats, setGlobalStats] = useState({ visitorCount: 847, activeStands: 11, happyHour: false });
  const [userStats, setUserStats] = useState<any>({ points: 0, stamps: [] });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulsAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulsAnim, { toValue: 1.015, duration: 2800, useNativeDriver: true }),
      Animated.timing(pulsAnim, { toValue: 1.0,   duration: 2800, useNativeDriver: true }),
    ])).start();
  }, []);

  useFocusEffect(useCallback(() => {
    let alive = true;
    mockDbService.getHomeStats().then(d => { if (alive) setGlobalStats(d); });
    if (user?.uid) mockDbService.getUserStats(user.uid).then(d => { if (alive) setUserStats(d); });
    return () => { alive = false; };
  }, [user]));

  const puntos      = userStats?.points ?? 0;
  const stampsCount = (userStats?.stamps ?? []).length;
  const nivelActual = getNivelActual(puntos);
  const nivelSig    = getNivelSiguiente(puntos);
  const progressPct = nivelActual && nivelSig
    ? Math.min(((puntos - nivelActual.minPuntos) / (nivelSig.minPuntos - nivelActual.minPuntos)) * 100, 100)
    : nivelActual ? 100 : 0;

  const displayName = user?.name?.split(' ')[0] || 'Comprador';
  const passportId  = `CB26-${(user?.uid?.slice(-8) || '00000000').toUpperCase()}`;
  const topStands   = [...(state.stands ?? [])].sort((a: any, b: any) => (b.ventas ?? 0) - (a.ventas ?? 0));
  const activeStandsCount = (state.stands ?? []).filter((s: any) => s.activo !== false).length;
  const visitorCount = (state.stands ?? []).reduce((s: number, st: any) => s + (st.ventas ?? 0), 0);
  const activeLots  = LOTES_SUBASTA.filter(l => l.activa);

  const STAT_ITEMS = [
    { icon: '👥', val: visitorCount,        lbl: t('home.visitors_label', 'VISITANTES') },
    { icon: '🏪', val: activeStandsCount,   lbl: t('home.stands_label',   'STANDS') },
    { icon: '🔴', val: activeLots.length,   lbl: 'SUBASTAS' },
    { icon: '🪙', val: puntos,              lbl: t('home.pts_label', 'PUNTOS') },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg, ...(Platform.OS === 'web' ? { overflow: 'hidden' } as any : {}) }}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <CoffeePlantBg />
      <Animated.ScrollView style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 18, paddingTop: 14, paddingBottom: 44 }}>

        <FeriaHeroBanner
          displayName={displayName}
          passportId={passportId}
          badge="🌍 COMPRADOR INTERNACIONAL CERTIFICADO"
          onLogout={logout}
        />

        <FeriaHappyHour visible={globalStats.happyHour} />
        <FeriaStatsStrip items={STAT_ITEMS} />
        <FeriaLevelCard puntos={puntos} nivelActual={nivelActual} nivelSig={nivelSig} progressPct={progressPct} pulsAnim={pulsAnim} />
        <FeriaPassportCard stampsCount={stampsCount} onPress={() => nav.navigate('CompradorPasaporte')} />
        <FeriaPrizeRow nivelActual={nivelActual} nivelSig={nivelSig} />

        {/* ── Subasta en Vivo (exclusivo Comprador) ───────────────────────── */}
        <View style={cs.section}>
          <View style={cs.sectionHeaderRow}>
            <Text style={cs.sectionTitle}>🔴  SUBASTA INTERNACIONAL</Text>
            <View style={cs.livePill}><Text style={cs.livePillText}>EN VIVO</Text></View>
          </View>
          {activeLots.map(lot => (
            <TouchableOpacity key={lot.id} style={cs.lotCard} onPress={() => nav.navigate('AuctionLive', { lotId: lot.id })} activeOpacity={0.85}>
              <LinearGradient colors={[T.coffeeDark + 'EE', T.coffee + 'CC', T.card]} style={cs.lotGrad}>
                <View style={cs.lotTop}>
                  <LinearGradient colors={[T.amber, T.amberDark]} style={cs.scaBadge}>
                    <Text style={cs.scaNum}>{lot.sca.toFixed(1)}</Text>
                    <Text style={cs.scaLbl}>SCA</Text>
                  </LinearGradient>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={cs.lotFinca}>{lot.finca}</Text>
                    <Text style={cs.lotVariedad}>{lot.variedad} · {lot.proceso}</Text>
                    <Text style={cs.lotAltitud}>⛰️ {lot.altitud} m.s.n.m. · ⚖️ {lot.peso_kg}kg</Text>
                  </View>
                  <Text style={cs.lotArrow}>›</Text>
                </View>
                <View style={cs.lotBidRow}>
                  <Text style={cs.lotBidLabel}>Puja actual:</Text>
                  <Text style={cs.lotBidAmt}>${lot.puja_actual_usd.toLocaleString('en-US')} USD</Text>
                  <Text style={cs.lotBidCount}>{lot.num_pujas} pujas</Text>
                </View>
                <View style={cs.notesRow}>
                  {lot.notas.slice(0, 3).map((n, i) => (
                    <View key={i} style={cs.noteChip}><Text style={cs.noteText}>{n}</Text></View>
                  ))}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
          {LOTES_SUBASTA.filter(l => !l.activa).map(lot => (
            <View key={lot.id} style={[cs.lotCard, { opacity: 0.5 }]}>
              <View style={{ backgroundColor: T.parchment, padding: 14, borderRadius: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: T.dark }}>{lot.finca}</Text>
                <Text style={{ color: T.muted, fontSize: 12, fontWeight: '700' }}>🔒 Adjudicado</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Botón Top 40 Cafés (exclusivo Comprador) ────────────────────── */}
        <TouchableOpacity style={cs.top40Btn} onPress={() => nav.navigate('Top40Cafes')} activeOpacity={0.85}>
          <LinearGradient colors={[T.coffeeDark, T.coffee, T.amber]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={cs.top40Grad}>
            <View style={cs.top40Left}>
              <Text style={cs.top40Icon}>🏆</Text>
              <View>
                <Text style={cs.top40Title}>TOP 40 CAFÉS ESPECIALES</Text>
                <Text style={cs.top40Sub}>Todos los lotes ordenados por puntaje SCA</Text>
              </View>
            </View>
            <Text style={cs.top40Arrow}>›</Text>
          </LinearGradient>
        </TouchableOpacity>

        <FeriaTopStands stands={topStands} />
        <FeriaTileGrid tiles={TILES} onNavigate={(s) => nav.navigate(s as any)} />
        <FeriaTurismo />
        <FeriaTileGrid tiles={PROGRAM_TILES} onNavigate={(s) => nav.navigate(s as any)} />
        <FeriaFeriasAnteriores onNavigate={(s, p) => nav.navigate(s as any, p)} />
        <FeriaNiveles nivelActual={nivelActual} />
        <FeriaLogoutBtn onLogout={logout} />
        <CopyrightFooter />

      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default CompradorDashboardScreen;

const cs = StyleSheet.create({
  section:         { marginBottom: 16 },
  sectionHeaderRow:{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionTitle:    { fontSize: 9, fontWeight: '900', color: T.amberDark, letterSpacing: 2.5, textTransform: 'uppercase' },
  livePill:        { backgroundColor: '#C62828', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  livePillText:    { fontSize: 9, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  lotCard:         { borderRadius: 16, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: T.coffee + '66' },
  lotGrad:         { padding: 16 },
  lotTop:          { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  scaBadge:        { borderRadius: 10, padding: 10, alignItems: 'center', minWidth: 54 },
  scaNum:          { fontSize: 20, fontWeight: '900', color: '#FFF8E0' },
  scaLbl:          { fontSize: 8, fontWeight: '900', color: '#FFF8E0', letterSpacing: 1 },
  lotFinca:        { fontSize: 14, fontWeight: '900', color: T.dark },
  lotVariedad:     { fontSize: 11, color: T.coffee, marginTop: 3, fontWeight: '700' },
  lotAltitud:      { fontSize: 10, color: T.muted, marginTop: 3 },
  lotArrow:        { fontSize: 22, color: T.amber },
  lotBidRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  lotBidLabel:     { fontSize: 11, color: T.muted },
  lotBidAmt:       { fontSize: 16, fontWeight: '900', color: T.gold, flex: 1 },
  lotBidCount:     { fontSize: 10, color: T.muted },
  notesRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  noteChip:        { backgroundColor: T.amberPale, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: T.border },
  noteText:        { fontSize: 10, color: T.coffee },
  top40Btn:        { borderRadius: 18, overflow: 'hidden', marginBottom: 16, borderWidth: 1.5, borderColor: T.amber },
  top40Grad:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  top40Left:       { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  top40Icon:       { fontSize: 28 },
  top40Title:      { fontSize: 13, fontWeight: '900', color: '#FFF8E0', letterSpacing: 0.5 },
  top40Sub:        { fontSize: 10, color: 'rgba(255,248,224,0.75)', marginTop: 2 },
  top40Arrow:      { fontSize: 28, color: '#FFF8E0', fontWeight: '900' },
});
