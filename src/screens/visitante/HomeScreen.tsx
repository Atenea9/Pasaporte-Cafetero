import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';
import { NIVELES, getTopStands, getNivelActual, getNivelSiguiente } from '../../data/mockData';
import type { VisitanteNavProp } from '../../navigation/types';

const C = { bg: '#0B1608', card: '#142210', card2: '#1C3018', gold: '#CFA020', goldLight: '#EAC040', text: '#F3EED6', muted: '#6A8060', danger: '#E05050' };
const { width } = Dimensions.get('window');

const PREMIO_LABEL: Record<string, string> = {
  cafe: '☕ Café Especial',
  kits_cafe: '🎁 Kit de Café',
  cursos: '📚 Curso SCA',
  visitas_exclusivas: '🏡 Visita Exclusiva',
};

export const HomeScreen = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const nav = useNavigation<VisitanteNavProp>();
  const [stats, setStats] = useState({ visitorCount: 847, activeStands: 11, happyHour: false });
  const [userStats, setUserStats] = useState<any>({ points: 0, stamps: [] });
  const pulsAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulsAnim, { toValue: 1.025, duration: 2000, useNativeDriver: true }),
      Animated.timing(pulsAnim, { toValue: 1.0, duration: 2000, useNativeDriver: true }),
    ])).start();
  }, []);

  useFocusEffect(useCallback(() => {
    let alive = true;
    mockDbService.getHomeStats().then(d => { if (alive) setStats(d); });
    if (user?.uid) mockDbService.getUserStats(user.uid).then(d => { if (alive) setUserStats(d); });
    return () => { alive = false; };
  }, [user]));

  const puntos: number = userStats?.points ?? 0;
  const nivelActual = getNivelActual(puntos);
  const nivelSig = getNivelSiguiente(puntos);
  const stampsCount: number = (userStats?.stamps ?? []).length;
  const topStands = getTopStands(4);
  const progressPct = nivelActual && nivelSig
    ? Math.min(((puntos - nivelActual.minPuntos) / (nivelSig.minPuntos - nivelActual.minPuntos)) * 100, 100)
    : nivelActual ? 100 : 0;

  const TILES = [
    { icon: '🗺️', label: t('home.fair_map', 'Mapa'), sub: t('home.fair_map_sub', 'Stands y escenarios'), screen: 'MapaFeria' as const, grad: ['#1B5E20', C.card] as [string, string] },
    { icon: '📅', label: t('home.agenda', 'Agenda'), sub: t('home.agenda_sub', '3 días de programa'), screen: 'Agenda' as const, grad: ['#1A237E', C.card] as [string, string] },
    { icon: '🏛️', label: t('home.sponsors', 'Auspiciadores'), sub: t('home.sponsors_sub', 'Gobernación'), screen: 'Auspiciadores' as const, grad: ['#37474F', C.card] as [string, string] },
    { icon: '🏅', label: t('nav.ranking', 'Ranking'), sub: 'Tabla de posiciones', screen: 'Ranking' as const, grad: ['#4A148C', C.card] as [string, string] },
  ];

  return (
    <LinearGradient colors={[C.bg, '#0F1E0B', C.bg]} style={s.container}>
      <Animated.ScrollView style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Header */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.greeting}>{t('home.greeting', '¡Hola,')} {user?.name?.split(' ')[0] || 'Cafetero'} 👋</Text>
            <Text style={s.headerSub}>Feria Internacional del Café · Chaparral, Tolima 2026</Text>
          </View>
          <TouchableOpacity onPress={logout} style={s.logoutBtn}>
            <Text style={s.logoutIcon}>↩</Text>
          </TouchableOpacity>
        </View>

        {/* Happy Hour */}
        {stats.happyHour && (
          <LinearGradient colors={['#7A5200', C.gold]} style={s.hhBanner}>
            <Text style={s.hhText}>{t('home.happy_hour_active', '✨ HAPPY HOUR — PUNTOS DOBLES ✨')}</Text>
          </LinearGradient>
        )}

        {/* Stats Strip */}
        <View style={s.statsStrip}>
          {[
            { val: stats.visitorCount, lbl: t('home.visitors_now', 'visitantes') },
            { val: stats.activeStands, lbl: t('home.active_stands', 'stands activos') },
            { val: puntos, lbl: t('common.points', 'puntos') },
            { val: stampsCount, lbl: t('common.stamps', 'sellos') },
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
          <LinearGradient
            colors={nivelActual ? [nivelActual.color + '44', nivelActual.color + '11', C.card] : [C.card2, C.card]}
            style={[s.levelCard, { borderColor: nivelActual?.color ?? C.muted }]}
          >
            <View style={s.levelRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.levelLabel}>{t('home.your_level', 'TU NIVEL')}</Text>
                <Text style={[s.levelName, { color: nivelActual?.color ?? C.muted }]}>
                  {nivelActual ? `${nivelActual.emoji}  ${nivelActual.nombre}` : '☕  ¡Haz tu primera compra!'}
                </Text>
                {nivelSig && <Text style={s.levelNext}>{nivelSig.minPuntos - puntos} pts → {nivelSig.nombre}</Text>}
              </View>
              <View style={s.levelPtsBox}>
                <Text style={[s.levelPts, { color: nivelActual?.color ?? C.gold }]}>{puntos}</Text>
                <Text style={s.levelPtsLbl}>pts</Text>
              </View>
            </View>
            <View style={s.progBg}>
              <View style={[s.progFill, { width: `${progressPct}%` as any, backgroundColor: nivelActual?.color ?? C.muted }]} />
            </View>
            <Text style={s.progExpl}>{t('home.pts_explain', '$1.000 COP = 1 punto')}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Passport Preview */}
        <TouchableOpacity onPress={() => nav.navigate('Pasaporte')} activeOpacity={0.82}>
          <LinearGradient colors={['#3A2618', '#1A110A']} style={s.passCard}>
            <View style={{ flex: 1 }}>
              <Text style={s.passTitle}>🛂  {t('home.your_passport', 'TU PASAPORTE')}</Text>
              <Text style={s.passStamps}>{stampsCount} / 38</Text>
              <Text style={s.passSub}>municipios cafeteros del Tolima</Text>
            </View>
            <View style={s.miniGrid}>
              {Array.from({ length: 15 }).map((_, i) => (
                <View key={i} style={[s.miniDot, i < stampsCount && s.miniDotFilled]} />
              ))}
            </View>
            <Text style={s.passArrow}>›</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Prize Cards */}
        {nivelActual && (
          <View style={s.prizeRow}>
            <LinearGradient colors={['#2A1F00', C.card]} style={[s.prizeCard, { borderColor: C.gold }]}>
              <Text style={s.prizeLbl}>🏆 TU PREMIO</Text>
              <Text style={s.prizeVal}>{PREMIO_LABEL[nivelActual.premioKey]}</Text>
            </LinearGradient>
            {nivelSig && (
              <View style={[s.prizeCard, { borderColor: C.muted, backgroundColor: C.card }]}>
                <Text style={[s.prizeLbl, { color: C.muted }]}>⬆ PRÓXIMO</Text>
                <Text style={[s.prizeVal, { color: C.muted }]}>{PREMIO_LABEL[nivelSig.premioKey]}</Text>
              </View>
            )}
          </View>
        )}

        {/* Top Stands */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('home.top_stands', 'STANDS MÁS VISITADOS')}</Text>
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

        {/* Explore Grid */}
        <Text style={[s.sectionTitle, { marginBottom: 12 }]}>{t('home.explore', 'EXPLORAR LA FERIA')}</Text>
        <View style={s.tileGrid}>
          {TILES.map((tile) => (
            <TouchableOpacity key={tile.screen} style={s.tile} onPress={() => nav.navigate(tile.screen)} activeOpacity={0.8}>
              <LinearGradient colors={tile.grad} style={s.tileGrad}>
                <Text style={s.tileIcon}>{tile.icon}</Text>
                <Text style={s.tileLbl}>{tile.label}</Text>
                <Text style={s.tileSub}>{tile.sub}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Levels Overview */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>LOS 4 NIVELES DEL PASAPORTE</Text>
          {NIVELES.map((niv) => {
            const isCurrent = nivelActual?.id === niv.id;
            return (
              <View key={niv.id} style={[s.nivelRow, isCurrent && { borderColor: niv.color, backgroundColor: niv.color + '18' }]}>
                <Text style={s.nivelEmoji}>{niv.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.nivelName, { color: isCurrent ? niv.color : C.text }]}>{niv.nombre}</Text>
                  <Text style={s.nivelRange}>{niv.minPuntos} – {niv.maxPuntos > 9000 ? '601+' : niv.maxPuntos} pts</Text>
                </View>
                <Text style={s.nivelPremio}>{PREMIO_LABEL[niv.premioKey]}</Text>
                {isCurrent && <View style={[s.nivelDot, { backgroundColor: niv.color }]} />}
              </View>
            );
          })}
        </View>
      </Animated.ScrollView>
    </LinearGradient>
  );
};

export default HomeScreen;

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 54, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 },
  greeting: { fontSize: 22, fontWeight: '900', color: C.text, letterSpacing: 0.3 },
  headerSub: { fontSize: 10, color: C.muted, marginTop: 3, letterSpacing: 0.5 },
  logoutBtn: { backgroundColor: C.card, borderRadius: 20, padding: 8, borderWidth: 1, borderColor: C.muted + '44', marginLeft: 10 },
  logoutIcon: { fontSize: 16, color: C.danger },
  hhBanner: { padding: 12, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  hhText: { color: C.bg, fontWeight: '900', fontSize: 13, letterSpacing: 1 },
  statsStrip: { flexDirection: 'row', backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: C.card2 },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '900', color: C.gold },
  statLbl: { fontSize: 9, color: C.muted, marginTop: 2, textTransform: 'uppercase', textAlign: 'center', letterSpacing: 0.5 },
  statDiv: { width: 1, backgroundColor: C.card2 },
  levelCard: { borderRadius: 16, borderWidth: 1.5, padding: 18, marginBottom: 14 },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  levelLabel: { fontSize: 9, color: C.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  levelName: { fontSize: 20, fontWeight: '900' },
  levelNext: { fontSize: 11, color: C.muted, marginTop: 4 },
  levelPtsBox: { alignItems: 'flex-end' },
  levelPts: { fontSize: 38, fontWeight: '900', lineHeight: 42 },
  levelPtsLbl: { fontSize: 12, color: C.muted },
  progBg: { height: 8, backgroundColor: C.card2, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progFill: { height: '100%', borderRadius: 4 },
  progExpl: { fontSize: 10, color: C.muted, textAlign: 'right' },
  passCard: { borderRadius: 16, padding: 18, marginBottom: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.gold + '44' },
  passTitle: { fontSize: 10, fontWeight: '900', color: C.gold, letterSpacing: 1.5, marginBottom: 6 },
  passStamps: { fontSize: 28, fontWeight: '900', color: C.text },
  passSub: { fontSize: 10, color: C.muted, marginTop: 2 },
  miniGrid: { flexWrap: 'wrap', flexDirection: 'row', width: 64, gap: 4, marginHorizontal: 10 },
  miniDot: { width: 14, height: 14, borderRadius: 3, backgroundColor: 'transparent', borderWidth: 1, borderColor: C.gold + '44' },
  miniDotFilled: { backgroundColor: C.gold, borderColor: C.gold },
  passArrow: { fontSize: 24, color: C.gold, marginLeft: 4 },
  prizeRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  prizeCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 14 },
  prizeLbl: { fontSize: 9, fontWeight: '900', color: C.gold, letterSpacing: 1, marginBottom: 4 },
  prizeVal: { fontSize: 12, fontWeight: '700', color: C.text },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 10, fontWeight: '900', color: C.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
  standRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  standRank: { fontSize: 12, fontWeight: '900', color: C.muted, width: 26, textAlign: 'center' },
  standNameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  standName: { fontSize: 12, color: C.text, fontWeight: '700', flex: 1 },
  standSales: { fontSize: 11, color: C.gold, fontWeight: '700' },
  barBg: { height: 5, backgroundColor: C.card2, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: C.gold, borderRadius: 3 },
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  tile: { width: (width - 50) / 2, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: C.card2 },
  tileGrad: { padding: 16, height: 100, justifyContent: 'space-between' },
  tileIcon: { fontSize: 24 },
  tileLbl: { fontSize: 13, fontWeight: '900', color: C.text },
  tileSub: { fontSize: 10, color: C.muted },
  nivelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: C.card2, marginBottom: 8, backgroundColor: C.card },
  nivelEmoji: { fontSize: 20, width: 28, textAlign: 'center' },
  nivelName: { fontSize: 13, fontWeight: '800' },
  nivelRange: { fontSize: 10, color: C.muted, marginTop: 2 },
  nivelPremio: { fontSize: 11, color: C.muted, maxWidth: 100, textAlign: 'right' },
  nivelDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 4 },
});
