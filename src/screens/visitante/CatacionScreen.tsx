import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const T = {
  bg: '#F9F3E3', card: '#FFFDF8', parchment: '#F5EDD0',
  dark: '#2C1A0E', body: '#5C3520', muted: '#9B7B5A',
  amber: '#C8960C', amberLight: '#E8B820', amberPale: '#FBF0C8',
  amberDark: '#8B6308', coffee: '#7B4A2A', coffeeDark: '#4A2010',
  border: '#EDD9A8', borderMed: '#D4B886', gold: '#B8860B',
};

type CatKey = 'todas' | 'jovenes' | 'paz' | 'mujer' | 'certificados' | 'regional';

interface Sesion {
  id: string; categoria: CatKey; dia: string; hora: string;
  lugar: string; cafeName: string; origen: string; altitud: string;
  proceso: string; variedad: string; notas: string[];
  scaScore: number; productor: string; finca: string;
  descripcion: string; color: string; emoji: string;
}

const SESIONES: Sesion[] = [
  {
    id: 's1', categoria: 'jovenes', dia: 'Jue 29 May', hora: '10:00 AM',
    lugar: 'Salón Principal – Mesa A', cafeName: 'Café Futuro',
    origen: 'Chaparral, Tolima', altitud: '1.850 m.s.n.m.', proceso: 'Lavado',
    variedad: 'Castillo', notas: ['Fruta roja', 'Caramelo', 'Cítrico brillante'],
    scaScore: 86.5, productor: 'Jóvenes Caficultores del Sur', finca: 'El Porvenir',
    descripcion: 'Café producido por jóvenes caficultores menores de 30 años como parte del programa de relevo generacional en el sur del Tolima.',
    color: '#F57F17', emoji: '🌱',
  },
  {
    id: 's2', categoria: 'jovenes', dia: 'Vie 30 May', hora: '02:00 PM',
    lugar: 'Salón Principal – Mesa B', cafeName: 'Generación Verde',
    origen: 'Rioblanco, Tolima', altitud: '1.700 m.s.n.m.', proceso: 'Honey',
    variedad: 'Geisha', notas: ['Durazno', 'Miel', 'Té blanco'],
    scaScore: 88.0, productor: 'Asociación Juventud Cafetera', finca: 'La Esperanza',
    descripcion: 'Lote especial proceso honey desarrollado por jóvenes de la asociación AJUCA, ganadores del programa de innovación cafetera 2025.',
    color: '#F57F17', emoji: '🌱',
  },
  {
    id: 's3', categoria: 'paz', dia: 'Jue 29 May', hora: '03:00 PM',
    lugar: 'Carpa Exterior – Mesa Paz', cafeName: 'Semillas de Paz',
    origen: 'Planadas, Tolima', altitud: '1.920 m.s.n.m.', proceso: 'Natural',
    variedad: 'Caturra', notas: ['Ciruela', 'Fermentado tropical', 'Panela'],
    scaScore: 87.25, productor: 'ASOCAFPAZ', finca: 'Nueva Vida',
    descripcion: 'Café cultivado por familias en proceso de reintegración. Este lote es símbolo de transformación social y apuesta por la paz territorial en el Tolima.',
    color: '#2E7D32', emoji: '☮️',
  },
  {
    id: 's4', categoria: 'paz', dia: 'Sáb 31 May', hora: '11:00 AM',
    lugar: 'Carpa Exterior – Mesa Paz', cafeName: 'Tierra en Paz',
    origen: 'Ataco, Tolima', altitud: '1.650 m.s.n.m.', proceso: 'Lavado',
    variedad: 'Colombia', notas: ['Naranja', 'Almendra', 'Chocolate amargo'],
    scaScore: 85.75, productor: 'Fundación Café por la Paz', finca: 'El Reencuentro',
    descripcion: 'Proyecto de reconversión productiva en zonas de post-conflicto del sur del Tolima. Cada taza de este café apoya a 45 familias campesinas.',
    color: '#2E7D32', emoji: '☮️',
  },
  {
    id: 's5', categoria: 'mujer', dia: 'Vie 30 May', hora: '09:00 AM',
    lugar: 'Pabellón Mujer Cafetera', cafeName: 'Manos de Mujer',
    origen: 'San Antonio, Tolima', altitud: '1.780 m.s.n.m.', proceso: 'Lavado',
    variedad: 'Castillo', notas: ['Chocolate negro', 'Panela', 'Flor de azahar'],
    scaScore: 86.0, productor: 'ASOMUJER Tolima', finca: 'Las Flores',
    descripcion: 'Lote 100% producido, beneficiado y tostado por mujeres caficultoras del Tolima. Representan el 42% de la fuerza laboral cafetera departamental.',
    color: '#AD1457', emoji: '👩‍🌾',
  },
  {
    id: 's6', categoria: 'mujer', dia: 'Sáb 31 May', hora: '04:00 PM',
    lugar: 'Pabellón Mujer Cafetera', cafeName: 'Rosa de Altura',
    origen: 'Chaparral, Tolima', altitud: '2.050 m.s.n.m.', proceso: 'Honey',
    variedad: 'Tabi', notas: ['Rosa', 'Fresa', 'Maracuyá'],
    scaScore: 89.5, productor: 'Colectivo Mujeres de Altura', finca: 'La Cumbre',
    descripcion: 'El puntaje más alto del departamento en categoría mujer. Variedad Tabi cultivada a más de 2.000 metros en finca administrada por lideresa cafetera.',
    color: '#AD1457', emoji: '👩‍🌾',
  },
  {
    id: 's7', categoria: 'certificados', dia: 'Jue 29 May', hora: '01:00 PM',
    lugar: 'Sala Certificaciones', cafeName: 'Rainforest Gold',
    origen: 'Roncesvalles, Tolima', altitud: '2.100 m.s.n.m.', proceso: 'Lavado',
    variedad: 'Geisha', notas: ['Nuez de macadamia', 'Caramelo', 'Bergamota'],
    scaScore: 90.25, productor: 'Finca Certificada El Vergel', finca: 'El Vergel',
    descripcion: 'Café con certificación Rainforest Alliance y UTZ. Cumple los más altos estándares de sostenibilidad ambiental y responsabilidad social.',
    color: '#1565C0', emoji: '🏅',
  },
  {
    id: 's8', categoria: 'certificados', dia: 'Sáb 31 May', hora: '09:00 AM',
    lugar: 'Sala Certificaciones', cafeName: 'Organic Reserve',
    origen: 'Herveo, Tolima', altitud: '1.900 m.s.n.m.', proceso: 'Natural',
    variedad: 'Bourbon', notas: ['Ciruela pasa', 'Vainilla', 'Cacao'],
    scaScore: 88.75, productor: 'Bio-Café Herveo', finca: 'La Reserva Orgánica',
    descripcion: 'Único lote de café orgánico certificado USDA del Tolima. Cero uso de pesticidas y fertilizantes químicos desde hace 8 años.',
    color: '#1565C0', emoji: '🏅',
  },
  {
    id: 's9', categoria: 'regional', dia: 'Vie 30 May', hora: '05:00 PM',
    lugar: 'Gran Salón Regional', cafeName: 'Terroir Tolima',
    origen: 'Municipios del Tolima', altitud: '1.600 – 2.100 m.s.n.m.', proceso: 'Mixto',
    variedad: 'Múltiples variedades', notas: ['Tropical', 'Dulce', 'Complejo'],
    scaScore: 87.0, productor: 'Consorcio Cafetero Tolimense', finca: 'Diversas fincas',
    descripcion: 'Blend representativo de los 38 municipios cafeteros del Tolima. Una experiencia sensorial que captura toda la riqueza y diversidad del departamento.',
    color: '#4527A0', emoji: '🗺️',
  },
  {
    id: 's10', categoria: 'regional', dia: 'Sáb 31 May', hora: '02:00 PM',
    lugar: 'Gran Salón Regional', cafeName: 'Sur del Tolima Reserve',
    origen: 'Chaparral – Ataco – Planadas', altitud: '1.700 – 2.200 m.s.n.m.', proceso: 'Lavado',
    variedad: 'Castillo + Caturra', notas: ['Cítrico', 'Melaza', 'Nuez'],
    scaScore: 88.25, productor: 'Cooperativa Sur Cafetero', finca: 'Blend Regional',
    descripcion: 'Microlote colaborativo entre tres municipios del sur del Tolima. Refleja el potencial excepcional del corredor cafetero del río Saldaña.',
    color: '#4527A0', emoji: '🗺️',
  },
];

const CAT_CONFIG: Record<CatKey, { label: string; emoji: string; color: string; gradient: [string, string] }> = {
  todas:       { label: 'Todas',       emoji: '☕', color: '#8B4A22', gradient: ['#5C3520','#8B4A22'] },
  jovenes:     { label: 'Jóvenes',     emoji: '🌱', color: '#F57F17', gradient: ['#E65100','#F9A825'] },
  paz:         { label: 'Paz',         emoji: '☮️', color: '#2E7D32', gradient: ['#1B5E20','#388E3C'] },
  mujer:       { label: 'Mujer',       emoji: '👩‍🌾', color: '#AD1457', gradient: ['#880E4F','#C2185B'] },
  certificados:{ label: 'Certificados',emoji: '🏅', color: '#1565C0', gradient: ['#0D47A1','#1976D2'] },
  regional:    { label: 'Regional',    emoji: '🗺️', color: '#4527A0', gradient: ['#311B92','#512DA8'] },
};

const CATS = Object.entries(CAT_CONFIG) as [CatKey, typeof CAT_CONFIG[CatKey]][];

export default function CatacionScreen() {
  const { t } = useTranslation();
  const nav = useNavigation();
  const [cat, setCat] = useState<CatKey>('todas');
  const [expanded, setExpanded] = useState<string | null>(null);

  const list = cat === 'todas' ? SESIONES : SESIONES.filter(s => s.categoria === cat);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#2C1A0E" />

      {/* Header */}
      <LinearGradient colors={['#2C1A0E', '#5C3520', '#8B4A22']} style={s.headerGrad}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>{t('catacion.title', 'CATACIÓN PERMANENTE')}</Text>
          <Text style={s.headerSub}>{t('catacion.subtitle', 'Perfiles sensoriales · Chaparral 2026')}</Text>
        </View>
        <View style={s.headerBadge}>
          <Text style={s.headerBadgeNum}>{SESIONES.length}</Text>
          <Text style={s.headerBadgeLbl}>{t('catacion.sessions', 'sesiones')}</Text>
        </View>
      </LinearGradient>

      {/* Intro card */}
      <View style={s.introCard}>
        <Text style={s.introText}>
          {t('catacion.intro', 'Explore los perfiles sensoriales de los mejores cafés del Tolima en 6 categorías especiales de catación.')}
        </Text>
      </View>

      {/* Category tabs */}
      <View style={s.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabsScroll}>
          {CATS.map(([key, cfg]) => (
            <TouchableOpacity
              key={key}
              style={[s.tab, cat === key && { backgroundColor: cfg.color }]}
              onPress={() => setCat(key)}
            >
              <Text style={s.tabEmoji}>{cfg.emoji}</Text>
              <Text style={[s.tabLabel, cat === key && s.tabLabelActive]}>{cfg.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Text style={s.resultsLabel}>
          {list.length} {t('catacion.sessions_in', 'sesiones en')} {CAT_CONFIG[cat].label}
        </Text>

        {list.map(ses => {
          const cfg = CAT_CONFIG[ses.categoria];
          const isExp = expanded === ses.id;
          return (
            <TouchableOpacity
              key={ses.id}
              style={[s.sesCard, { borderTopColor: cfg.color }]}
              onPress={() => setExpanded(isExp ? null : ses.id)}
              activeOpacity={0.88}
            >
              {/* Category banner */}
              <LinearGradient colors={[cfg.gradient[0], cfg.gradient[1]]} style={s.sesBanner}>
                <Text style={s.sesBannerEmoji}>{cfg.emoji}</Text>
                <Text style={s.sesBannerLabel}>{cfg.label.toUpperCase()}</Text>
                <View style={s.scaBadge}>
                  <Text style={s.scaBadgeText}>SCA {ses.scaScore}</Text>
                </View>
              </LinearGradient>

              {/* Main info */}
              <View style={s.sesBody}>
                <View style={s.sesTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.sesCafeName}>{ses.cafeName}</Text>
                    <Text style={s.sesOrigin}>📍 {ses.origen}</Text>
                  </View>
                  <View style={s.sesTime}>
                    <Text style={s.sesTimeDay}>{ses.dia}</Text>
                    <Text style={s.sesTimeHour}>{ses.hora}</Text>
                    <Text style={s.sesLugar} numberOfLines={1}>{ses.lugar.split('–')[0].trim()}</Text>
                  </View>
                </View>

                {/* Flavor notes */}
                <View style={s.notasRow}>
                  {ses.notas.map((nota, i) => (
                    <View key={i} style={[s.notaChip, { backgroundColor: cfg.color + '15', borderColor: cfg.color + '40' }]}>
                      <Text style={[s.notaText, { color: cfg.color }]}>✦ {nota}</Text>
                    </View>
                  ))}
                </View>

                {/* Expanded info */}
                {isExp && (
                  <View style={s.sesDetail}>
                    <View style={s.detailDivider} />
                    <Text style={s.sesDesc}>{ses.descripcion}</Text>

                    <View style={s.detailGrid}>
                      <View style={s.detailItem}>
                        <Text style={s.detailIcon}>🌿</Text>
                        <Text style={s.detailLabel}>Variedad</Text>
                        <Text style={s.detailVal}>{ses.variedad}</Text>
                      </View>
                      <View style={s.detailItem}>
                        <Text style={s.detailIcon}>⚗️</Text>
                        <Text style={s.detailLabel}>Proceso</Text>
                        <Text style={s.detailVal}>{ses.proceso}</Text>
                      </View>
                      <View style={s.detailItem}>
                        <Text style={s.detailIcon}>🏔️</Text>
                        <Text style={s.detailLabel}>Altitud</Text>
                        <Text style={s.detailVal}>{ses.altitud}</Text>
                      </View>
                      <View style={s.detailItem}>
                        <Text style={s.detailIcon}>📋</Text>
                        <Text style={s.detailLabel}>Lugar</Text>
                        <Text style={s.detailVal} numberOfLines={2}>{ses.lugar}</Text>
                      </View>
                    </View>

                    <View style={s.productorCard}>
                      <Text style={s.productorLabel}>👨‍🌾 {t('catacion.producer', 'PRODUCTOR')}</Text>
                      <Text style={s.productorName}>{ses.productor}</Text>
                      <Text style={s.productorFinca}>🏡 {ses.finca}</Text>
                    </View>
                  </View>
                )}

                <View style={s.expandRow}>
                  <Text style={[s.expandText, { color: cfg.color }]}>
                    {isExp ? t('catacion.less', 'Ver menos ↑') : t('catacion.more', 'Ver perfil completo ↓')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: T.bg },
  headerGrad:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 18, gap: 10 },
  backBtn:         { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backIcon:        { fontSize: 26, color: '#FFF', lineHeight: 30, fontWeight: '300' },
  headerTitle:     { fontSize: 14, fontWeight: '900', color: '#FFF', letterSpacing: 1.5 },
  headerSub:       { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  headerBadge:     { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  headerBadgeNum:  { fontSize: 20, fontWeight: '900', color: '#FFF' },
  headerBadgeLbl:  { fontSize: 8, color: 'rgba(255,255,255,0.7)', fontWeight: '700' },
  introCard:       { backgroundColor: T.amberPale, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.border },
  introText:       { fontSize: 12, color: T.amberDark, lineHeight: 18, fontWeight: '500' },
  tabsWrap:        { backgroundColor: T.parchment, borderBottomWidth: 1, borderBottomColor: T.border },
  tabsScroll:      { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  tab:             { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: T.card, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1.5, borderColor: T.border },
  tabEmoji:        { fontSize: 14 },
  tabLabel:        { fontSize: 11, fontWeight: '700', color: T.body },
  tabLabelActive:  { color: '#FFF' },
  scroll:          { padding: 14 },
  resultsLabel:    { fontSize: 10, fontWeight: '700', color: T.muted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  sesCard:         { backgroundColor: T.card, borderRadius: 16, marginBottom: 14, borderWidth: 1, borderColor: T.border, borderTopWidth: 4, overflow: 'hidden', shadowColor: T.dark, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  sesBanner:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, gap: 8 },
  sesBannerEmoji:  { fontSize: 16 },
  sesBannerLabel:  { flex: 1, fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.9)', letterSpacing: 1.5 },
  scaBadge:        { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  scaBadgeText:    { fontSize: 11, fontWeight: '900', color: '#FFF' },
  sesBody:         { padding: 14 },
  sesTopRow:       { flexDirection: 'row', gap: 10, marginBottom: 12 },
  sesCafeName:     { fontSize: 17, fontWeight: '900', color: T.dark, marginBottom: 4 },
  sesOrigin:       { fontSize: 11, color: T.muted },
  sesTime:         { alignItems: 'flex-end', flexShrink: 0 },
  sesTimeDay:      { fontSize: 9, fontWeight: '700', color: T.muted },
  sesTimeHour:     { fontSize: 15, fontWeight: '900', color: T.amber },
  sesLugar:        { fontSize: 8, color: T.muted, maxWidth: 90, textAlign: 'right' },
  notasRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  notaChip:        { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  notaText:        { fontSize: 10, fontWeight: '700' },
  sesDetail:       { marginTop: 4 },
  detailDivider:   { height: 1, backgroundColor: T.border, marginBottom: 12 },
  sesDesc:         { fontSize: 13, color: T.body, lineHeight: 20, marginBottom: 14 },
  detailGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  detailItem:      { width: '45%', backgroundColor: T.bg, borderRadius: 10, padding: 10, gap: 2, borderWidth: 1, borderColor: T.border },
  detailIcon:      { fontSize: 16 },
  detailLabel:     { fontSize: 8, color: T.muted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  detailVal:       { fontSize: 12, fontWeight: '800', color: T.dark },
  productorCard:   { backgroundColor: T.amberPale, borderRadius: 12, padding: 12, gap: 3, borderWidth: 1, borderColor: T.border },
  productorLabel:  { fontSize: 8, fontWeight: '900', color: T.amberDark, letterSpacing: 1.5 },
  productorName:   { fontSize: 14, fontWeight: '900', color: T.dark },
  productorFinca:  { fontSize: 11, color: T.body },
  expandRow:       { alignItems: 'flex-end', marginTop: 6 },
  expandText:      { fontSize: 11, fontWeight: '700' },
});
