import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, SafeAreaView, StatusBar, Image, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, G, Circle, Ellipse } from 'react-native-svg';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../context/AppContext';
import { mockDbService } from '../../services/mockDb.service';
import { NIVELES, getNivelActual, getNivelSiguiente } from '../../data/mockData';
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

const { width, height: screenHeight } = Dimensions.get('window');

// ─── Decoración SVG: hojas y ramas de café ────────────────────────────────────
const CoffeePlantBg = () => {
  const w = width;
  const h = screenHeight;
  // Path de hoja: punta arriba y abajo, forma de hoja de café
  const leaf = (hw: number, hh: number) =>
    `M 0,${hh} C ${-hw},${hh * 0.5} ${-hw},${-hh * 0.5} 0,${-hh} C ${hw},${-hh * 0.5} ${hw},${hh * 0.5} 0,${hh} Z`;
  return (
    <Svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' } as any}>
      <G opacity={0.14}>
        {/* ── Esquina superior izquierda ── */}
        <G transform="translate(-8, 8)">
          <Path d="M 18 140 Q 35 90 48 12" stroke="#2A5E2A" strokeWidth="2.5" fill="none" />
          <G transform="translate(25,108) rotate(-55)"><Path d={leaf(13,34)} fill="#3A7A3A" /><Path d="M 0 34 L 0 -34" stroke="#1E4E1E" strokeWidth="0.9" /></G>
          <G transform="translate(36,72) rotate(-25)"><Path d={leaf(11,28)} fill="#4A8C4A" /><Path d="M 0 28 L 0 -28" stroke="#1E4E1E" strokeWidth="0.9" /></G>
          <G transform="translate(44,40) rotate(5)"><Path d={leaf(9,22)} fill="#3A7A3A" /></G>
          <G transform="translate(46,18) rotate(20)"><Path d={leaf(7,17)} fill="#4A8C4A" /></G>
          <Circle cx="30" cy="65" r="4.5" fill="#C0392B" opacity={0.72} />
          <Circle cx="22" cy="58" r="3" fill="#E74C3C" opacity={0.55} />
          <Circle cx="36" cy="55" r="3.5" fill="#C0392B" opacity={0.6} />
        </G>
        {/* ── Esquina superior derecha ── */}
        <G transform={`translate(${w + 8}, 8) scale(-1,1)`}>
          <Path d="M 18 140 Q 35 90 48 12" stroke="#2A5E2A" strokeWidth="2.5" fill="none" />
          <G transform="translate(25,108) rotate(-55)"><Path d={leaf(13,34)} fill="#4A8C4A" /><Path d="M 0 34 L 0 -34" stroke="#1E4E1E" strokeWidth="0.9" /></G>
          <G transform="translate(36,72) rotate(-25)"><Path d={leaf(11,28)} fill="#3A7A3A" /><Path d="M 0 28 L 0 -28" stroke="#1E4E1E" strokeWidth="0.9" /></G>
          <G transform="translate(44,40) rotate(5)"><Path d={leaf(9,22)} fill="#4A8C4A" /></G>
          <Circle cx="30" cy="65" r="4" fill="#C0392B" opacity={0.68} />
          <Circle cx="22" cy="58" r="3" fill="#E74C3C" opacity={0.5} />
        </G>
        {/* ── Borde izquierdo medio ── */}
        <G transform={`translate(-14, ${h * 0.32})`}>
          <G transform="rotate(-65)"><Path d={leaf(15,40)} fill="#2D6A2D" /><Path d="M 0 40 L 0 -40" stroke="#1A4A1A" strokeWidth="1.1" /></G>
        </G>
        <G transform={`translate(-10, ${h * 0.32 + 68})`}>
          <G transform="rotate(-42)"><Path d={leaf(12,30)} fill="#4A8C4A" /></G>
        </G>
        <G transform={`translate(8, ${h * 0.32 + 120})`}>
          <G transform="rotate(-20)"><Path d={leaf(10,24)} fill="#3A7A3A" /></G>
        </G>
        {/* ── Borde derecho medio ── */}
        <G transform={`translate(${w + 14}, ${h * 0.42})`}>
          <G transform="rotate(55)"><Path d={leaf(15,40)} fill="#2D6A2D" /><Path d="M 0 40 L 0 -40" stroke="#1A4A1A" strokeWidth="1.1" /></G>
        </G>
        <G transform={`translate(${w + 10}, ${h * 0.42 + 70})`}>
          <G transform="rotate(38)"><Path d={leaf(12,30)} fill="#3A7A3A" /></G>
        </G>
        {/* ── Esquina inferior izquierda ── */}
        <G transform={`translate(-6, ${h - 90})`}>
          <Path d="M 22 80 Q 40 45 50 5" stroke="#2A5E2A" strokeWidth="2" fill="none" />
          <G transform="translate(28,60) rotate(-50)"><Path d={leaf(11,28)} fill="#4A8C4A" /><Path d="M 0 28 L 0 -28" stroke="#1E4E1E" strokeWidth="0.9" /></G>
          <G transform="translate(40,32) rotate(-15)"><Path d={leaf(9,22)} fill="#3A7A3A" /></G>
          <Circle cx="36" cy="48" r="3.5" fill="#C0392B" opacity={0.65} />
          <Circle cx="26" cy="42" r="3" fill="#E74C3C" opacity={0.5} />
        </G>
        {/* ── Esquina inferior derecha ── */}
        <G transform={`translate(${w + 6}, ${h - 90}) scale(-1,1)`}>
          <Path d="M 22 80 Q 40 45 50 5" stroke="#2A5E2A" strokeWidth="2" fill="none" />
          <G transform="translate(28,60) rotate(-50)"><Path d={leaf(11,28)} fill="#3A7A3A" /><Path d="M 0 28 L 0 -28" stroke="#1E4E1E" strokeWidth="0.9" /></G>
          <G transform="translate(40,32) rotate(-15)"><Path d={leaf(9,22)} fill="#4A8C4A" /></G>
          <Circle cx="36" cy="48" r="3.5" fill="#C0392B" opacity={0.62} />
        </G>
        {/* ── Hojas sueltas dispersas ── */}
        <G transform={`translate(${w * 0.08}, ${h * 0.62}) rotate(18)`}><Path d={leaf(8,20)} fill="#3A7A3A" /></G>
        <G transform={`translate(${w * 0.92}, ${h * 0.25}) rotate(-22)`}><Path d={leaf(8,20)} fill="#4A8C4A" /></G>
        <G transform={`translate(${w * 0.05}, ${h * 0.80}) rotate(-10)`}><Path d={leaf(7,17)} fill="#2D6A2D" /></G>
        <G transform={`translate(${w * 0.95}, ${h * 0.70}) rotate(12)`}><Path d={leaf(7,17)} fill="#3A7A3A" /></G>
      </G>
    </Svg>
  );
};

const PREMIO_LABEL: Record<string, string> = {
  cafe:              '☕ Café Especial',
  kits_cafe:         '🎁 Kit de Café',
  cursos:            '📚 Curso SCA',
  visitas_exclusivas:'🏡 Visita Exclusiva',
};

const PREV_FAIRS = [
  { key: 'ibague23',  city: 'Ibagué',  year: '2023', c1: '#1A3A2A', c2: '#2D6A4F', stats: { microlotes: 34, expositores: 62, maxSubasta: 4800000 } },
  { key: 'planadas24',city: 'Planadas',year: '2024', c1: '#4A1A06', c2: '#8B3A1A', stats: { microlotes: 48, expositores: 78, maxSubasta: 6200000 } },
  { key: 'libano25',  city: 'Líbano',  year: '2025', c1: '#0D2B45', c2: '#1A5276', stats: { microlotes: 55, expositores: 91, maxSubasta: 8100000 } },
];

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
  // Top stands en vivo desde el estado de la app (se actualiza con cada venta registrada)
  const topStands = [...(state.stands ?? [])]
    .sort((a: any, b: any) => (b.ventas ?? 0) - (a.ventas ?? 0))
    .slice(0, 4);

  const activeStandsCount = state.stands?.filter((s: any) => s.activo !== false).length ?? globalStats.activeStands;

  const STAT_ITEMS = [
    { icon: '👥', val: globalStats.visitorCount,  lbl: t('home.visitors_label', 'VISITANTES') },
    { icon: '🏪', val: activeStandsCount,          lbl: t('home.stands_label', 'STANDS ACTIVOS') },
    { icon: '🪙', val: puntos,                     lbl: t('home.pts_label',       'PUNTOS') },
    { icon: '✅', val: stampsCount,                lbl: t('home.stamps_label',    'SELLOS') },
  ];

  const TILES = [
    { icon: '🗺️', label: t('home.fair_map', 'Mapa'),         sub: t('home.fair_map_sub', 'Stands'),   screen: 'MapaFeria'     as const, img: require('../../../assets/tile-jungle.png') },
    { icon: '📅', label: t('home.agenda', 'Agenda'),          sub: t('home.agenda_sub', '3 días'),     screen: 'Agenda'        as const, img: require('../../../assets/tile-toucan.png') },
    { icon: '🏛️', label: t('home.aliados', 'Aliados'),       sub: t('home.sponsors_sub', 'Tolima'),   screen: 'Auspiciadores' as const, img: require('../../../assets/tile-barranquero.png') },
    { icon: '🏅', label: t('nav.ranking', 'Ranking'),          sub: t('home.ranking_nav_sub', 'Tabla'),screen: 'Ranking'       as const, img: require('../../../assets/tile-ocelot.png') },
  ];

  const PROGRAM_TILES = [
    { icon: '👔', label: t('home.expositores_tile', 'Expositores'),            sub: t('home.expositores_tile_sub', '5 categorías'),         screen: 'Expositores'     as const, img: require('../../../assets/tile-tapir.png') },
    { icon: '☕', label: t('home.catacion_tile', 'Catación'),                  sub: t('home.catacion_tile_sub', 'Permanente'),              screen: 'Catacion'        as const, img: require('../../../assets/tile-redbird.png') },
    { icon: '🏆', label: t('home.premiaciones_tile', 'Premiaciones'),         sub: t('home.premiaciones_tile_sub', 'Microlotes · Barismo'),screen: 'Premiaciones'    as const, img: require('../../../assets/tile-bear.png') },
    { icon: '📚', label: t('home.agenda_academica_tile', 'Agenda Académica'), sub: t('home.agenda_academica_tile_sub', 'Talleres'),         screen: 'AgendaAcademica' as const, img: require('../../../assets/tile-deer.png') },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      {/* Decoración de fondo: plantas y hojas de café */}
      <CoffeePlantBg />
      <Animated.ScrollView style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Hero Banner ─────────────────────────────────────────────────── */}
        <View style={s.heroBanner}>
          <LinearGradient colors={['rgba(92,44,6,0.08)', 'rgba(200,150,12,0.06)']} style={StyleSheet.absoluteFill} />
          <View style={s.heroLogoCenter}>
            <LinearGradient colors={['#E8C030','#C8960C','#8B6308']} style={s.heroLogoGrad}>
              <Image source={require('../../../assets/logo-feria-icon.png')} style={s.heroLogoImg} resizeMode="contain" tintColor="#FFF8E0" />
              <Text style={s.heroChaparral}>{t('home.hero_chaparral', 'Chaparral 2026')}</Text>
            </LinearGradient>
          </View>
          <Text style={s.heroWelcome}>{t('home.hero_welcome', 'Bienvenidos al')}</Text>
          <Text style={s.heroTitle}>{'TOLIMA\nCORAZÓN CAFETERO'}</Text>
          <Text style={s.heroDeColombia}>{t('home.de_colombia', 'de Colombia')}</Text>
          <TouchableOpacity style={s.perfilBtn} onPress={() => nav.navigate('Perfil' as any)} activeOpacity={0.8}>
            {state.usuario?.fotoPerfil ? (
              <Image source={{ uri: state.usuario.fotoPerfil }} style={s.perfilAvatar} />
            ) : (
              <LinearGradient colors={['#D4A520','#8B6308']} style={s.perfilAvatarFallback}>
                <Text style={s.perfilInitial}>{(state.usuario?.nombre ?? 'C').charAt(0).toUpperCase()}</Text>
              </LinearGradient>
            )}
            <Text style={s.perfilBtnTxt}>{t('home.mi_perfil', 'Mi perfil →')}</Text>
          </TouchableOpacity>
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
            <TouchableOpacity key={tile.screen} style={s.tile} onPress={() => nav.navigate(tile.screen)} activeOpacity={0.85}>
              <View style={s.tileGrad}>
                <Image source={tile.img} style={s.tileImg} resizeMode="cover" />
                <LinearGradient
                  colors={['rgba(14,5,1,0)', 'rgba(14,5,1,0.28)', 'rgba(14,5,1,0.72)']}
                  style={s.tileOverlay}
                />
                <View style={s.tileCnt}>
                  <Text style={s.tileLbl}>{tile.label}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Turismo ───────────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={s.turismoBanner}
          onPress={() => Linking.openURL('https://www.chaparral-tolima.gov.co/MiMunicipio/Paginas/Turismo.aspx')}
          activeOpacity={0.82}
        >
          <Image source={require('../../../assets/tile-snake.png')} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: 16 }} resizeMode="cover" />
          <LinearGradient colors={['rgba(14,5,1,0.18)', 'rgba(60,22,0,0.72)']} style={StyleSheet.absoluteFillObject} />
          <View>
            <Text style={s.turismoTitle}>{t('home.turismo_tile', 'TURISMO')}</Text>
            <Text style={s.turismoSub}>Chaparral, Tolima</Text>
          </View>
          <View style={s.turismoArrow}>
            <Text style={{ fontSize: 22, color: '#FFF', fontWeight: '900' }}>↗</Text>
          </View>
        </TouchableOpacity>

        {/* ── Programas de la Feria ─────────────────────────────────────────── */}
        <Text style={[s.sectionTitle, { marginBottom: 12, marginTop: 6 }]}>{t('home.programs', 'PROGRAMAS DE LA FERIA')}</Text>
        <View style={s.tileGrid}>
          {PROGRAM_TILES.map(tile => (
            <TouchableOpacity key={tile.screen} style={s.tile} onPress={() => nav.navigate(tile.screen as any)} activeOpacity={0.85}>
              <View style={s.tileGrad}>
                <Image source={tile.img} style={s.tileImg} resizeMode="cover" />
                <LinearGradient
                  colors={['rgba(14,5,1,0)', 'rgba(14,5,1,0.28)', 'rgba(14,5,1,0.72)']}
                  style={s.tileOverlay}
                />
                <View style={s.tileCnt}>
                  <Text style={s.tileLbl}>{tile.label}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Ferias anteriores ─────────────────────────────────────────────── */}
        <Text style={[s.sectionTitle, { marginBottom: 12, marginTop: 6 }]}>{t('home.prev_fairs_title', 'FERIAS ANTERIORES')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.feriasScroll}>
          <View style={s.feriasInner}>
            {PREV_FAIRS.map(f => (
              <TouchableOpacity key={f.key} style={s.feriaCard} onPress={() => nav.navigate('FeriaAnterior' as any, { fairKey: f.key })} activeOpacity={0.85}>
                <LinearGradient colors={[f.c1, f.c2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.feriaGrad}>
                  <Image source={require('../../../assets/logo-feria-icon.png')} style={s.feriaLogo} resizeMode="contain" tintColor="rgba(255,255,255,0.78)" />
                  <View style={{ alignItems: 'center' }}>
                    <Text style={s.feriaCity}>{f.city}</Text>
                    <Text style={s.feriaYear}>{f.year}</Text>
                    <Text style={s.feriaArrow}>→ {t('home.ver_detalle', 'Ver detalle')}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

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

        {/* ── Salir ───────────────────────────────────────────────────────── */}
        <TouchableOpacity onPress={logout} style={s.salirBtnBottom} activeOpacity={0.8}>
          <Text style={s.salirText}>{t('home.logout', 'SALIR')} →</Text>
        </TouchableOpacity>

      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: T.bg },
  scroll: { padding: 18, paddingTop: 14, paddingBottom: 44 },

  // Background coffee plants
  bgPlants: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.10 },

  // Hero banner
  heroBanner:     { marginBottom: 8, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center' },
  heroLogoCenter: { alignItems: 'center', marginBottom: 16 },
  heroLogoGrad:   { width: 80, height: 90, borderRadius: 22, alignItems: 'center', justifyContent: 'center', gap: 2, paddingTop: 12, paddingBottom: 10 },
  heroLogoImg:    { width: 40, height: 40 },
  heroChaparral:  { fontSize: 7, fontWeight: '900', color: '#FFF8E0', letterSpacing: 1.2, textTransform: 'uppercase', textAlign: 'center', marginTop: 4 },
  heroWelcome:    { fontSize: 11, fontWeight: '500', color: T.muted, letterSpacing: 2, fontStyle: 'italic', textAlign: 'center', marginBottom: 2 },
  heroTitle:      { fontSize: 22, fontWeight: '900', color: T.dark, letterSpacing: 0.5, lineHeight: 27, marginBottom: 3, textAlign: 'center' },
  heroDeColombia: { fontSize: 11, fontWeight: '600', color: T.muted, letterSpacing: 3, fontStyle: 'italic', textAlign: 'center' },
  perfilBtn:            { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, borderWidth: 1, borderColor: T.borderMed, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: 'rgba(255,253,248,0.7)' },
  perfilAvatar:         { width: 28, height: 28, borderRadius: 14 },
  perfilAvatarFallback: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  perfilInitial:        { fontSize: 13, fontWeight: '900', color: '#FFF8E0' },
  perfilBtnTxt:         { fontSize: 11, fontWeight: '700', color: T.coffee, letterSpacing: 0.5 },
  salirBtn:       { backgroundColor: T.coffeeDark, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  salirBtnBottom: { alignSelf: 'center', backgroundColor: T.coffeeDark, borderRadius: 24, paddingHorizontal: 40, paddingVertical: 13, marginTop: 10, marginBottom: 6 },
  salirText:      { color: '#FFF', fontWeight: '900', fontSize: 11, letterSpacing: 1 },

  // Happy hour
  hhBanner: { padding: 12, borderRadius: 14, alignItems: 'center', marginBottom: 16 },
  hhText:   { color: T.dark, fontWeight: '900', fontSize: 13, letterSpacing: 1 },

  // Stats scroll
  statsScroll:    { borderRadius: 20, overflow: 'hidden', marginBottom: 16, borderWidth: 1.5, borderColor: T.borderMed, shadowColor: T.dark, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 5 },
  statsRow:       { flexDirection: 'row', paddingVertical: 18, paddingHorizontal: 8 },
  statItem:       { flex: 1, alignItems: 'center', gap: 3 },
  statIcon:       { fontSize: 18, marginBottom: 2 },
  statNum:        { fontSize: 24, fontWeight: '900', color: T.amberDark },
  statLbl:        { fontSize: 7, color: T.muted, textTransform: 'uppercase', textAlign: 'center', letterSpacing: 0.8, fontWeight: '700' },
  statDiv:        { width: 1, backgroundColor: T.borderMed, marginVertical: 8 },

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
  sectionTitle: { fontSize: 9, fontWeight: '900', color: T.amberDark, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 10 },

  // Top stands
  standRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, backgroundColor: T.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: T.border },
  standRank:    { fontSize: 12, fontWeight: '900', color: T.muted, width: 24, textAlign: 'center' },
  standNameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  standName:    { fontSize: 12, color: T.dark, fontWeight: '700', flex: 1 },
  standSales:   { fontSize: 11, color: T.amber, fontWeight: '700' },
  barBg:        { height: 6, backgroundColor: T.border, borderRadius: 3, overflow: 'hidden' },
  barFill:      { height: '100%', borderRadius: 3 },

  // Explore tiles
  tileGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  tile:        { width: (width - 46) / 2, borderRadius: 16, overflow: 'hidden', shadowColor: '#1A0800', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.38, shadowRadius: 14, elevation: 8 },
  tileGrad:    { height: 138, justifyContent: 'flex-end', overflow: 'hidden', borderRadius: 16, position: 'relative' },
  tileImg:     { position: 'absolute', top: '-5%', left: '-5%', width: '110%', height: '110%' },
  tileOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16 },
  tileCnt:     { padding: 10, zIndex: 2, alignItems: 'center' },
  tileLbl:     { fontSize: 15, fontWeight: '900', color: '#FFF', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5, textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 },
  // Tourism banner
  turismoBanner: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, marginBottom: 14, overflow: 'hidden', justifyContent: 'space-between', shadowColor: '#5C2A00', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 6 },
  turismoTitle:  { fontSize: 13, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  turismoSub:    { fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 2, maxWidth: 200 },
  turismoArrow:  { alignItems: 'center' as const, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 8 },

  // Previous fairs
  feriasScroll: { marginBottom: 20 },
  feriasInner:  { flexDirection: 'row', gap: 10, paddingRight: 4 },
  feriaCard:    { width: 128, borderRadius: 16, overflow: 'hidden', shadowColor: '#0D0500', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6 },
  feriaGrad:    { padding: 14, height: 148, justifyContent: 'space-between', alignItems: 'center' },
  feriaLogo:    { width: 38, height: 38 },
  feriaCity:    { fontSize: 18, fontWeight: '900', color: '#FFF', letterSpacing: 0.2, textAlign: 'center' },
  feriaYear:    { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  feriaArrow:   { fontSize: 9, color: 'rgba(255,255,255,0.9)', fontWeight: '900', letterSpacing: 0.5, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.22)', paddingTop: 7, textAlign: 'center', width: '100%' },

  // Passport levels
  nivelRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: T.border, marginBottom: 8, backgroundColor: T.card },
  nivelEmoji:  { fontSize: 20, width: 28, textAlign: 'center' },
  nivelName:   { fontSize: 13, fontWeight: '800' },
  nivelRange:  { fontSize: 10, color: T.muted, marginTop: 2 },
  nivelPremio: { fontSize: 11, color: T.muted, maxWidth: 100, textAlign: 'right' },
  nivelDot:    { width: 8, height: 8, borderRadius: 4, marginLeft: 4 },
} as any);
