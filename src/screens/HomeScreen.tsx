import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView,
  TouchableOpacity, Dimensions, Animated, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { useNav } from '../context/NavContext';
import { MUNICIPIOS } from '../data/mockData';
import { DonutRing, HorizontalBarChart, VerticalBarChart, StatPill } from '../components/Charts';

const { width: SW } = Dimensions.get('window');

// ── Paleta definitiva ─────────────────────────────────────────────────────────
const C = {
  bg: '#0D0800', card: '#1E1000', card2: '#2C1A00', card3: '#3D2400',
  gold: '#C8860A', goldLight: '#E8A830', goldDim: '#8B5E07',
  green: '#2E5016', greenLight: '#4A8C28',
  text: '#F5EDD8', muted: '#A89070', white: '#FFFFFF',
  border: '#C8860A25', borderBright: '#C8860A60',
  red: '#C0392B', teal: '#0E6655',
};

// ── Datos mock para la feria ──────────────────────────────────────────────────
const FERIA_STATS = {
  visitantesHoy: 1847, standsActivos: 8,
  puntosDistribuidos: 45230, premiosEntregados: 23,
};
const STANDS_RANKING = [
  { label: 'Café Planadas', value: 342, color: C.gold,       emoji: '☕' },
  { label: 'Artesanías Ibagué', value: 289, color: '#8E6BBF', emoji: '🎨' },
  { label: 'Sabores Rio Blanco', value: 256, color: '#1E88E5', emoji: '💧' },
  { label: 'Oro Verde',     value: 198, color: '#F57F17', emoji: '🌻' },
  { label: 'Herrera Natural', value: 175, color: '#6A1B9A', emoji: '🍇' },
];
const HOURLY_DATA = [
  { label: '9a', value: 45 },  { label: '10a', value: 89 },
  { label: '11a', value: 134 },{ label: '12p', value: 167, active: true },
  { label: '1p', value: 145 }, { label: '2p', value: 178, active: true },
  { label: '3p', value: 156 }, { label: '4p', value: 189, active: true },
  { label: '5p', value: 167 }, { label: '6p', value: 123 },
];
const AGENDA = [
  { icon: '☕', titulo: 'Cata de Café Especial', hora: '11:00 – 12:30', lugar: 'Salón de Cataciones', activo: false },
  { icon: '🎤', titulo: 'Charla: Innovación en Café', hora: '2:00 – 3:30', lugar: 'Auditorio Principal', activo: true },
  { icon: '🎵', titulo: 'Show Musical en Vivo', hora: '6:00 – 8:00', lugar: 'Plazoleta Principal', activo: false },
];
const ACCESOS = [
  { icon: '📷', label: 'Escanear QR' }, { icon: '🗺️', label: 'Mapa' },
  { icon: '🏪', label: 'Stands' },      { icon: '🏆', label: 'Ranking' },
  { icon: '🏅', label: 'Mis Sellos' },  { icon: '🛒', label: 'Compras' },
];

// ── Live Dot ──────────────────────────────────────────────────────────────────
const LiveDot = () => {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.5, duration: 700, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: false }),
      ])
    ).start();
  }, []);
  return (
    <View style={{ width: 12, height: 12, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[s.livePulse, { transform: [{ scale: pulse }] }]} />
      <View style={s.liveDot} />
    </View>
  );
};

// ── MunicipioCard ─────────────────────────────────────────────────────────────
const MunicipioCard = ({ m, visitado }: { m: typeof MUNICIPIOS[0]; visitado: boolean }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const onPress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.94, useNativeDriver: false }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: false }),
    ]).start();
  };
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={1}>
      <Animated.View style={[s.munCard, { transform: [{ scale }], borderColor: visitado ? m.color + '90' : C.border }]}>
        <LinearGradient colors={[m.color + '30', m.color + '08']} style={s.munGrad}>
          <View style={[s.munIconBox, { backgroundColor: m.color + '25', borderColor: m.color + '50' }]}>
            <Text style={s.munEmoji}>{m.emoji}</Text>
          </View>
          {visitado && (
            <View style={[s.munCheck, { backgroundColor: m.color }]}>
              <Text style={{ fontSize: 9, color: '#fff', fontWeight: '900' }}>✓</Text>
            </View>
          )}
          <Text style={s.munNombre} numberOfLines={1}>{m.nombre}</Text>
          <Text style={s.munSub}>Tolima</Text>
          <View style={[s.munBadge, { backgroundColor: visitado ? m.color + '30' : C.card2 }]}>
            <Text style={[s.munBadgeTxt, { color: visitado ? m.color : C.muted }]}>
              {visitado ? 'Visitado' : 'Pendiente'}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ── HomeScreen ────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { state } = useApp();
  const { navigate } = useNav();
  const usuario = state.usuario;
  const puntos   = usuario?.puntos ?? 0;
  const sellos   = usuario?.sellos?.length ?? 0;
  const nombre   = usuario?.nombre ?? 'Cafetero';
  const nivel    = usuario?.nivel ?? 'Visitante';
  const notifNL  = state.notificaciones.filter(n => !n.leida).length;
  const pctSellos = Math.round((sellos / MUNICIPIOS.length) * 100);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const heroScale     = useRef(new Animated.Value(0.95)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: false }),
      Animated.spring(heroScale, { toValue: 1, useNativeDriver: false }),
    ]).start();
  }, []);

  return (
    <View style={s.root}>
      {/* ── Sticky Header ── */}
      <Animated.View style={[s.headerShell, { opacity: headerOpacity }]}>
        <LinearGradient colors={['#2C1A00', '#1A0E00']} style={s.header}>
          {/* Brand */}
          <View style={s.brandWrap}>
            <View style={s.brandIconRing}>
              <Text style={{ fontSize: 18 }}>🌿</Text>
            </View>
            <View>
              <Text style={s.brand1}>PASAPORTE</Text>
              <Text style={s.brand2}>CAFETERO · TOLIMA 2026</Text>
            </View>
          </View>
          {/* Right */}
          <View style={s.headerRight}>
            <TouchableOpacity style={s.bellBtn}>
              <Text style={{ fontSize: 20 }}>🔔</Text>
              {notifNL > 0 && (
                <View style={s.bellBadge}><Text style={s.bellBadgeTxt}>{notifNL}</Text></View>
              )}
            </TouchableOpacity>
            <LinearGradient colors={[C.goldLight, C.gold]} style={s.avatar}>
              <Text style={s.avatarTxt}>{nombre.charAt(0).toUpperCase()}</Text>
            </LinearGradient>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── HERO ── */}
        <Animated.View style={[s.hero, { transform: [{ scale: heroScale }] }]}>
          <LinearGradient colors={['#3D2400', '#1A0F00', '#0D0800']} style={s.heroGrad}>
            {/* Decorative SVG orb */}
            <View style={s.orbWrap}>
              <Svg width={260} height={260} style={{ opacity: 0.18 }}>
                <Defs>
                  <RadialGradient id="orb" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor={C.goldLight} stopOpacity="1" />
                    <Stop offset="100%" stopColor={C.gold} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx="130" cy="130" r="130" fill="url(#orb)" />
              </Svg>
            </View>

            <View style={s.heroContent}>
              {/* Greeting */}
              <View style={s.levelChip}>
                <Text style={s.levelChipTxt}>{'★ ' + nivel.toUpperCase()}</Text>
              </View>
              <Text style={s.heroGreeting}>¡Hola,</Text>
              <Text style={s.heroName}>{nombre.split(' ')[0]}!</Text>
              <Text style={s.heroSub}>Tu viaje cafetero continúa</Text>

              {/* Donut + quick stats */}
              <View style={s.heroStats}>
                <DonutRing
                  percentage={pctSellos}
                  size={130}
                  strokeWidth={9}
                  centerLabel={`${sellos}/${MUNICIPIOS.length}`}
                  centerSub="sellos"
                />
                <View style={s.heroStatsList}>
                  <View style={s.heroStatItem}>
                    <Text style={s.heroStatVal}>{puntos.toLocaleString()}</Text>
                    <Text style={s.heroStatKey}>PUNTOS</Text>
                  </View>
                  <View style={s.statDivider} />
                  <View style={s.heroStatItem}>
                    <Text style={s.heroStatVal}>{sellos}</Text>
                    <Text style={s.heroStatKey}>SELLOS</Text>
                  </View>
                  <View style={s.statDivider} />
                  <View style={s.heroStatItem}>
                    <Text style={[s.heroStatVal, { fontSize: 14 }]}>{nivel.split(' ')[0]}</Text>
                    <Text style={s.heroStatKey}>NIVEL</Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ── ACCESOS RÁPIDOS ── */}
        <View style={s.section}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>ACCESOS RÁPIDOS</Text>
          </View>
          <View style={s.accesosGrid}>
            {ACCESOS.map((a, i) => (
              <TouchableOpacity
                key={i}
                style={s.accesoItem}
                activeOpacity={0.75}
                onPress={() => {
                  if (a.label === 'Escanear QR') navigate('vendedor');
                  else if (a.label === 'Ranking')  navigate('ranking');
                  else if (a.label === 'Mis Sellos') navigate('pasaporte');
                }}
              >
                <LinearGradient colors={[C.card2, C.card]} style={s.accesoGrad}>
                  <View style={s.accesoIconBox}>
                    <Text style={s.accesoIcon}>{a.icon}</Text>
                  </View>
                  <Text style={s.accesoLabel}>{a.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── PASAPORTE BANNER ── */}
        <View style={s.sectionPad}>
          <LinearGradient colors={['#2E5016', '#1C3A0D']} style={s.pasaporteBanner}>
            <View style={{ flex: 1 }}>
              <Text style={s.pasaporteBannerLabel}>PASAPORTE CAFETERO</Text>
              <Text style={s.pasaporteBannerSub}>Tu identidad en la feria</Text>
              <TouchableOpacity style={s.pasaporteBtn} onPress={() => navigate('pasaporte')}>
                <Text style={s.pasaporteBtnTxt}>VER MI PASAPORTE</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 58 }}>🪪</Text>
          </LinearGradient>
        </View>

        {/* ── RESULTADOS EN VIVO ── */}
        <View style={s.section}>
          <View style={s.sectionRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <LiveDot />
              <Text style={s.sectionTitle}>RESULTADOS EN VIVO</Text>
            </View>
            <Text style={s.sectionSub}>Actualizado ahora</Text>
          </View>
          <View style={s.statsRow}>
            <StatPill icon="👥" value={FERIA_STATS.visitantesHoy.toLocaleString()} label="VISITANTES" accent={C.goldLight} />
            <StatPill icon="🏪" value={`${FERIA_STATS.standsActivos}/8`} label="STANDS ACTIVOS" accent={C.greenLight} />
          </View>
          <View style={[s.statsRow, { marginTop: 8 }]}>
            <StatPill icon="⭐" value={`${(FERIA_STATS.puntosDistribuidos / 1000).toFixed(0)}K`} label="PUNTOS DIST." accent={C.gold} />
            <StatPill icon="🎁" value={String(FERIA_STATS.premiosEntregados)} label="PREMIOS ENTREGADOS" accent="#E67E22" />
          </View>
        </View>

        {/* ── STANDS MÁS VISITADOS ── */}
        <View style={s.card}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>RANKING DE STANDS</Text>
            <Text style={s.sectionSub}>Top 5 hoy</Text>
          </View>
          <HorizontalBarChart
            data={STANDS_RANKING.map(d => ({ ...d, color: d.color }))}
            unit=" vis."
          />
          <View style={s.cardFooter}>
            <Text style={s.cardFooterTxt}>Total visitas: {STANDS_RANKING.reduce((s, d) => s + d.value, 0).toLocaleString()}</Text>
          </View>
        </View>

        {/* ── ACTIVIDAD POR HORA ── */}
        <View style={s.card}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>AFLUENCIA POR HORA</Text>
            <Text style={s.sectionSub}>Visitantes</Text>
          </View>
          <VerticalBarChart data={HOURLY_DATA} height={100} />
          <View style={s.cardFooter}>
            <View style={[s.legendDot, { backgroundColor: C.goldLight }]} />
            <Text style={s.cardFooterTxt}>Hora pico — máxima actividad</Text>
          </View>
        </View>

        {/* ── HAPPY HOUR ── */}
        {state.happyHour ? (
          <View style={s.sectionPad}>
            <LinearGradient colors={[C.green, '#152808']} style={s.happyCard}>
              <View style={s.happyLeft}>
                <View style={s.happyBadge}>
                  <LiveDot />
                  <Text style={s.happyBadgeTxt}>HAPPY HOUR ACTIVO</Text>
                </View>
                <Text style={s.happyTitle}>Puntos x2</Text>
                <Text style={s.happySub}>Hasta las 5:00 p.m. · Todos los stands</Text>
              </View>
              <Text style={s.happy2x}>2X</Text>
            </LinearGradient>
          </View>
        ) : (
          <View style={s.sectionPad}>
            <View style={[s.happyCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <View style={s.happyLeft}>
                <Text style={s.happyBadgeTxt2}>PRÓXIMO HAPPY HOUR</Text>
                <Text style={s.happyTitle2}>Doble puntos</Text>
                <Text style={s.happySub}>Hoy a las 4:00 p.m.</Text>
              </View>
              <Text style={{ fontSize: 40 }}>⏱️</Text>
            </View>
          </View>
        )}

        {/* ── MUNICIPIOS ── */}
        <View style={s.section}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>MUNICIPIOS CAFETEROS</Text>
            <Text style={s.sectionSub}>{sellos}/{MUNICIPIOS.length} visitados</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
            {MUNICIPIOS.map(m => (
              <MunicipioCard key={m.id} m={m} visitado={(usuario?.sellos ?? []).includes(m.nombre)} />
            ))}
          </ScrollView>
        </View>

        {/* ── AGENDA ── */}
        <View style={s.section}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>AGENDA DE HOY</Text>
          </View>
          {AGENDA.map((a, i) => (
            <View key={i} style={[s.agendaItem, a.activo && s.agendaItemActive]}>
              {a.activo && <LiveDot />}
              <View style={[s.agendaIconBox, { backgroundColor: a.activo ? C.gold + '30' : C.card2 }]}>
                <Text style={{ fontSize: 20 }}>{a.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.agendaTitulo, a.activo && { color: C.goldLight }]}>{a.titulo}</Text>
                <Text style={s.agendaHora}>{a.hora}</Text>
                <Text style={s.agendaLugar}>{a.lugar}</Text>
              </View>
              {a.activo && (
                <View style={s.agendaActivoBadge}>
                  <Text style={s.agendaActivoTxt}>EN VIVO</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* ── PREMIOS BANNER ── */}
        <View style={s.sectionPad}>
          <LinearGradient colors={['#3D2400', '#1E1000']} style={s.premiosBanner}>
            <View style={{ flex: 1 }}>
              <Text style={s.premiosTitle}>¡Acumula sellos{'\n'}y gana premios!</Text>
              <TouchableOpacity style={s.premiosBtn}>
                <Text style={s.premiosBtnTxt}>Ver premios →</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 64 }}>🎁</Text>
          </LinearGradient>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── BOTTOM NAV ── */}
      <View style={s.navShell}>
        <LinearGradient colors={['#1A0F00CC', '#1A0F00FF']} style={s.nav}>
          {[
            { icon: '🏠', label: 'INICIO',    screen: 'home'      as const },
            { icon: '🎫', label: 'PASAPORTE', screen: 'pasaporte' as const },
            { icon: '📷', label: '',           screen: 'vendedor'  as const, qr: true },
            { icon: '🏆', label: 'RANKING',   screen: 'ranking'   as const },
            { icon: '👤', label: 'PERFIL',    screen: 'pasaporte' as const },
          ].map((n, i) => (
            <TouchableOpacity key={i} style={s.navItem} activeOpacity={0.7} onPress={() => navigate(n.screen)}>
              {n.qr ? (
                <LinearGradient colors={[C.goldLight, C.gold]} style={s.navQR}>
                  <Text style={{ fontSize: 22 }}>📷</Text>
                </LinearGradient>
              ) : (
                <>
                  <Text style={[s.navIcon, n.screen === 'home' && s.navIconActive]}>{n.icon}</Text>
                  <Text style={[s.navLabel, n.screen === 'home' && s.navLabelActive]}>{n.label}</Text>
                  {n.screen === 'home' && <View style={s.navDot} />}
                </>
              )}
            </TouchableOpacity>
          ))}
        </LinearGradient>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: C.bg },
  scroll:     { flex: 1, backgroundColor: C.bg },

  // Header
  headerShell:{ zIndex: 10 },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: Platform.OS === 'ios' ? 54 : 36, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.borderBright },
  brandWrap:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIconRing: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.green + '50', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.greenLight + '60' },
  brand1:     { fontSize: 15, fontWeight: '900', color: C.gold, letterSpacing: 3 },
  brand2:     { fontSize: 9, color: C.muted, letterSpacing: 1.5, marginTop: 1 },
  headerRight:{ flexDirection: 'row', alignItems: 'center', gap: 12 },
  bellBtn:    { position: 'relative', padding: 2 },
  bellBadge:  { position: 'absolute', top: -3, right: -3, backgroundColor: C.red, borderRadius: 7, width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  bellBadgeTxt:{ fontSize: 8, color: '#fff', fontWeight: '900' },
  avatar:     { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: C.goldLight },
  avatarTxt:  { fontSize: 15, fontWeight: '900', color: C.bg },

  // Hero
  hero:       { marginHorizontal: 0 },
  heroGrad:   { paddingHorizontal: 20, paddingBottom: 28, paddingTop: 20, overflow: 'hidden' },
  orbWrap:    { position: 'absolute', top: -60, right: -60 },
  heroContent:{ zIndex: 1 },
  levelChip:  { alignSelf: 'flex-start', backgroundColor: C.gold + '22', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: C.gold + '50', marginBottom: 8 },
  levelChipTxt:{ fontSize: 10, fontWeight: '900', color: C.goldLight, letterSpacing: 2 },
  heroGreeting:{ fontSize: 28, fontWeight: '300', color: C.text, lineHeight: 32 },
  heroName:   { fontSize: 38, fontWeight: '900', color: C.goldLight, lineHeight: 40, marginTop: -4 },
  heroSub:    { fontSize: 12, color: C.muted, marginTop: 4, marginBottom: 20 },
  heroStats:  { flexDirection: 'row', alignItems: 'center', gap: 20 },
  heroStatsList:{ flex: 1, gap: 8 },
  heroStatItem: { alignItems: 'flex-start' },
  heroStatVal:{ fontSize: 22, fontWeight: '900', color: C.text, letterSpacing: -0.5 },
  heroStatKey:{ fontSize: 9, color: C.muted, fontWeight: '800', letterSpacing: 1.5 },
  statDivider:{ height: 1, backgroundColor: C.border, width: '80%' },

  // Sections
  section:    { paddingHorizontal: 16, marginBottom: 20 },
  sectionPad: { paddingHorizontal: 16, marginBottom: 20 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle:{ fontSize: 11, fontWeight: '900', color: C.gold, letterSpacing: 2.5 },
  sectionSub: { fontSize: 10, color: C.muted },

  // Card
  card: { backgroundColor: C.card, borderRadius: 18, padding: 18, marginHorizontal: 16, marginBottom: 20, borderWidth: 1, borderColor: C.border, gap: 12 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border },
  cardFooterTxt: { fontSize: 10, color: C.muted },
  legendDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: C.goldLight },

  // Stats row
  statsRow: { flexDirection: 'row', gap: 10 },

  // Accesos
  accesosGrid:{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  accesoItem: { width: (SW - 32 - 16) / 3, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  accesoGrad: { alignItems: 'center', padding: 14, gap: 6 },
  accesoIconBox:{ width: 42, height: 42, borderRadius: 21, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  accesoIcon: { fontSize: 20 },
  accesoLabel:{ fontSize: 10, color: C.text, fontWeight: '600', textAlign: 'center' },

  // Pasaporte banner
  pasaporteBanner:{ borderRadius: 18, padding: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.greenLight + '40' },
  pasaporteBannerLabel:{ fontSize: 13, fontWeight: '900', color: C.goldLight, letterSpacing: 1.5, marginBottom: 2 },
  pasaporteBannerSub:{ fontSize: 11, color: C.text + 'BB', marginBottom: 14 },
  pasaporteBtn:{ alignSelf: 'flex-start', backgroundColor: C.gold + '25', borderRadius: 20, borderWidth: 1, borderColor: C.gold, paddingHorizontal: 16, paddingVertical: 8 },
  pasaporteBtnTxt:{ fontSize: 11, fontWeight: '800', color: C.goldLight, letterSpacing: 0.5 },

  // Happy Hour
  happyCard:  { borderRadius: 18, padding: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  happyLeft:  { flex: 1 },
  happyBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  happyBadgeTxt:{ fontSize: 10, fontWeight: '800', color: C.goldLight, letterSpacing: 1.5 },
  happyBadgeTxt2:{ fontSize: 10, fontWeight: '800', color: C.muted, letterSpacing: 1.5, marginBottom: 6 },
  happyTitle: { fontSize: 26, fontWeight: '900', color: C.goldLight, letterSpacing: -0.5 },
  happyTitle2:{ fontSize: 22, fontWeight: '800', color: C.text },
  happySub:   { fontSize: 12, color: C.text + 'BB', marginTop: 2 },
  happy2x:    { fontSize: 52, fontWeight: '900', color: C.goldLight, opacity: 0.9 },

  // Live dot
  liveDot:    { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4CAF50', position: 'absolute' },
  livePulse:  { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4CAF5040', position: 'absolute' },

  // Municipios
  munCard:    { borderRadius: 16, overflow: 'hidden', width: 120, borderWidth: 1 },
  munGrad:    { padding: 14, alignItems: 'center', gap: 6, position: 'relative' },
  munIconBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  munEmoji:   { fontSize: 24 },
  munCheck:   { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  munNombre:  { fontSize: 12, fontWeight: '700', color: C.text, textAlign: 'center' },
  munSub:     { fontSize: 9, color: C.muted },
  munBadge:   { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  munBadgeTxt:{ fontSize: 9, fontWeight: '700' },

  // Agenda
  agendaItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  agendaItemActive:{ borderColor: C.gold + '60', backgroundColor: C.card2 },
  agendaIconBox:{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  agendaTitulo:{ fontSize: 13, fontWeight: '700', color: C.text },
  agendaHora: { fontSize: 11, color: C.gold, marginTop: 2, fontWeight: '600' },
  agendaLugar:{ fontSize: 10, color: C.muted, marginTop: 1 },
  agendaActivoBadge:{ backgroundColor: C.red + '33', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: C.red + '60' },
  agendaActivoTxt:{ fontSize: 9, fontWeight: '900', color: '#FF6B6B', letterSpacing: 1 },

  // Premios
  premiosBanner:{ borderRadius: 18, padding: 22, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.gold + '30' },
  premiosTitle: { fontSize: 20, fontWeight: '900', color: C.text, lineHeight: 26, marginBottom: 14 },
  premiosBtn:   { alignSelf: 'flex-start', backgroundColor: C.gold, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10 },
  premiosBtnTxt:{ fontSize: 13, fontWeight: '800', color: C.bg },

  // Bottom Nav
  navShell:   { position: 'absolute', bottom: 0, left: 0, right: 0 },
  nav:        { flexDirection: 'row', paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 28 : 14, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: C.borderBright },
  navItem:    { flex: 1, alignItems: 'center', gap: 3 },
  navIcon:    { fontSize: 22, opacity: 0.45 },
  navIconActive:{ opacity: 1 },
  navLabel:   { fontSize: 8, color: C.muted, fontWeight: '700', letterSpacing: 0.5 },
  navLabelActive:{ color: C.gold },
  navDot:     { width: 4, height: 4, borderRadius: 2, backgroundColor: C.gold },
  navQR:      { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginTop: -22, borderWidth: 2.5, borderColor: C.bg, elevation: 8 },
});
