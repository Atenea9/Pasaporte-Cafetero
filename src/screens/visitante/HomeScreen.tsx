import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, SafeAreaView, StatusBar, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../context/AppContext';
import { mockDbService } from '../../services/mockDb.service';
import { NIVELES, getTopStands, getNivelActual, getNivelSiguiente } from '../../data/mockData';
import type { VisitanteNavProp } from '../../navigation/types';

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:         '#F9F3E3',
  card:       '#FFFDF8',
  parchment:  '#F5EDD0',
  parchDark:  '#EAD9AA',
  dark:       '#2C1A0E',
  body:       '#5C3520',
  muted:      '#9B7B5A',
  amber:      '#C8960C',
  amberLight: '#E8B820',
  amberPale:  '#FBF0C8',
  amberDark:  '#8B6308',
  coffee:     '#7B4A2A',
  coffeeDark: '#4A2010',
  border:     '#EDD9A8',
  borderMed:  '#D4B886',
  danger:     '#C0392B',
  gold:       '#B8860B',
  goldLight:  '#D4A520',
};

const { width } = Dimensions.get('window');

const PREMIO_LABEL: Record<string, string> = {
  cafe:              '☕ Café Especial',
  kits_cafe:         '🎁 Kit de Café',
  cursos:            '📚 Curso SCA',
  visitas_exclusivas:'🏡 Visita Exclusiva',
};

const PREV_FAIRS = [
  { key: 'ibague', cityKey: 'fair_ibague_year', descKey: 'fair_ibague_desc', cityFall: 'Ibagué 2024', descFall: 'Primera edición', c1: '#1A3A2A', c2: '#2D6A4F' },
  { key: 'libano', cityKey: 'fair_libano_year', descKey: 'fair_libano_desc', cityFall: 'Líbano 2025',  descFall: 'Segunda edición',  c1: '#2A1408', c2: '#7B4A2A' },
] as const;

export const HomeScreen = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { state } = useApp();
  const nav = useNavigation<VisitanteNavProp>();
  const [globalStats, setGlobalStats] = useState({ visitorCount: 1420, activeStands: 45, happyHour: false });
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
    return () => { alive = false; };
  }, []));

  // Personal stats from AppContext (cedula registration) — 0 for new users
  const puntos      = state.usuario?.puntos    ?? 0;
  const stamps      = state.usuario?.sellos    ?? [];
  const stampsCount = stamps.length;
  const nivelActual = getNivelActual(puntos);
  const nivelSig    = getNivelSiguiente(puntos);
  const progressPct = nivelActual && nivelSig
    ? Math.min(((puntos - nivelActual.minPuntos) / (nivelSig.minPuntos - nivelActual.minPuntos)) * 100, 100)
    : nivelActual ? 100 : 0;

  const displayName = state.usuario?.nombre?.split(' ')[0]
    || user?.name?.split(' ')[0]
    || 'Cafetero';

  const passportId = `CF26-${(state.usuario?.cedula || user?.uid?.slice(-8) || '00000000').toUpperCase()}`;
  const topStands  = getTopStands(4);

  const STAT_ITEMS = [
    { icon: '👥', val: globalStats.visitorCount, lbl: t('home.visitors_label', 'VISITANTES') },
    { icon: '🏪', val: globalStats.activeStands, lbl: t('home.stands_label',   'STANDS ACTIVOS') },
    { icon: '🪙', val: puntos,                   lbl: t('home.pts_label',       'PUNTOS') },
    { icon: '✅', val: stampsCount,              lbl: t('home.stamps_label',    'SELLOS') },
  ];

  const TILES = [
    { icon: '🗺️', label: t('home.fair_map', 'Mapa'),          sub: t('home.fair_map_sub', 'Stands'),    screen: 'MapaFeria'     as const, c1: T.coffee,  c2: '#A0663C' },
    { icon: '📅', label: t('home.agenda', 'Agenda'),           sub: t('home.agenda_sub', '3 días'),      screen: 'Agenda'        as const, c1: '#1565C0', c2: '#1E88E5' },
    { icon: '🏛️', label: t('home.sponsors', 'Aliados'),       sub: t('home.sponsors_sub', 'Tolima'),    screen: 'Auspiciadores' as const, c1: '#5D4037', c2: '#8D6E63' },
    { icon: '🏅', label: t('nav.ranking', 'Ranking'),           sub: t('home.ranking_nav_sub', 'Tabla'), screen: 'Ranking'       as const, c1: T.amber,   c2: T.goldLight },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <Animated.ScrollView style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.greeting}>{t('home.greeting', '¡Hola,')} {displayName}! 👋</Text>
            <View style={s.eventRow}>
              <Text style={s.eventIcon}>🍒</Text>
              <Text style={s.eventSub}>{t('login.fair_name', 'Feria Internacional de Café')} – Chaparral 2026</Text>
            </View>
            <TouchableOpacity onPress={logout} style={s.salirBtn} activeOpacity={0.8}>
              <Text style={s.salirText}>{t('home.logout', 'SALIR')}  →</Text>
            </TouchableOpacity>
          </View>

          {/* Fair logo medallion */}
          <View style={s.medallion}>
            <LinearGradient colors={['#D4A520', '#B8860B', '#8B6308', '#5C3A06']} style={s.medallionGrad}>
              <View style={s.medallionRingOuter} />
              <View style={s.medallionRingInner} />
              <Image source={require('../../../assets/logo-feria-icon.png')} style={s.medallionLogo} resizeMode="contain" />
              <Text style={s.medallionLabel}>FERIA CAFÉ</Text>
            </LinearGradient>
          </View>
        </View>

        {/* ── Happy Hour banner ────────────────────────────────────────────── */}
        {globalStats.happyHour && (
          <LinearGradient colors={[T.amber, T.amberLight]} style={s.hhBanner}>
            <Text style={s.hhText}>{t('home.happy_hour_active', '✨ HAPPY HOUR — PUNTOS DOBLES ✨')}</Text>
          </LinearGradient>
        )}

        {/* ── Stats scroll ─────────────────────────────────────────────────── */}
        <View style={s.statsScroll}>
          <LinearGradient colors={[T.parchment, '#FFFBF0', T.parchment]} style={StyleSheet.absoluteFill} />
          {/* Scroll curl decorations */}
          <View style={s.scrollCurlTop} />
          <View style={s.scrollCurlBot} />
          <View style={s.statsRow}>
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
        </View>

        {/* ── Level card ───────────────────────────────────────────────────── */}
        <Animated.View style={[s.levelCard, { transform: [{ scale: pulsAnim }] }]}>
          <LinearGradient colors={[T.card, T.parchment, T.card]} style={StyleSheet.absoluteFill} />
          {/* Corner ornaments */}
          {(['TL','TR','BL','BR'] as const).map(pos => (
            <View key={pos} style={[s.corner, s[`corner${pos}`]]} />
          ))}
          <View style={s.levelRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.levelLabel}>{t('home.your_level_title', 'TU NIVEL')}</Text>
              <Text style={[s.levelName, { color: nivelActual?.color ?? T.muted }]}>
                {nivelActual
                  ? `${nivelActual.emoji}  ${nivelActual.nombre}`
                  : `☕  ${t('home.no_level', '¡Haz tu primera compra!')}`}
              </Text>
              {nivelSig && (
                <Text style={s.levelNext}>{nivelSig.minPuntos - puntos} pts → {nivelSig.nombre}</Text>
              )}
              {nivelActual && (
                <View style={[s.eliteBadge, { backgroundColor: nivelActual.color }]}>
                  <Text style={s.eliteBadgeText}>🎖 MEMBRESÍA DE ÉLITE</Text>
                </View>
              )}
            </View>

            {/* Gold coin medallion */}
            <View style={s.levelCoin}>
              <LinearGradient colors={['#E8C020', '#C8960C', '#8B6308']} style={s.levelCoinGrad}>
                <View style={s.levelCoinRing} />
                <Text style={s.levelCoinEmoji}>{nivelActual?.emoji ?? '☕'}</Text>
                <Text style={s.levelCoinName} numberOfLines={2}>
                  {nivelActual?.nombre ?? 'Nivel 1'}
                </Text>
              </LinearGradient>
              <Text style={[s.levelPts, { color: nivelActual?.color ?? T.amber }]}>{puntos}</Text>
              <Text style={s.levelPtsLbl}>pts</Text>
            </View>
          </View>
          <View style={s.progBg}>
            <View style={[s.progFill, { width: `${progressPct}%` as any, backgroundColor: nivelActual?.color ?? T.amber }]} />
          </View>
          <Text style={s.progExpl}>{t('home.pts_explain', '$1.000 COP = 1 punto')}</Text>
        </Animated.View>

        {/* ── Personal QR ──────────────────────────────────────────────────── */}
        <View style={s.qrCard}>
          <LinearGradient colors={['#F5EDD0', '#FFFBF0', '#F0E4C0']} style={StyleSheet.absoluteFill} />
          {/* Decorative coffee corner beans */}
          <Text style={[s.qrCorner, { top: 10, left: 10 }]}>☕</Text>
          <Text style={[s.qrCorner, { top: 10, right: 10 }]}>🫘</Text>
          <Text style={[s.qrCorner, { bottom: 10, left: 10 }]}>🫘</Text>
          <Text style={[s.qrCorner, { bottom: 10, right: 10 }]}>☕</Text>

          <Text style={s.qrCardTitle}>
            {t('home.my_qr_title', 'MI QR PERSONAL')}
          </Text>
          <Text style={s.qrCardName}>{displayName.toUpperCase()}</Text>

          <View style={s.qrCodeWrap}>
            <View style={s.qrInnerBorder}>
              <QRCode
                value={passportId}
                size={130}
                color={T.dark}
                backgroundColor="transparent"
              />
            </View>
            {/* Decorative coffee leaf corners on QR */}
            <Text style={[s.qrLeaf, { top: -4, left: -4 }]}>🍃</Text>
            <Text style={[s.qrLeaf, { top: -4, right: -4 }]}>🍃</Text>
            <Text style={[s.qrLeaf, { bottom: -4, left: -4 }]}>🍃</Text>
            <Text style={[s.qrLeaf, { bottom: -4, right: -4 }]}>🍃</Text>
          </View>

          <Text style={s.qrCardSub}>{t('home.my_qr_sub', 'Muéstralo al vendedor para registrar tus puntos')}</Text>
          <View style={s.qrIdRow}>
            <Text style={s.qrIdLabel}>{t('home.my_qr_id', 'ID PASAPORTE')}</Text>
            <Text style={s.qrIdValue}>{passportId}</Text>
          </View>
        </View>

        {/* ── Passport card ────────────────────────────────────────────────── */}
        <TouchableOpacity onPress={() => nav.navigate('Pasaporte')} activeOpacity={0.82} style={s.passCard}>
          <LinearGradient colors={['#2A1006', '#5C2E12', '#8B4A22', '#C07840']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          {/* Leather texture lines */}
          <View style={s.leatherLine1} />
          <View style={s.leatherLine2} />

          <View style={{ flex: 1 }}>
            <View style={s.passBadge}>
              <Text style={s.passBadgeText}>{t('home.passport_badge', '✦ PASAPORTE')}</Text>
            </View>
            <Text style={s.passCount}>{stampsCount} / 38</Text>
            <Text style={s.passSub}>{t('home.municipalities_label', 'municipios cafeteros del Tolima')}</Text>
          </View>

          {/* Stamp tiles grid */}
          <View style={s.stampGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <View key={i} style={[s.stampTile, i < stampsCount && s.stampTileEarned]}>
                {i < stampsCount ? (
                  <Text style={s.stampTileEmoji}>🏔️</Text>
                ) : (
                  <View style={s.stampTileEmpty} />
                )}
              </View>
            ))}
          </View>
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
            const maxV = topStands[0].ventas ?? 1;
            const pct  = ((stand.ventas ?? 0) / maxV) * 100;
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
        <Text style={[s.sectionTitle, { marginBottom: 12, marginTop: 6 }]}>{t('home.prev_fairs_title', 'FERIAS ANTERIORES')}</Text>
        <View style={s.feriasRow}>
          {PREV_FAIRS.map(f => (
            <View key={f.key} style={s.feriaCard}>
              <LinearGradient colors={[f.c1, f.c2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.feriaGrad}>
                <Image source={require('../../../assets/logo-feria-icon.png')} style={s.feriaLogo} resizeMode="contain" />
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
              <View key={niv.id} style={[s.nivelRow, isCurrent && { borderColor: niv.color, backgroundColor: niv.color + '12' }]}>
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

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: T.bg },
  scroll: { padding: 18, paddingTop: 14, paddingBottom: 44 },

  // Header
  header:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 10 },
  greeting:   { fontSize: 26, fontWeight: '900', color: T.dark, letterSpacing: 0.2 },
  eventRow:   { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  eventIcon:  { fontSize: 12 },
  eventSub:   { fontSize: 11, color: T.body, fontWeight: '600', flex: 1 },
  salirBtn:   { marginTop: 10, alignSelf: 'flex-start', backgroundColor: T.coffeeDark, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  salirText:  { color: '#FFF', fontWeight: '900', fontSize: 12, letterSpacing: 1 },

  // Fair logo medallion
  medallion:      { width: 90, height: 90 },
  medallionGrad:  { flex: 1, borderRadius: 45, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 8 },
  medallionRingOuter: { position: 'absolute', top: 3, left: 3, right: 3, bottom: 3, borderRadius: 42, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  medallionRingInner: { position: 'absolute', top: 8, left: 8, right: 8, bottom: 8, borderRadius: 37, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  medallionLogo:  { width: 44, height: 44, tintColor: '#FFF8E0' },
  medallionLabel: { fontSize: 7, fontWeight: '900', color: 'rgba(255,248,224,0.85)', letterSpacing: 2, marginTop: 2 },

  // Happy hour
  hhBanner: { padding: 12, borderRadius: 14, alignItems: 'center', marginBottom: 16 },
  hhText:   { color: T.dark, fontWeight: '900', fontSize: 13, letterSpacing: 1 },

  // Stats scroll
  statsScroll:    { borderRadius: 16, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: T.parchDark, shadowColor: T.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  scrollCurlTop:  { height: 6, backgroundColor: T.parchDark, borderTopLeftRadius: 16, borderTopRightRadius: 16, opacity: 0.5 },
  scrollCurlBot:  { height: 6, backgroundColor: T.parchDark, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, opacity: 0.5 },
  statsRow:       { flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 8 },
  statItem:       { flex: 1, alignItems: 'center', gap: 2 },
  statIcon:       { fontSize: 20, marginBottom: 2 },
  statNum:        { fontSize: 22, fontWeight: '900', color: T.dark },
  statLbl:        { fontSize: 7, color: T.muted, textTransform: 'uppercase', textAlign: 'center', letterSpacing: 0.5, fontWeight: '700' },
  statDiv:        { width: 1, backgroundColor: T.parchDark, marginVertical: 4 },

  // Level card
  levelCard:     { borderRadius: 20, borderWidth: 2, borderColor: T.borderMed, padding: 16, marginBottom: 16, overflow: 'hidden', backgroundColor: T.card, shadowColor: T.dark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 5 },
  corner:        { position: 'absolute', width: 14, height: 14 },
  cornerTL:      { top: 8, left: 8, borderTopWidth: 2, borderLeftWidth: 2, borderColor: T.gold },
  cornerTR:      { top: 8, right: 8, borderTopWidth: 2, borderRightWidth: 2, borderColor: T.gold },
  cornerBL:      { bottom: 8, left: 8, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: T.gold },
  cornerBR:      { bottom: 8, right: 8, borderBottomWidth: 2, borderRightWidth: 2, borderColor: T.gold },
  levelRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  levelLabel:    { fontSize: 9, color: T.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  levelName:     { fontSize: 22, fontWeight: '900', lineHeight: 26 },
  levelNext:     { fontSize: 10, color: T.muted, marginTop: 4, marginBottom: 8 },
  eliteBadge:    { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginTop: 4 },
  eliteBadgeText:{ fontSize: 9, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
  levelCoin:     { alignItems: 'center', width: 90 },
  levelCoinGrad: { width: 78, height: 78, borderRadius: 39, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 6 },
  levelCoinRing: { position: 'absolute', top: 5, left: 5, right: 5, bottom: 5, borderRadius: 34, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)' },
  levelCoinEmoji:{ fontSize: 20, zIndex: 1 },
  levelCoinName: { fontSize: 9, fontWeight: '900', color: '#FFF8E0', textAlign: 'center', letterSpacing: 0.5, zIndex: 1, marginTop: 2 },
  levelPts:      { fontSize: 34, fontWeight: '900', marginTop: 6, lineHeight: 38 },
  levelPtsLbl:   { fontSize: 10, color: T.muted },
  progBg:        { height: 10, backgroundColor: T.border, borderRadius: 5, overflow: 'hidden', marginBottom: 6 },
  progFill:      { height: '100%', borderRadius: 5 },
  progExpl:      { fontSize: 10, color: T.muted, textAlign: 'right' },

  // Personal QR card
  qrCard:        { borderRadius: 20, borderWidth: 2, borderColor: T.borderMed, padding: 18, marginBottom: 16, overflow: 'hidden', alignItems: 'center', shadowColor: T.dark, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  qrCorner:      { position: 'absolute', fontSize: 16 },
  qrCardTitle:   { fontSize: 11, fontWeight: '900', color: T.amberDark, letterSpacing: 2.5, marginBottom: 4 },
  qrCardName:    { fontSize: 16, fontWeight: '900', color: T.dark, marginBottom: 14, letterSpacing: 0.5 },
  qrCodeWrap:    { position: 'relative', padding: 6, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 14, borderWidth: 1.5, borderColor: T.borderMed, marginBottom: 12 },
  qrInnerBorder: { borderRadius: 10, overflow: 'hidden', backgroundColor: 'transparent' },
  qrLeaf:        { position: 'absolute', fontSize: 12 },
  qrCardSub:     { fontSize: 11, color: T.body, textAlign: 'center', maxWidth: 260, lineHeight: 16, marginBottom: 10 },
  qrIdRow:       { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: T.coffeeDark + '15', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  qrIdLabel:     { fontSize: 8, fontWeight: '900', color: T.amberDark, letterSpacing: 2 },
  qrIdValue:     { fontSize: 13, fontWeight: '900', color: T.dark, letterSpacing: 1.5 },

  // Passport card
  passCard:      { borderRadius: 20, padding: 18, marginBottom: 14, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', shadowColor: '#1A0800', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 8, minHeight: 130 },
  leatherLine1:  { position: 'absolute', top: 28, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  leatherLine2:  { position: 'absolute', top: 30, left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
  passBadge:     { backgroundColor: 'rgba(255,240,180,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,240,180,0.35)' },
  passBadgeText: { fontSize: 9, fontWeight: '900', color: '#FBF0C8', letterSpacing: 1.5 },
  passCount:     { fontSize: 40, fontWeight: '900', color: '#FFF', lineHeight: 44 },
  passSub:       { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  stampGrid:     { flexWrap: 'wrap', flexDirection: 'row', width: 100, gap: 5, marginLeft: 8 },
  stampTile:     { width: 28, height: 28, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  stampTileEarned: { backgroundColor: 'rgba(212,165,32,0.35)', borderColor: 'rgba(212,165,32,0.6)' },
  stampTileEmpty:  { width: 14, height: 14, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.12)' },
  stampTileEmoji:  { fontSize: 15 },

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

  // Explore tiles
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  tile:     { width: (width - 46) / 2, borderRadius: 16, overflow: 'hidden', shadowColor: T.dark, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
  tileGrad: { padding: 16, height: 100, justifyContent: 'space-between' },
  tileIcon: { fontSize: 24 },
  tileLbl:  { fontSize: 14, fontWeight: '900', color: '#FFF' },
  tileSub:  { fontSize: 9, color: 'rgba(255,255,255,0.8)' },

  // Previous fairs
  feriasRow:    { flexDirection: 'row', gap: 10, marginBottom: 20 },
  feriaCard:    { flex: 1, borderRadius: 18, overflow: 'hidden', shadowColor: T.dark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 10, elevation: 5 },
  feriaGrad:    { padding: 14, minHeight: 150, justifyContent: 'flex-end' },
  feriaLogo:    { width: 28, height: 28, tintColor: 'rgba(255,255,255,0.85)', marginBottom: 6 },
  feriaCity:    { fontSize: 16, fontWeight: '900', color: '#FFF', letterSpacing: 0.2 },
  feriaFairName:{ fontSize: 9, color: 'rgba(255,255,255,0.6)', marginTop: 2, lineHeight: 13 },
  feriaDesc:    { fontSize: 9, color: 'rgba(255,255,255,0.45)', marginTop: 4, lineHeight: 13 },

  // Passport levels
  nivelRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: T.border, marginBottom: 8, backgroundColor: T.card },
  nivelEmoji:  { fontSize: 20, width: 28, textAlign: 'center' },
  nivelName:   { fontSize: 13, fontWeight: '800' },
  nivelRange:  { fontSize: 10, color: T.muted, marginTop: 2 },
  nivelPremio: { fontSize: 11, color: T.muted, maxWidth: 100, textAlign: 'right' },
  nivelDot:    { width: 8, height: 8, borderRadius: 4, marginLeft: 4 },
} as any);
