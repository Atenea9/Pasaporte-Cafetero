import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, SafeAreaView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';
import { NIVELES, getTopStands, getNivelActual, getNivelSiguiente } from '../../data/mockData';
import type { VisitanteNavProp } from '../../navigation/types';

const T = {
  bg:         '#FBF7ED',
  card:       '#FFFDF8',
  dark:       '#2C1A0E',
  body:       '#5C3520',
  muted:      '#9B7B5A',
  amber:      '#C8960C',
  amberLight: '#E8B820',
  amberPale:  '#FBF0C8',
  amberDark:  '#8B6308',
  coffee:     '#7B4A2A',
  coffeeDark: '#5C3520',
  coffeePale: '#F0E0CC',
  border:     '#EDD9A8',
  borderMed:  '#D4B886',
  danger:     '#C0392B',
};
const { width } = Dimensions.get('window');

const PREMIO_LABEL: Record<string, string> = {
  cafe:              '☕ Café Especial',
  kits_cafe:         '🎁 Kit de Café',
  cursos:            '📚 Curso SCA',
  visitas_exclusivas:'🏡 Visita Exclusiva',
};

export const HomeScreen = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const nav = useNavigation<VisitanteNavProp>();
  const [stats,     setStats]     = useState({ visitorCount: 847, activeStands: 11, happyHour: false });
  const [userStats, setUserStats] = useState<any>({ points: 0, stamps: [] });
  const pulsAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulsAnim, { toValue: 1.02, duration: 2600, useNativeDriver: true }),
      Animated.timing(pulsAnim, { toValue: 1.0,  duration: 2600, useNativeDriver: true }),
    ])).start();
  }, []);

  useFocusEffect(useCallback(() => {
    let alive = true;
    mockDbService.getHomeStats().then(d => { if (alive) setStats(d); });
    if (user?.uid) mockDbService.getUserStats(user.uid).then(d => { if (alive) setUserStats(d); });
    return () => { alive = false; };
  }, [user]));

  const puntos      = userStats?.points ?? 0;
  const nivelActual = getNivelActual(puntos);
  const nivelSig    = getNivelSiguiente(puntos);
  const stampsCount = (userStats?.stamps ?? []).length;
  const topStands   = getTopStands(4);
  const progressPct = nivelActual && nivelSig
    ? Math.min(((puntos - nivelActual.minPuntos) / (nivelSig.minPuntos - nivelActual.minPuntos)) * 100, 100)
    : nivelActual ? 100 : 0;

  const TILES = [
    { icon: '🗺️', label: t('home.fair_map', 'Mapa'),          sub: 'Stands y escenarios', screen: 'MapaFeria'     as const, c1: T.coffee,     c2: '#A0663C'   },
    { icon: '📅', label: t('home.agenda',    'Agenda'),        sub: '3 días de programa',  screen: 'Agenda'        as const, c1: '#1565C0',     c2: '#1976D2'   },
    { icon: '🏛️', label: t('home.sponsors', 'Auspiciadores'), sub: 'Gobernación',          screen: 'Auspiciadores' as const, c1: '#5D4037',     c2: '#795548'   },
    { icon: '🏅', label: t('nav.ranking',    'Ranking'),       sub: 'Tabla de posiciones', screen: 'Ranking'       as const, c1: T.amber,       c2: T.amberLight},
  ];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.greeting}>¡Hola, {user?.name?.split(' ')[0] || 'Cafetero'} 👋</Text>
            <Text style={s.headerSub}>Feria Internacional del Café · Chaparral 2026</Text>
          </View>
          <TouchableOpacity onPress={logout} style={s.logoutBtn}>
            <Text style={s.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>

        {/* Happy Hour */}
        {stats.happyHour && (
          <LinearGradient colors={[T.amber, T.amberLight]} style={s.hhBanner}>
            <Text style={s.hhText}>✨ HAPPY HOUR — PUNTOS DOBLES ✨</Text>
          </LinearGradient>
        )}

        {/* Stats Strip */}
        <View style={s.statsStrip}>
          {[
            { val: stats.visitorCount, lbl: 'visitantes' },
            { val: stats.activeStands, lbl: 'stands activos' },
            { val: puntos,             lbl: 'puntos' },
            { val: stampsCount,        lbl: 'sellos' },
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
        <Animated.View style={{ transform: [{ scale: pulsAnim }] }}>
          <View style={[s.levelCard, { borderColor: nivelActual?.color ?? T.border }]}>
            <LinearGradient
              colors={nivelActual ? [nivelActual.color + '15', T.card] : [T.card, T.card]}
              style={StyleSheet.absoluteFill}
            />
            <View style={s.levelRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.levelLabel}>TU NIVEL</Text>
                <Text style={[s.levelName, { color: nivelActual?.color ?? T.muted }]}>
                  {nivelActual ? `${nivelActual.emoji}  ${nivelActual.nombre}` : '☕  ¡Haz tu primera compra!'}
                </Text>
                {nivelSig && <Text style={s.levelNext}>{nivelSig.minPuntos - puntos} pts → {nivelSig.nombre}</Text>}
              </View>
              <View style={s.levelPtsBox}>
                <Text style={[s.levelPts, { color: nivelActual?.color ?? T.amber }]}>{puntos}</Text>
                <Text style={s.levelPtsLbl}>pts</Text>
              </View>
            </View>
            <View style={s.progBg}>
              <View style={[s.progFill, { width: `${progressPct}%` as any, backgroundColor: nivelActual?.color ?? T.amber }]} />
            </View>
            <Text style={s.progExpl}>$1.000 COP = 1 punto</Text>
          </View>
        </Animated.View>

        {/* Passport Card */}
        <TouchableOpacity onPress={() => nav.navigate('Pasaporte')} activeOpacity={0.82} style={s.passCard}>
          <LinearGradient colors={[T.coffeeDark, T.coffee, '#A0663C']} style={StyleSheet.absoluteFill} />
          <View style={{ flex: 1 }}>
            <View style={s.passBadge}>
              <Text style={s.passBadgeText}>✦ PASAPORTE</Text>
            </View>
            <Text style={s.passStamps}>{stampsCount} / 38</Text>
            <Text style={s.passSub}>municipios cafeteros del Tolima</Text>
          </View>
          <View style={s.miniGrid}>
            {Array.from({ length: 15 }).map((_, i) => (
              <View key={i} style={[s.miniDot, i < stampsCount && s.miniDotFilled]} />
            ))}
          </View>
          <Text style={s.passArrow}>›</Text>
        </TouchableOpacity>

        {/* Prize Row */}
        {nivelActual && (
          <View style={s.prizeRow}>
            <View style={[s.prizeCard, { borderColor: T.amber }]}>
              <LinearGradient colors={[T.amberPale, T.card]} style={StyleSheet.absoluteFill} />
              <Text style={s.prizeLbl}>🏆 TU PREMIO</Text>
              <Text style={s.prizeVal}>{PREMIO_LABEL[nivelActual.premioKey]}</Text>
            </View>
            {nivelSig && (
              <View style={[s.prizeCard, { borderColor: T.border }]}>
                <Text style={[s.prizeLbl, { color: T.muted }]}>⬆ PRÓXIMO</Text>
                <Text style={[s.prizeVal, { color: T.muted }]}>{PREMIO_LABEL[nivelSig.premioKey]}</Text>
              </View>
            )}
          </View>
        )}

        {/* Top Stands */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>STANDS MÁS VISITADOS</Text>
          {topStands.map((stand, idx) => {
            const max = topStands[0].ventas ?? 1;
            const pct = ((stand.ventas ?? 0) / max) * 100;
            return (
              <View key={stand.id} style={s.standRow}>
                <Text style={[s.standRank, idx === 0 && { color: T.amber }]}>#{idx + 1}</Text>
                <View style={{ flex: 1 }}>
                  <View style={s.standNameRow}>
                    <Text style={s.standName} numberOfLines={1}>{stand.nombre}</Text>
                    <Text style={s.standSales}>{stand.ventas} ventas</Text>
                  </View>
                  <View style={s.barBg}>
                    <View style={[s.barFill, { width: `${pct}%` as any, backgroundColor: idx === 0 ? T.amber : T.coffee }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Explore Grid */}
        <Text style={[s.sectionTitle, { marginBottom: 12 }]}>EXPLORAR LA FERIA</Text>
        <View style={s.tileGrid}>
          {TILES.map(tile => (
            <TouchableOpacity key={tile.screen} style={s.tile} onPress={() => nav.navigate(tile.screen)} activeOpacity={0.8}>
              <LinearGradient colors={[tile.c1, tile.c2]} style={s.tileGrad}>
                <Text style={s.tileIcon}>{tile.icon}</Text>
                <Text style={s.tileLbl}>{tile.label}</Text>
                <Text style={s.tileSub}>{tile.sub}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Levels */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>LOS 4 NIVELES DEL PASAPORTE</Text>
          {NIVELES.map(niv => {
            const isCurrent = nivelActual?.id === niv.id;
            return (
              <View key={niv.id} style={[s.nivelRow, isCurrent && { borderColor: niv.color, backgroundColor: niv.color + '10' }]}>
                <Text style={s.nivelEmoji}>{niv.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.nivelName, { color: isCurrent ? niv.color : T.dark }]}>{niv.nombre}</Text>
                  <Text style={s.nivelRange}>{niv.minPuntos} – {niv.maxPuntos > 9000 ? '601+' : niv.maxPuntos} pts</Text>
                </View>
                <Text style={s.nivelPremio}>{PREMIO_LABEL[niv.premioKey]}</Text>
                {isCurrent && <View style={[s.nivelDot, { backgroundColor: niv.color }]} />}
              </View>
            );
          })}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: T.bg },
  scroll:       { padding: 20, paddingTop: 16, paddingBottom: 40 },

  header:       { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 },
  greeting:     { fontSize: 22, fontWeight: '900', color: T.dark, letterSpacing: 0.2 },
  headerSub:    { fontSize: 10, color: T.muted, marginTop: 3, letterSpacing: 0.4 },
  logoutBtn:    { backgroundColor: T.card, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: T.border, marginLeft: 10 },
  logoutText:   { fontSize: 12, color: T.danger, fontWeight: '700' },

  hhBanner:     { padding: 12, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  hhText:       { color: T.dark, fontWeight: '900', fontSize: 13, letterSpacing: 1 },

  statsStrip:   { flexDirection: 'row', backgroundColor: T.card, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: T.border },
  statItem:     { flex: 1, alignItems: 'center' },
  statNum:      { fontSize: 20, fontWeight: '900', color: T.amber },
  statLbl:      { fontSize: 8, color: T.muted, marginTop: 2, textTransform: 'uppercase', textAlign: 'center', letterSpacing: 0.4 },
  statDiv:      { width: 1, backgroundColor: T.border },

  levelCard:    { borderRadius: 16, borderWidth: 1.5, padding: 18, marginBottom: 14, overflow: 'hidden', backgroundColor: T.card, shadowColor: T.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  levelRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  levelLabel:   { fontSize: 9, color: T.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  levelName:    { fontSize: 20, fontWeight: '900' },
  levelNext:    { fontSize: 11, color: T.muted, marginTop: 4 },
  levelPtsBox:  { alignItems: 'flex-end' },
  levelPts:     { fontSize: 38, fontWeight: '900', lineHeight: 42 },
  levelPtsLbl:  { fontSize: 12, color: T.muted },
  progBg:       { height: 8, backgroundColor: T.border, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progFill:     { height: '100%', borderRadius: 4 },
  progExpl:     { fontSize: 10, color: T.muted, textAlign: 'right' },

  passCard:     { borderRadius: 18, padding: 20, marginBottom: 14, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', shadowColor: T.coffeeDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 6 },
  passBadge:    { backgroundColor: T.amberPale, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 6 },
  passBadgeText:{ fontSize: 9, fontWeight: '900', color: T.amberDark, letterSpacing: 1.5 },
  passStamps:   { fontSize: 30, fontWeight: '900', color: '#FFF' },
  passSub:      { fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  miniGrid:     { flexWrap: 'wrap', flexDirection: 'row', width: 64, gap: 4, marginHorizontal: 10 },
  miniDot:      { width: 14, height: 14, borderRadius: 3, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  miniDotFilled:{ backgroundColor: T.amberLight, borderColor: T.amberLight },
  passArrow:    { fontSize: 24, color: T.amberPale, marginLeft: 4 },

  prizeRow:     { flexDirection: 'row', gap: 10, marginBottom: 14 },
  prizeCard:    { flex: 1, borderRadius: 12, borderWidth: 1, padding: 14, overflow: 'hidden', backgroundColor: T.card },
  prizeLbl:     { fontSize: 9, fontWeight: '900', color: T.amber, letterSpacing: 1, marginBottom: 4 },
  prizeVal:     { fontSize: 12, fontWeight: '700', color: T.dark },

  section:      { marginBottom: 14 },
  sectionTitle: { fontSize: 10, fontWeight: '900', color: T.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
  standRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, backgroundColor: T.card, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: T.border },
  standRank:    { fontSize: 12, fontWeight: '900', color: T.muted, width: 24, textAlign: 'center' },
  standNameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  standName:    { fontSize: 12, color: T.dark, fontWeight: '700', flex: 1 },
  standSales:   { fontSize: 11, color: T.amber, fontWeight: '700' },
  barBg:        { height: 5, backgroundColor: T.border, borderRadius: 3, overflow: 'hidden' },
  barFill:      { height: '100%', borderRadius: 3 },

  tileGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  tile:         { width: (width - 50) / 2, borderRadius: 16, overflow: 'hidden', shadowColor: T.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  tileGrad:     { padding: 16, height: 100, justifyContent: 'space-between' },
  tileIcon:     { fontSize: 24 },
  tileLbl:      { fontSize: 14, fontWeight: '900', color: '#FFF' },
  tileSub:      { fontSize: 10, color: 'rgba(255,255,255,0.8)' },

  nivelRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: T.border, marginBottom: 8, backgroundColor: T.card },
  nivelEmoji:   { fontSize: 20, width: 28, textAlign: 'center' },
  nivelName:    { fontSize: 13, fontWeight: '800' },
  nivelRange:   { fontSize: 10, color: T.muted, marginTop: 2 },
  nivelPremio:  { fontSize: 11, color: T.muted, maxWidth: 100, textAlign: 'right' },
  nivelDot:     { width: 8, height: 8, borderRadius: 4, marginLeft: 4 },
});
