import CopyrightFooter from '../../components/CopyrightFooter';
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const T = {
  bg:          '#0A0604',
  card:        '#160C06',
  surface:     '#1E1008',
  dark:        '#2C1A0E',
  text:        '#FFF8E7',
  textSub:     '#D4B886',
  muted:       '#8A6A4A',
  gold:        '#C8960C',
  goldLight:   '#E8B820',
  goldDark:    '#8B6308',
  border:      '#2E1A0A',
  borderGold:  '#5A3A10',
  parchment:   '#F5EDD0',
  amber:       '#D4A520',
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
    id: 's1', categoria: 'jovenes', dia: 'Jue 14 Ago', hora: '10:00 AM',
    lugar: 'Salón Principal – Mesa A', cafeName: 'Café Futuro',
    origen: 'Chaparral, Tolima', altitud: '1.850 m.s.n.m.', proceso: 'Lavado',
    variedad: 'Castillo', notas: ['Fruta roja', 'Caramelo', 'Cítrico brillante'],
    scaScore: 86.5, productor: 'Jóvenes Caficultores del Sur', finca: 'El Porvenir',
    descripcion: 'Café producido por jóvenes caficultores menores de 30 años como parte del programa de relevo generacional en el sur del Tolima.',
    color: '#F57F17', emoji: '🌱',
  },
  {
    id: 's2', categoria: 'jovenes', dia: 'Vie 15 Ago', hora: '02:00 PM',
    lugar: 'Salón Principal – Mesa B', cafeName: 'Generación Verde',
    origen: 'Rioblanco, Tolima', altitud: '1.700 m.s.n.m.', proceso: 'Honey',
    variedad: 'Geisha', notas: ['Durazno', 'Miel', 'Té blanco'],
    scaScore: 88.0, productor: 'Asociación Juventud Cafetera', finca: 'La Esperanza',
    descripcion: 'Lote especial proceso honey desarrollado por jóvenes de la asociación AJUCA, ganadores del programa de innovación cafetera 2025.',
    color: '#F57F17', emoji: '🌱',
  },
  {
    id: 's3', categoria: 'paz', dia: 'Jue 14 Ago', hora: '03:00 PM',
    lugar: 'Carpa Exterior – Mesa Paz', cafeName: 'Semillas de Paz',
    origen: 'Planadas, Tolima', altitud: '1.920 m.s.n.m.', proceso: 'Natural',
    variedad: 'Caturra', notas: ['Ciruela', 'Fermentado tropical', 'Panela'],
    scaScore: 87.25, productor: 'ASOCAFPAZ', finca: 'Nueva Vida',
    descripcion: 'Café cultivado por familias en proceso de reintegración. Símbolo de transformación social y apuesta por la paz territorial en el Tolima.',
    color: '#2E7D32', emoji: '☮️',
  },
  {
    id: 's4', categoria: 'paz', dia: 'Sáb 16 Ago', hora: '11:00 AM',
    lugar: 'Carpa Exterior – Mesa Paz', cafeName: 'Tierra en Paz',
    origen: 'Ataco, Tolima', altitud: '1.650 m.s.n.m.', proceso: 'Lavado',
    variedad: 'Colombia', notas: ['Naranja', 'Almendra', 'Chocolate amargo'],
    scaScore: 85.75, productor: 'Fundación Café por la Paz', finca: 'El Reencuentro',
    descripcion: 'Reconversión productiva en zonas de post-conflicto del sur del Tolima. Cada taza apoya a 45 familias campesinas.',
    color: '#2E7D32', emoji: '☮️',
  },
  {
    id: 's5', categoria: 'mujer', dia: 'Vie 15 Ago', hora: '09:00 AM',
    lugar: 'Pabellón Mujer Cafetera', cafeName: 'Manos de Mujer',
    origen: 'San Antonio, Tolima', altitud: '1.780 m.s.n.m.', proceso: 'Lavado',
    variedad: 'Castillo', notas: ['Chocolate negro', 'Panela', 'Flor de azahar'],
    scaScore: 86.0, productor: 'ASOMUJER Tolima', finca: 'Las Flores',
    descripcion: 'Lote 100% producido, beneficiado y tostado por mujeres caficultoras. Representan el 42% de la fuerza laboral cafetera departamental.',
    color: '#AD1457', emoji: '👩‍🌾',
  },
  {
    id: 's6', categoria: 'mujer', dia: 'Sáb 16 Ago', hora: '04:00 PM',
    lugar: 'Pabellón Mujer Cafetera', cafeName: 'Rosa de Altura',
    origen: 'Chaparral, Tolima', altitud: '2.050 m.s.n.m.', proceso: 'Honey',
    variedad: 'Tabi', notas: ['Rosa', 'Fresa', 'Maracuyá'],
    scaScore: 89.5, productor: 'Colectivo Mujeres de Altura', finca: 'La Cumbre',
    descripcion: 'Variedad Tabi cultivada a más de 2.000 metros. Administrada por lideresa cafetera del sur del Tolima.',
    color: '#AD1457', emoji: '👩‍🌾',
  },
  {
    id: 's7', categoria: 'certificados', dia: 'Jue 14 Ago', hora: '01:00 PM',
    lugar: 'Sala Certificaciones', cafeName: 'Rainforest Gold',
    origen: 'Roncesvalles, Tolima', altitud: '2.100 m.s.n.m.', proceso: 'Lavado',
    variedad: 'Geisha', notas: ['Macadamia', 'Caramelo', 'Bergamota'],
    scaScore: 90.25, productor: 'Finca Certificada El Vergel', finca: 'El Vergel',
    descripcion: 'Café con certificación Rainforest Alliance y UTZ. Cumple los más altos estándares de sostenibilidad ambiental.',
    color: '#1565C0', emoji: '🏅',
  },
  {
    id: 's8', categoria: 'certificados', dia: 'Sáb 16 Ago', hora: '09:00 AM',
    lugar: 'Sala Certificaciones', cafeName: 'Organic Reserve',
    origen: 'Herveo, Tolima', altitud: '1.900 m.s.n.m.', proceso: 'Natural',
    variedad: 'Bourbon', notas: ['Ciruela pasa', 'Vainilla', 'Cacao'],
    scaScore: 88.75, productor: 'Bio-Café Herveo', finca: 'La Reserva Orgánica',
    descripcion: 'Único lote de café orgánico certificado USDA del Tolima. Cero pesticidas y fertilizantes desde hace 8 años.',
    color: '#1565C0', emoji: '🏅',
  },
  {
    id: 's9', categoria: 'regional', dia: 'Vie 15 Ago', hora: '05:00 PM',
    lugar: 'Gran Salón Regional', cafeName: 'Terroir Tolima',
    origen: 'Municipios del Tolima', altitud: '1.600 – 2.100 m.s.n.m.', proceso: 'Mixto',
    variedad: 'Múltiples variedades', notas: ['Tropical', 'Dulce', 'Complejo'],
    scaScore: 87.0, productor: 'Consorcio Cafetero Tolimense', finca: 'Diversas fincas',
    descripcion: 'Blend de los 38 municipios cafeteros del Tolima. Una experiencia que captura toda la riqueza del departamento.',
    color: '#4527A0', emoji: '🗺️',
  },
  {
    id: 's10', categoria: 'regional', dia: 'Sáb 16 Ago', hora: '02:00 PM',
    lugar: 'Gran Salón Regional', cafeName: 'Sur del Tolima Reserve',
    origen: 'Chaparral – Ataco – Planadas', altitud: '1.700 – 2.200 m.s.n.m.', proceso: 'Lavado',
    variedad: 'Castillo + Caturra', notas: ['Cítrico', 'Melaza', 'Nuez'],
    scaScore: 88.25, productor: 'Cooperativa Sur Cafetero', finca: 'Blend Regional',
    descripcion: 'Microlote colaborativo del sur del Tolima. Refleja el potencial del corredor cafetero del río Saldaña.',
    color: '#4527A0', emoji: '🗺️',
  },
];

const CAT_CONFIG: Record<CatKey, { label: string; emoji: string; color: string; gradient: [string,string,string] }> = {
  todas:        { label: 'Todas',        emoji: '☕', color: '#C8960C',  gradient: ['#4A2800','#7B4A18','#C8960C'] },
  jovenes:      { label: 'Jóvenes',      emoji: '🌱', color: '#F57F17',  gradient: ['#4A2500','#C04A00','#F57F17'] },
  paz:          { label: 'Paz',          emoji: '☮️', color: '#43A047',  gradient: ['#1B3A20','#2E7D32','#43A047'] },
  mujer:        { label: 'Mujer',        emoji: '👩‍🌾',color: '#E91E8C',  gradient: ['#4A0030','#880E4F','#E91E8C'] },
  certificados: { label: 'Certificados', emoji: '🏅', color: '#1E88E5',  gradient: ['#0A1F4A','#0D47A1','#1E88E5'] },
  regional:     { label: 'Regional',     emoji: '🗺️', color: '#7C4DFF',  gradient: ['#1A0050','#311B92','#7C4DFF'] },
};

const CATS = Object.entries(CAT_CONFIG) as [CatKey, typeof CAT_CONFIG[CatKey]][];

export default function CatacionScreen() {
  const { t } = useTranslation();
  const nav = useNavigation();
  const [cat, setCat] = useState<CatKey>('todas');
  const [expanded, setExpanded] = useState<string | null>(null);

  const list = cat === 'todas' ? SESIONES : SESIONES.filter(s => s.categoria === cat);
  const cfg  = CAT_CONFIG[cat];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={T.bg} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <LinearGradient colors={['#000000','#0A0604','#160C06']} style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={{flex:1}}>
          <Text style={s.headerEyebrow}>FERIA INTERNACIONAL DEL CAFÉ · CHAPARRAL 2026</Text>
          <Text style={s.headerTitle}>CATACIÓN</Text>
          <Text style={s.headerSub}>Perfiles sensoriales de élite</Text>
        </View>
        <View style={s.headerBadge}>
          <LinearGradient colors={['#8B6308','#C8960C']} style={s.headerBadgeGrad}>
            <Text style={s.headerBadgeNum}>{SESIONES.length}</Text>
            <Text style={s.headerBadgeLbl}>SESIONES</Text>
          </LinearGradient>
        </View>
      </LinearGradient>

      {/* ── Hero strip ─────────────────────────────────────────────────────── */}
      <LinearGradient colors={['#3A2000','#6B4C00','#C8960C']} start={{x:0,y:0}} end={{x:1,y:0}} style={s.heroStrip}>
        <Text style={s.heroStripText}>✦ CATACIÓN PERMANENTE · 14, 15 y 16 de Agosto 2026 ✦</Text>
      </LinearGradient>

      {/* ── Category tabs ──────────────────────────────────────────────────── */}
      <View style={s.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabsScroll}>
          {CATS.map(([key, c]) => {
            const active = cat === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setCat(key)}
                activeOpacity={0.82}
                style={s.tabTouch}
              >
                {active ? (
                  <LinearGradient colors={c.gradient} style={s.tabActive}>
                    <Text style={s.tabEmoji}>{c.emoji}</Text>
                    <Text style={s.tabLabelActive}>{c.label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={s.tabInactive}>
                    <Text style={s.tabEmoji}>{c.emoji}</Text>
                    <Text style={s.tabLabel}>{c.label}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Session list ───────────────────────────────────────────────────── */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Results info */}
        <View style={s.resultsRow}>
          <View style={[s.resultsAccent, {backgroundColor: cfg.color}]} />
          <Text style={s.resultsLabel}>
            <Text style={{color: cfg.color, fontWeight: '900'}}>{list.length}</Text>
            {' sesiones · '}{cfg.label}
          </Text>
        </View>

        {list.map(ses => {
          const sesConfig = CAT_CONFIG[ses.categoria];
          const isExp = expanded === ses.id;
          const scoreColor = ses.scaScore >= 90 ? '#E8B820' : ses.scaScore >= 87 ? sesConfig.color : T.muted;
          return (
            <TouchableOpacity
              key={ses.id}
              onPress={() => setExpanded(isExp ? null : ses.id)}
              activeOpacity={0.88}
              style={s.sesCard}
            >
              {/* Category gradient band */}
              <LinearGradient colors={sesConfig.gradient} start={{x:0,y:0}} end={{x:1,y:0}} style={s.sesBand}>
                <Text style={s.sesBandEmoji}>{sesConfig.emoji}</Text>
                <Text style={s.sesBandLabel}>{sesConfig.label.toUpperCase()}</Text>
                <View style={s.sesBandTime}>
                  <Text style={s.sesBandDay}>{ses.dia}</Text>
                  <Text style={s.sesBandHour}>{ses.hora}</Text>
                </View>
              </LinearGradient>

              {/* Card body */}
              <View style={s.sesBody}>
                {/* Top: name + SCA */}
                <View style={s.sesTopRow}>
                  <View style={{flex:1}}>
                    <Text style={s.sesCafeName}>{ses.cafeName}</Text>
                    <Text style={s.sesOrigin}>📍 {ses.origen}</Text>
                  </View>
                  <View style={[s.scaBox, {borderColor: scoreColor}]}>
                    <Text style={s.scaLabel}>SCA</Text>
                    <Text style={[s.scaScore, {color: scoreColor}]}>{ses.scaScore}</Text>
                  </View>
                </View>

                {/* Flavor notes */}
                <View style={s.notasRow}>
                  {ses.notas.map((nota, i) => (
                    <LinearGradient
                      key={i}
                      colors={[sesConfig.color + '30', sesConfig.color + '18']}
                      style={[s.notaChip, {borderColor: sesConfig.color + '50'}]}
                    >
                      <Text style={[s.notaDot, {color: sesConfig.color}]}>◆</Text>
                      <Text style={[s.notaText, {color: sesConfig.color}]}>{nota}</Text>
                    </LinearGradient>
                  ))}
                </View>

                {/* Expanded detail */}
                {isExp && (
                  <View style={s.sesDetail}>
                    <View style={[s.detailDivider, {backgroundColor: sesConfig.color + '30'}]} />

                    <Text style={s.sesDesc}>{ses.descripcion}</Text>

                    <View style={s.detailGrid}>
                      {[
                        {icon:'🌿', label:'Variedad', val: ses.variedad},
                        {icon:'⚗️', label:'Proceso',  val: ses.proceso},
                        {icon:'🏔️', label:'Altitud',  val: ses.altitud},
                        {icon:'📋', label:'Lugar',    val: ses.lugar},
                      ].map((d,i) => (
                        <View key={i} style={[s.detailItem, {borderTopColor: sesConfig.color + '40', borderTopWidth: 2}]}>
                          <Text style={s.detailIcon}>{d.icon}</Text>
                          <Text style={s.detailLabel}>{d.label}</Text>
                          <Text style={s.detailVal} numberOfLines={2}>{d.val}</Text>
                        </View>
                      ))}
                    </View>

                    <LinearGradient
                      colors={[sesConfig.color + '20', sesConfig.color + '08']}
                      style={[s.productorCard, {borderColor: sesConfig.color + '40'}]}
                    >
                      <Text style={[s.productorLabel, {color: sesConfig.color}]}>👨‍🌾 PRODUCTOR</Text>
                      <Text style={s.productorName}>{ses.productor}</Text>
                      <Text style={s.productorFinca}>🏡 {ses.finca}</Text>
                    </LinearGradient>
                  </View>
                )}

                {/* Expand button */}
                <TouchableOpacity
                  style={[s.expandBtn, {borderColor: sesConfig.color + '50'}]}
                  onPress={() => setExpanded(isExp ? null : ses.id)}
                >
                  <Text style={[s.expandText, {color: sesConfig.color}]}>
                    {isExp ? 'Ocultar ▲' : 'Ver perfil completo ▼'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
        <CopyrightFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: T.bg },
  header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 18, gap: 12 },
  backBtn:         { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  backIcon:        { fontSize: 26, color: '#FFF', lineHeight: 30, fontWeight: '300' },
  headerEyebrow:   { fontSize: 6.5, fontWeight: '700', color: T.gold, letterSpacing: 1.5, marginBottom: 2 },
  headerTitle:     { fontSize: 24, fontWeight: '900', color: T.text, letterSpacing: 3 },
  headerSub:       { fontSize: 9, color: T.muted, marginTop: 2, letterSpacing: 1 },
  headerBadge:     { flexShrink: 0 },
  headerBadgeGrad: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', minWidth: 60 },
  headerBadgeNum:  { fontSize: 22, fontWeight: '900', color: '#FFF' },
  headerBadgeLbl:  { fontSize: 7, color: 'rgba(255,255,255,0.8)', fontWeight: '900', letterSpacing: 1 },
  heroStrip:       { paddingVertical: 10, alignItems: 'center' },
  heroStripText:   { fontSize: 9, fontWeight: '900', color: '#1A0800', letterSpacing: 2 },
  tabsWrap:        { backgroundColor: T.card, borderBottomWidth: 1, borderBottomColor: T.border },
  tabsScroll:      { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  tabTouch:        { overflow: 'hidden', borderRadius: 22 },
  tabActive:       { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 8 },
  tabInactive:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: T.surface, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: T.border },
  tabEmoji:        { fontSize: 14 },
  tabLabel:        { fontSize: 11, fontWeight: '700', color: T.muted },
  tabLabelActive:  { fontSize: 11, fontWeight: '900', color: '#FFF' },
  scroll:          { padding: 14 },
  resultsRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  resultsAccent:   { width: 4, height: 18, borderRadius: 2 },
  resultsLabel:    { fontSize: 11, color: T.muted, letterSpacing: 0.5 },
  sesCard:         { backgroundColor: T.card, borderRadius: 18, marginBottom: 14, overflow: 'hidden', borderWidth: 1, borderColor: T.border },
  sesBand:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  sesBandEmoji:    { fontSize: 16 },
  sesBandLabel:    { flex: 1, fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.92)', letterSpacing: 2 },
  sesBandTime:     { alignItems: 'flex-end' },
  sesBandDay:      { fontSize: 8, color: 'rgba(255,255,255,0.6)', fontWeight: '700' },
  sesBandHour:     { fontSize: 14, fontWeight: '900', color: '#FFF' },
  sesBody:         { padding: 16 },
  sesTopRow:       { flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'flex-start' },
  sesCafeName:     { fontSize: 18, fontWeight: '900', color: T.text, marginBottom: 4, lineHeight: 22 },
  sesOrigin:       { fontSize: 11, color: T.muted },
  scaBox:          { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center', flexShrink: 0, backgroundColor: T.surface },
  scaLabel:        { fontSize: 7, fontWeight: '900', color: T.muted, letterSpacing: 2 },
  scaScore:        { fontSize: 20, fontWeight: '900' },
  notasRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  notaChip:        { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1 },
  notaDot:         { fontSize: 7 },
  notaText:        { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  sesDetail:       { marginTop: 8 },
  detailDivider:   { height: 1, marginBottom: 12 },
  sesDesc:         { fontSize: 13, color: T.textSub, lineHeight: 20, marginBottom: 14 },
  detailGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  detailItem:      { width: '47%', backgroundColor: T.surface, borderRadius: 12, padding: 10, gap: 3 },
  detailIcon:      { fontSize: 16 },
  detailLabel:     { fontSize: 7.5, color: T.muted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  detailVal:       { fontSize: 11, fontWeight: '800', color: T.text },
  productorCard:   { borderRadius: 14, padding: 14, gap: 4, borderWidth: 1 },
  productorLabel:  { fontSize: 8, fontWeight: '900', letterSpacing: 2, marginBottom: 2 },
  productorName:   { fontSize: 14, fontWeight: '900', color: T.text },
  productorFinca:  { fontSize: 11, color: T.muted },
  expandBtn:       { borderWidth: 1, borderRadius: 20, alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 7, marginTop: 14 },
  expandText:      { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
} as any);
