import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { VisitanteStackParamList } from '../../navigation/types';

const T = {
  bg: '#F9F3E3', card: '#FFFDF8', parchment: '#F5EDD0', dark: '#2C1A0E',
  body: '#5C3520', muted: '#9B7B5A', amber: '#C8960C', amberDark: '#8B6308',
  coffee: '#7B4A2A', coffeeDark: '#4A2010', border: '#EDD9A8', borderMed: '#D4B886',
  gold: '#B8860B', goldLight: '#D4A520',
};

const FAIRS: Record<string, {
  city: string; year: string; edition: string;
  c1: string; c2: string;
  microlotes: number; expositores: number; maxSubasta: number;
  desc: string; highlights: string[];
}> = {
  ibague23: {
    city: 'Ibagué', year: '2023', edition: '1ª Edición',
    c1: '#1A3A2A', c2: '#2D6A4F',
    microlotes: 34, expositores: 62, maxSubasta: 4800000,
    desc: 'Primera edición de la Feria Internacional del Café en el Tolima. Un hito histórico para la caficultura de la región, reuniendo productores, catadores y compradores internacionales en la Ciudad Musical de Colombia.',
    highlights: ['Primer concurso de microlotes', 'Participación de 8 países', 'Premio máximo: Gesha 88.5 SCA', 'Catación con Q-Graders internacionales'],
  },
  planadas24: {
    city: 'Planadas', year: '2024', edition: '2ª Edición',
    c1: '#4A1A06', c2: '#8B3A1A',
    microlotes: 48, expositores: 78, maxSubasta: 6200000,
    desc: 'Planadas, cuna del café especial del Tolima, fue escenario de la segunda edición con un récord de microlotes inscritos. La región demostró su potencial como terroir de excelencia para variedades como Caturra, Castillo y Gesha.',
    highlights: ['Récord de microlotes', 'Primer barismo de competencia', '12 países participantes', 'Primer premio barismo: $3.200.000'],
  },
  libano25: {
    city: 'Líbano', year: '2025', edition: '3ª Edición',
    c1: '#0D2B45', c2: '#1A5276',
    microlotes: 55, expositores: 91, maxSubasta: 8100000,
    desc: 'El Líbano, municipio emblema del café tolimense, recibió la tercera edición con cifras históricas. Se consolidó el sistema de subastas en línea y se integró la academia con el sector productivo mediante acuerdos con la Universidad del Tolima.',
    highlights: ['Sistema de subasta digital', '18 países compradores', 'Alianza Universidad del Tolima', 'Primer catación de mujeres cafeteras'],
  },
};

type RouteT = RouteProp<VisitanteStackParamList, 'FeriaAnterior'>;

const STAT_COLORS = ['#2D6A4F', '#8B3A1A', '#1A5276'];

export const FeriaAnteriorScreen = () => {
  const { t } = useTranslation();
  const nav = useNavigation();
  const route = useRoute<RouteT>();
  const fairKey = route.params?.fairKey ?? 'ibague23';
  const fair = FAIRS[fairKey] ?? FAIRS['ibague23'];

  const stats = [
    { icon: '☕', label: t('feria_ant.microlotes', 'Microlotes recibidos'), val: fair.microlotes.toString() },
    { icon: '👔', label: t('feria_ant.expositores', 'Expositores participantes'), val: fair.expositores.toString() },
    { icon: '🏆', label: t('feria_ant.max_subasta', 'Precio máx. subasta'), val: `$${fair.maxSubasta.toLocaleString('es-CO')} COP` },
  ];

  return (
    <View style={s.root}>
      {/* Header gradient */}
      <LinearGradient colors={[fair.c1, fair.c2]} style={s.hero}>
        <TouchableOpacity onPress={() => nav.goBack()} style={s.backBtn} activeOpacity={0.8}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Image source={require('../../../assets/logo-feria-icon.png')} style={s.heroLogo} resizeMode="contain" tintColor="rgba(255,255,255,0.8)" />
        <Text style={s.heroEdition}>{fair.edition.toUpperCase()}</Text>
        <Text style={s.heroCity}>{fair.city}</Text>
        <Text style={s.heroYear}>{fair.year}</Text>
        <Text style={s.heroFair}>{t('feria_ant.intl_coffee', 'Feria Internacional del Café · Tolima')}</Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Stats */}
        <Text style={s.sectionTitle}>{t('feria_ant.stats_title', 'DATOS HISTÓRICOS')}</Text>
        <View style={s.statsGrid}>
          {stats.map((st, i) => (
            <View key={i} style={s.statCard}>
              <LinearGradient colors={[STAT_COLORS[i] + 'CC', STAT_COLORS[i]]} style={StyleSheet.absoluteFill} />
              <Text style={s.statIcon}>{st.icon}</Text>
              <Text style={s.statVal}>{st.val}</Text>
              <Text style={s.statLbl}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{t('feria_ant.about', 'SOBRE ESTA EDICIÓN')}</Text>
          <Text style={s.cardBody}>{fair.desc}</Text>
        </View>

        {/* Highlights */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{t('feria_ant.highlights', 'MOMENTOS DESTACADOS')}</Text>
          {fair.highlights.map((h, i) => (
            <View key={i} style={s.highlightRow}>
              <View style={[s.dot, { backgroundColor: fair.c2 }]} />
              <Text style={s.highlightText}>{h}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <LinearGradient colors={[T.parchment, T.card]} style={StyleSheet.absoluteFill} />
          <Text style={s.footerTitle}>✦ PASAPORTE CAFETERO ✦</Text>
          <Text style={s.footerSub}>{t('feria_ant.footer', 'Registro histórico de la Feria Internacional del Café del Tolima')}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default FeriaAnteriorScreen;

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: T.bg },
  hero:   { paddingTop: 52, paddingBottom: 28, paddingHorizontal: 20, alignItems: 'center' },
  backBtn:{ position: 'absolute', top: 52, left: 18, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  backArrow: { fontSize: 16, color: '#FFF', fontWeight: '900' },
  heroLogo:  { width: 40, height: 40, marginBottom: 10 },
  heroEdition: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  heroCity:    { fontSize: 38, fontWeight: '900', color: '#FFF', letterSpacing: 0.3 },
  heroYear:    { fontSize: 16, color: 'rgba(255,255,255,0.75)', fontWeight: '700', marginBottom: 6 },
  heroFair:    { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '600', letterSpacing: 0.5, textAlign: 'center' },

  scroll:       { padding: 18, paddingBottom: 44 },
  sectionTitle: { fontSize: 10, fontWeight: '900', color: T.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, marginTop: 4 },

  statsGrid:    { gap: 10, marginBottom: 16 },
  statCard:     { borderRadius: 16, padding: 16, overflow: 'hidden', alignItems: 'flex-start', flexDirection: 'row', gap: 14, alignContent: 'center' },
  statIcon:     { fontSize: 26, marginTop: 2 },
  statVal:      { fontSize: 22, fontWeight: '900', color: '#FFF' },
  statLbl:      { fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 2, flex: 1 },

  card:         { borderRadius: 18, borderWidth: 1.5, borderColor: T.borderMed, backgroundColor: T.card, padding: 16, marginBottom: 14, shadowColor: T.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  cardTitle:    { fontSize: 10, fontWeight: '900', color: T.amberDark, letterSpacing: 2, marginBottom: 10 },
  cardBody:     { fontSize: 13, color: T.body, lineHeight: 20 },

  highlightRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  dot:          { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  highlightText:{ fontSize: 13, color: T.dark, flex: 1, fontWeight: '600' },

  footer:       { borderRadius: 18, padding: 18, overflow: 'hidden', alignItems: 'center', borderWidth: 1.5, borderColor: T.borderMed, marginTop: 6 },
  footerTitle:  { fontSize: 12, fontWeight: '900', color: T.amberDark, letterSpacing: 2, marginBottom: 6 },
  footerSub:    { fontSize: 11, color: T.muted, textAlign: 'center', lineHeight: 16 },
} as any);
