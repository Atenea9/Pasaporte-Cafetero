import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, SafeAreaView, StatusBar, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../context/AppContext';
import { mockDbService } from '../../services/mockDb.service';
import { NIVELES, getTopStands, getNivelActual, getNivelSiguiente } from '../../data/mockData';
import type { VisitanteNavProp } from '../../navigation/types';
import BearMascot from '../../components/BearMascot';

// ─── Theme tokens ─────────────────────────────────────────────────────────────
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

// ─── Ferias data (static, scalable) ──────────────────────────────────────────
const PREV_FAIRS = [
  {
    key:       'ibague',
    cityKey:   'fair_ibague_year',
    descKey:   'fair_ibague_desc',
    cityFall:  'Ibagué 2024',
    descFall:  'Primera edición · Inicio de la tradición',
    c1: '#1A3A2A', c2: '#2D6A4F',
  },
  {
    key:       'libano',
    cityKey:   'fair_libano_year',
    descKey:   'fair_libano_desc',
    cityFall:  'Líbano 2025',
    descFall:  'Segunda edición · Creciendo juntos',
    c1: '#2A1408', c2: '#7B4A2A',
  },
] as const;

export const HomeScreen = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { state } = useApp();
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

  // Name priority: cedula registration > auth name > fallback
  const displayName = state.usuario?.nombre?.split(' ')[0]
    || user?.name?.split(' ')[0]
    || 'Cafetero';

  const TILES = [
    { icon: '🗺️', label: t('home.fair_map', 'Mapa'),          sub: t('home.fair_map_sub', 'Stands y escenarios'), screen: 'MapaFeria'     as const, c1: T.coffee,     c2: '#A0663C'   },
    { icon: '📅', label: t('home.agenda',    'Agenda'),        sub: t('home.agenda_sub', '3 días de programa'),   screen: 'Agenda'        as const, c1: '#1565C0',     c2: '#1976D2'   },
    { icon: '🏛️', label: t('home.sponsors', 'Auspiciadores'), sub: t('home.sponsors_sub', 'Gobernación'),        screen: 'Auspiciadores' as const, c1: '#5D4037',     c2: '#795548'   },
    { icon: '🏅', label: t('nav.ranking',    'Ranking'),       sub: t('home.ranking_nav_sub', 'Tabla de posiciones'), screen: 'Ranking'  as const, c1: T.amber,       c2: T.amberLight},
    { icon: '🛍️', label: t('comprador.catalog', 'Catálogo'),  sub: 'Productos de los stands',                    screen: 'Catalogo'  as const, c1: '#2D5A1E',       c2: '#4A8A2E'   },
  ];

  const STAT_ITEMS = [
    { icon: '👥', val: stats.visitorCount, lbl: t('home.visitors_label', 'visitantes') },
    { icon: '🏪', val: stats.activeStands, lbl: t('home.stands_label',   'stands activos') },
    { icon: '🪙', val: puntos,             lbl: t('home.pts_label',       'puntos') },
    { icon: '✅', val: stampsCount,        lbl: t('home.stamps_label',    'sellos') },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.greeting}>{t('home.greeting', '¡Hola,')} {displayName} 👋</Text>
            <View style={s.headerEventRow}>
              <Text style={s.headerEventIcon}>🍒</Text>
              <Text style={s.headerSub}>{t('login.fair_name', 'Feria Internacional de Café')} · Chaparral 2026</Text>
            </View>
            <TouchableOpacity onPress={logout} style={s.logoutBtn}>
              <Text style={s.logoutText}>{t('home.logout', 'Salir')} ↩</Text>
            </TouchableOpacity>
          </View>
          <View style={s.bearWrap}>
            <BearMascot size={96} />
            <Text style={s.bearTip}>{t('home.mascot_tip', '¡Tócame! ☕')}</Text>
          </View>
        </View>

        {/* ── Happy Hour banner ────────────────────────────────────────────── */}
        {stats.happyHour && (
          <LinearGradient colors={[T.amber, T.amberLight]} style={s.hhBanner}>
            <Text style={s.hhText}>{t('home.happy_hour_active', '✨ HAPPY HOUR — PUNTOS DOBLES ✨')}</Text>
          </LinearGradient>
        )}

        {/* ── Stats strip ──────────────────────────────────────────────────── */}
        <View style={s.statsStrip}>
          {STAT_ITEMS.map((item, i) => (
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

        {/* ── Level card ───────────────────────────────────────────────────── */}
        <Animated.View style={{ transform: [{ scale: pulsAnim }] }}>
          <View style={[s.levelCard, { borderColor: nivelActual?.color ?? T.border }]}>
            <LinearGradient
              colors={nivelActual ? [nivelActual.color + '18', T.card] : [T.card, T.card]}
              style={StyleSheet.absoluteFill}
            />
            {/* Gold corner ornament */}
            <View style={s.levelOrnamentTL} />
            <View style={s.levelOrnamentTR} />
            <View style={s.levelOrnamentBL} />
            <View style={s.levelOrnamentBR} />

            <View style={s.levelRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.levelLabel}>{t('home.your_level_title', 'TU NIVEL')}</Text>
                <Text style={[s.levelName, { color: nivelActual?.color ?? T.muted }]}>
                  {nivelActual
                    ? `${nivelActual.emoji}  ${nivelActual.nombre}`
                    : `☕  ${t('home.no_level', '¡Haz tu primera compra!')}`}
                </Text>
                {nivelSig && (
                  <Text style={s.levelNext}>
                    {nivelSig.minPuntos - puntos} pts → {nivelSig.nombre}
                  </Text>
                )}
              </View>
              <View style={s.levelPtsBox}>
                <Text style={[s.levelPts, { color: nivelActual?.color ?? T.amber }]}>{puntos}</Text>
                <Text style={s.levelPtsLbl}>pts</Text>
              </View>
            </View>
            <View style={s.progBg}>
              <View style={[s.progFill, { width: `${progressPct}%` as any, backgroundColor: nivelActual?.color ?? T.amber }]} />
            </View>
            <Text style={s.progExpl}>{t('home.pts_explain', '$1.000 COP = 1 punto')}</Text>
          </View>
        </Animated.View>

        {/* ── Passport card ────────────────────────────────────────────────── */}
        <TouchableOpacity onPress={() => nav.navigate('Pasaporte')} activeOpacity={0.82} style={s.passCard}>
          <LinearGradient
            colors={['#2A1006', '#5C2E12', '#8B4A22', '#C07840']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={{ flex: 1 }}>
            <View style={s.passBadge}>
              <Text style={s.passBadgeText}>{t('home.passport_badge', '✦ PASAPORTE')}</Text>
            </View>
            <Text style={s.passStamps}>{stampsCount} / 38</Text>
            <Text style={s.passSub}>{t('home.municipalities_label', 'municipios cafeteros del Tolima')}</Text>
          </View>
          <View style={s.miniGrid}>
            {Array.from({ length: 15 }).map((_, i) => (
              <View key={i} style={[s.miniDot, i < stampsCount && s.miniDotFilled]} />
            ))}
          </View>
          <Text style={s.passArrow}>›</Text>
        </TouchableOpacity>

        {/* ── Prize row ────────────────────────────────────────────────────── */}
        {nivelActual && (
          <View style={s.prizeRow}>
            <View style={[s.prizeCard, { borderColor: T.amber }]}>
              <LinearGradient colors={[T.amberPale, '#FFF8E0', T.card]} style={StyleSheet.absoluteFill} />
              <Text style={s.prizeLbl}>{t('home.prize_yours', '🏆 TU PREMIO')}</Text>
              <Text style={s.prizeVal}>{PREMIO_LABEL[nivelActual.premioKey]}</Text>
            </View>
            {nivelSig && (
              <View style={[s.prizeCard, { borderColor: T.border }]}>
                <Text style={[s.prizeLbl, { color: T.muted }]}>{t('home.prize_next', '⬆ PRÓXIMO')}</Text>
                <Text style={[s.prizeVal, { color: T.muted }]}>{PREMIO_LABEL[nivelSig.premioKey]}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── Top stands ───────────────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('home.top_stands', 'STANDS MÁS VISITADOS')}</Text>
          {topStands.map((stand, idx) => {
            const max = topStands[0].ventas ?? 1;
            const pct = ((stand.ventas ?? 0) / max) * 100;
            return (
              <View key={stand.id} style={s.standRow}>
                <Text style={[s.standRank, idx === 0 && { color: T.amber }]}>#{idx + 1}</Text>
                <View style={{ flex: 1 }}>
                  <View style={s.standNameRow}>
                    <Text style={s.standName} numberOfLines={1}>{stand.nombre}</Text>
                    <Text style={s.standSales}>{stand.ventas} {t('home.sales', 'ventas')}</Text>
                  </View>
                  <View style={s.barBg}>
                    <View style={[s.barFill, { width: `${pct}%` as any, backgroundColor: idx === 0 ? T.amber : T.coffee }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* ── Explore grid ─────────────────────────────────────────────────── */}
        <Text style={[s.sectionTitle, { marginBottom: 12 }]}>{t('home.explore', 'EXPLORAR LA FERIA')}</Text>
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

        {/* ── Ferias anteriores ─────────────────────────────────────────────── */}
        <Text style={[s.sectionTitle, { marginBottom: 12, marginTop: 6 }]}>
          {t('home.prev_fairs_title', 'FERIAS ANTERIORES')}
        </Text>
        <View style={s.feriasRow}>
          {PREV_FAIRS.map(f => (
            <View key={f.key} style={s.feriaCard}>
              <LinearGradient colors={[f.c1, f.c2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.feriaGrad}>
                <Image
                  source={require('../../../assets/logo-feria-icon.png')}
                  style={s.feriaLogo}
                  resizeMode="contain"
                />
                <Text style={s.feriaCity}>{t(`home.${f.cityKey}`, f.cityFall)}</Text>
                <Text style={s.feriaFairName}>{t('home.fair_intl_coffee', 'Feria Internacional\nde Café')}</Text>
                <Text style={s.feriaDesc}>{t(`home.${f.descKey}`, f.descFall)}</Text>
              </LinearGradient>
            </View>
          ))}
        </View>

        {/* ── Passport levels ──────────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('home.passport_levels', 'LOS 4 NIVELES DEL PASAPORTE')}</Text>
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
  safe:    { flex: 1, backgroundColor: T.bg },
  scroll:  { padding: 20, paddingTop: 16, paddingBottom: 40 },

  // Header
  header:         { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  greeting:       { fontSize: 22, fontWeight: '900', color: T.dark, letterSpacing: 0.2 },
  headerEventRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 4 },
  headerEventIcon:{ fontSize: 13 },
  headerSub:      { fontSize: 10, color: T.muted, letterSpacing: 0.4, flex: 1 },
  logoutBtn:      { alignSelf: 'flex-start', marginTop: 10, backgroundColor: T.card, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: T.border },
  logoutText:     { fontSize: 11, color: T.danger, fontWeight: '700' },
  bearWrap:       { alignItems: 'center', marginLeft: 8 },
  bearTip:        { fontSize: 8, color: T.muted, marginTop: 2, fontWeight: '600' },

  // Happy hour
  hhBanner: { padding: 12, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  hhText:   { color: T.dark, fontWeight: '900', fontSize: 13, letterSpacing: 1 },

  // Stats strip
  statsStrip: { flexDirection: 'row', backgroundColor: T.card, borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: T.border, shadowColor: T.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  statItem:   { flex: 1, alignItems: 'center', gap: 2 },
  statIcon:   { fontSize: 16, marginBottom: 2 },
  statNum:    { fontSize: 20, fontWeight: '900', color: T.amber },
  statLbl:    { fontSize: 8, color: T.muted, textTransform: 'uppercase', textAlign: 'center', letterSpacing: 0.4 },
  statDiv:    { width: 1, backgroundColor: T.border },

  // Level card
  levelCard:          { borderRadius: 18, borderWidth: 2, padding: 18, marginBottom: 14, overflow: 'hidden', backgroundColor: T.card, shadowColor: T.dark, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  levelOrnamentTL:    { position: 'absolute', top: 6,  left: 6,  width: 12, height: 12, borderTopWidth: 2,    borderLeftWidth: 2,   borderColor: T.amber, opacity: 0.5 },
  levelOrnamentTR:    { position: 'absolute', top: 6,  right: 6, width: 12, height: 12, borderTopWidth: 2,    borderRightWidth: 2,  borderColor: T.amber, opacity: 0.5 },
  levelOrnamentBL:    { position: 'absolute', bottom: 6, left: 6, width: 12, height: 12, borderBottomWidth: 2, borderLeftWidth: 2,   borderColor: T.amber, opacity: 0.5 },
  levelOrnamentBR:    { position: 'absolute', bottom: 6, right: 6, width: 12, height: 12, borderBottomWidth: 2, borderRightWidth: 2, borderColor: T.amber, opacity: 0.5 },
  levelRow:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  levelLabel:         { fontSize: 9, color: T.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  levelName:          { fontSize: 20, fontWeight: '900' },
  levelNext:          { fontSize: 11, color: T.muted, marginTop: 4 },
  levelPtsBox:        { alignItems: 'flex-end' },
  levelPts:           { fontSize: 44, fontWeight: '900', lineHeight: 48 },
  levelPtsLbl:        { fontSize: 12, color: T.muted },
  progBg:             { height: 10, backgroundColor: T.border, borderRadius: 5, overflow: 'hidden', marginBottom: 6 },
  progFill:           { height: '100%', borderRadius: 5 },
  progExpl:           { fontSize: 10, color: T.muted, textAlign: 'right' },

  // Passport card
  passCard:     { borderRadius: 20, padding: 20, marginBottom: 14, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', shadowColor: '#1A0800', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 8 },
  passBadge:    { backgroundColor: T.amberPale, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 6 },
  passBadgeText:{ fontSize: 9, fontWeight: '900', color: T.amberDark, letterSpacing: 1.5 },
  passStamps:   { fontSize: 34, fontWeight: '900', color: '#FFF' },
  passSub:      { fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  miniGrid:     { flexWrap: 'wrap', flexDirection: 'row', width: 64, gap: 4, marginHorizontal: 10 },
  miniDot:      { width: 14, height: 14, borderRadius: 3, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  miniDotFilled:{ backgroundColor: T.amberLight, borderColor: T.amberLight },
  passArrow:    { fontSize: 26, color: T.amberPale, marginLeft: 4 },

  // Prize row
  prizeRow:  { flexDirection: 'row', gap: 10, marginBottom: 14 },
  prizeCard: { flex: 1, borderRadius: 14, borderWidth: 1.5, padding: 14, overflow: 'hidden', backgroundColor: T.card },
  prizeLbl:  { fontSize: 9, fontWeight: '900', color: T.amber, letterSpacing: 1, marginBottom: 4 },
  prizeVal:  { fontSize: 13, fontWeight: '700', color: T.dark },

  // Sections
  section:      { marginBottom: 14 },
  sectionTitle: { fontSize: 10, fontWeight: '900', color: T.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },

  // Top stands
  standRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, backgroundColor: T.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: T.border },
  standRank:    { fontSize: 12, fontWeight: '900', color: T.muted, width: 24, textAlign: 'center' },
  standNameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  standName:    { fontSize: 12, color: T.dark, fontWeight: '700', flex: 1 },
  standSales:   { fontSize: 11, color: T.amber, fontWeight: '700' },
  barBg:        { height: 6, backgroundColor: T.border, borderRadius: 3, overflow: 'hidden' },
  barFill:      { height: '100%', borderRadius: 3 },

  // Explore tile grid
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  tile:     { width: (width - 50) / 2, borderRadius: 16, overflow: 'hidden', shadowColor: T.dark, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
  tileGrad: { padding: 16, height: 110, justifyContent: 'space-between' },
  tileIcon: { fontSize: 26 },
  tileLbl:  { fontSize: 14, fontWeight: '900', color: '#FFF' },
  tileSub:  { fontSize: 10, color: 'rgba(255,255,255,0.8)' },

  // Previous fairs
  feriasRow:    { flexDirection: 'row', gap: 10, marginBottom: 20 },
  feriaCard:    { flex: 1, borderRadius: 18, overflow: 'hidden', shadowColor: T.dark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 10, elevation: 5 },
  feriaGrad:    { padding: 16, minHeight: 160, justifyContent: 'flex-end' },
  feriaLogo:    { width: 32, height: 32, tintColor: 'rgba(255,255,255,0.9)', marginBottom: 8 },
  feriaCity:    { fontSize: 16, fontWeight: '900', color: '#FFF', letterSpacing: 0.2 },
  feriaFairName:{ fontSize: 9, color: 'rgba(255,255,255,0.65)', marginTop: 2, lineHeight: 13, letterSpacing: 0.3 },
  feriaDesc:    { fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 4, lineHeight: 13 },

  // Passport levels
  nivelRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: T.border, marginBottom: 8, backgroundColor: T.card },
  nivelEmoji:  { fontSize: 20, width: 28, textAlign: 'center' },
  nivelName:   { fontSize: 13, fontWeight: '800' },
  nivelRange:  { fontSize: 10, color: T.muted, marginTop: 2 },
  nivelPremio: { fontSize: 11, color: T.muted, maxWidth: 100, textAlign: 'right' },
  nivelDot:    { width: 8, height: 8, borderRadius: 4, marginLeft: 4 },
});
