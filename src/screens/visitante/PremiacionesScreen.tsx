import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import CopyrightFooter from '../../components/CopyrightFooter';

const T = {
  bg:          '#0E0806',
  card:        '#1C1008',
  surface:     '#241409',
  dark:        '#2C1A0E',
  text:        '#FFF8E7',
  textSub:     '#D4B886',
  muted:       '#8A6A4A',
  gold:        '#C8960C',
  goldLight:   '#E8B820',
  goldDark:    '#8B6308',
  goldPale:    '#FBF0C8',
  border:      '#3A2010',
  borderGold:  '#6A4A18',
  parchment:   '#F5EDD0',
  amber:       '#D4A520',
};

interface PremioDetalle { lugar: 1|2|3; dinero: string; entregables: string[] }
interface Subcategoria  { id: string; nombre: string; emoji: string; nota?: string; premios: PremioDetalle[] }
interface Categoria     { id: string; nombre: string; emoji: string; color: string; gradient: [string,string,string]; descripcion: string; totalPremio: string; subcategorias: Subcategoria[] }

const CATEGORIAS: Categoria[] = [
  {
    id: 'microlotes', nombre: 'Calidad Microlotes', emoji: '🏆',
    gradient: ['#6B4C00','#C8960C','#E8B820'], color: '#C8960C',
    descripcion: 'Competencia de microlotes de café especial del Tolima. Evaluación sensorial bajo protocolo SCA. Se reconocen los tres primeros lugares por subcategoría.',
    totalPremio: '$30.800.000 COP',
    subcategorias: [
      {
        id: 'varietales', nombre: 'Varietales', emoji: '🌿',
        nota: 'Puntaje mínimo SCA 84+',
        premios: [
          { lugar: 1, dinero: '$3.000.000 COP', entregables: ['Trofeo oficial de la Feria', 'Certificado SCA Q-Grader', 'Publicación Internacional FNC', 'Acceso Rueda de Negocios'] },
          { lugar: 2, dinero: '$1.800.000 COP', entregables: ['Trofeo oficial de la Feria', 'Membresía SCAE 1 año', 'Certificado de Calidad'] },
          { lugar: 3, dinero: '$1.000.000 COP', entregables: ['Trofeo oficial de la Feria', 'Kit Premium de Catación', 'Certificado de Participación'] },
        ],
      },
      {
        id: 'conv', nombre: 'Convencionales', emoji: '☕',
        nota: 'Café convencional certificado',
        premios: [
          { lugar: 1, dinero: '$2.500.000 COP', entregables: ['Trofeo oficial de la Feria', 'Certificado de Excelencia', 'Gira Internacional de Origen'] },
          { lugar: 2, dinero: '$1.500.000 COP', entregables: ['Trofeo oficial de la Feria', 'Kit Profesional de Catación', 'Certificado SCA'] },
          { lugar: 3, dinero: '$800.000 COP', entregables: ['Trofeo oficial de la Feria', 'Insumos Agrícolas Premium', 'Certificado de Participación'] },
        ],
      },
      {
        id: 'honey', nombre: 'Honey', emoji: '🍯',
        nota: 'Proceso honey certificado',
        premios: [
          { lugar: 1, dinero: '$2.800.000 COP', entregables: ['Trofeo oficial de la Feria', 'Certificado SCA', 'Publicación Portal SCA Colombia'] },
          { lugar: 2, dinero: '$1.600.000 COP', entregables: ['Trofeo oficial de la Feria', 'Membresía SCA Colombia', 'Certificado de Calidad'] },
          { lugar: 3, dinero: '$900.000 COP', entregables: ['Trofeo oficial de la Feria', 'Kit Tostión Artesanal', 'Certificado de Participación'] },
        ],
      },
      {
        id: 'natural', nombre: 'Natural', emoji: '🍑',
        nota: 'Proceso natural fermentado',
        premios: [
          { lugar: 1, dinero: '$3.000.000 COP', entregables: ['Trofeo oficial de la Feria', 'Certificado SCA', 'Gira de Origen Europa'] },
          { lugar: 2, dinero: '$1.800.000 COP', entregables: ['Trofeo oficial de la Feria', 'Curso Certificado SCA', 'Certificado de Calidad'] },
          { lugar: 3, dinero: '$1.000.000 COP', entregables: ['Trofeo oficial de la Feria', 'Equipo de Beneficio Café', 'Certificado de Participación'] },
        ],
      },
    ],
  },
  {
    id: 'catacion', nombre: 'Catación', emoji: '☕',
    gradient: ['#0D2B6E','#1565C0','#1E88E5'], color: '#1976D2',
    descripcion: 'Competencia de catadores profesionales dividida en tres categorías por edad y experiencia. Se evalúa técnica, identificación sensorial y descripción de perfil.',
    totalPremio: '$14.900.000 COP',
    subcategorias: [
      {
        id: 'semilla', nombre: 'Semilla', emoji: '🌱',
        nota: 'Categoría 12–18 años',
        premios: [
          { lugar: 1, dinero: '$2.000.000 COP', entregables: ['Trofeo oficial', 'Beca Curso SCA Q-Grader', 'Certificado de Excelencia'] },
          { lugar: 2, dinero: '$1.200.000 COP', entregables: ['Trofeo oficial', 'Curso Certificado de Catación', 'Certificado de Participación'] },
          { lugar: 3, dinero: '$700.000 COP', entregables: ['Trofeo oficial', 'Kit Profesional de Catación', 'Certificado de Participación'] },
        ],
      },
      {
        id: 'chapola', nombre: 'Chapola', emoji: '🌿',
        nota: 'Categoría 19–35 años',
        premios: [
          { lugar: 1, dinero: '$2.500.000 COP', entregables: ['Trofeo oficial', 'Certificación Q-Grader SCA', 'Publicación Portal Café'] },
          { lugar: 2, dinero: '$1.500.000 COP', entregables: ['Trofeo oficial', 'Membresía SCA Colombia', 'Certificado Internacional'] },
          { lugar: 3, dinero: '$800.000 COP', entregables: ['Trofeo oficial', 'Curso Avanzado de Catación', 'Certificado de Participación'] },
        ],
      },
      {
        id: 'mayores', nombre: 'Mayores', emoji: '🏅',
        nota: 'Categoría 36 años en adelante',
        premios: [
          { lugar: 1, dinero: '$3.500.000 COP', entregables: ['Trofeo oficial', 'Gira de Origen Cafetero', 'Q-Grader Renewal SCA', 'Publicación Internacional'] },
          { lugar: 2, dinero: '$2.000.000 COP', entregables: ['Trofeo oficial', 'Membresía SCAE', 'Certificado Internacional SCA'] },
          { lugar: 3, dinero: '$1.200.000 COP', entregables: ['Trofeo oficial', 'Curso Q-Grader SCA', 'Kit Profesional de Catación'] },
        ],
      },
    ],
  },
  {
    id: 'barismo', nombre: 'Barismo', emoji: '☕',
    gradient: ['#212121','#37474F','#546E7A'], color: '#78909C',
    descripcion: 'Competencia nacional de barismo bajo estándares WBC. Se evalúan tres rutinas: espresso, leche texturizada y bebida especial de autor.',
    totalPremio: '$9.500.000 COP',
    subcategorias: [
      {
        id: 'general', nombre: 'Barismo Chaparral 2026', emoji: '🤌',
        nota: 'Formato WBC · 3 rutinas · 15 min',
        premios: [
          { lugar: 1, dinero: '$5.000.000 COP', entregables: ['Trofeo Gran Campeón', 'Máquina Espresso La Marzocco Linea Mini', 'Certificado WBC Colombia', 'Viaje de Representación'] },
          { lugar: 2, dinero: '$3.000.000 COP', entregables: ['Trofeo oficial', 'Molino Profesional de Espresso', 'Membresía WBC', 'Certificado de Excelencia'] },
          { lugar: 3, dinero: '$1.500.000 COP', entregables: ['Trofeo oficial', 'Equipo Café Profesional Completo', 'Curso Avanzado WBC', 'Certificado de Participación'] },
        ],
      },
    ],
  },
];

const LUGAR_LABEL = ['', '1.er LUGAR', '2.do LUGAR', '3.er LUGAR'];
const MEDAL_EMOJI = ['', '🥇', '🥈', '🥉'];
const MEDAL_GRAD: [string,string][] = [
  ['',''],
  ['#A07800','#E8C820'],
  ['#6E6E6E','#C0C0C0'],
  ['#7A3F1E','#C8764A'],
];

export default function PremiacionesScreen() {
  const { t } = useTranslation();
  const nav = useNavigation();
  const [expandedCat, setExpandedCat] = useState<string | null>('microlotes');
  const [expandedSub, setExpandedSub] = useState<string | null>(null);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={T.bg} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <LinearGradient colors={['#000000','#0E0806','#1C1008']} style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerEyebrow}>FERIA INTERNACIONAL DEL CAFÉ · CHAPARRAL</Text>
          <Text style={s.headerTitle}>PREMIACIONES</Text>
        </View>
        <View style={s.trophyRing}>
          <LinearGradient colors={['#8B6308','#E8B820','#8B6308']} style={s.trophyGrad}>
            <Text style={s.trophyEmoji}>🏆</Text>
          </LinearGradient>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* ── Hero ceremony banner (scrolls with content) ─────────────────── */}
        <LinearGradient colors={['#5C3800','#8B6308','#C8960C','#E8C030','#C8960C','#8B6308']} start={{x:0,y:0}} end={{x:1,y:0}} style={s.hero}>
          <View style={s.heroInner}>
            <Text style={s.heroEyebrow}>✦ CEREMONIA OFICIAL ✦</Text>
            <Text style={s.heroTitle}>RECONOCIMIENTO{'\n'}A LA EXCELENCIA</Text>
            <View style={s.heroDivider} />
            <View style={s.heroCeremony}>
              <View style={s.heroCeremonyItem}>
                <Text style={s.heroCeremonyLabel}>FECHA</Text>
                <Text style={s.heroCeremonyVal}>16 AGO 2026</Text>
              </View>
              <View style={s.heroCeremonyDot} />
              <View style={s.heroCeremonyItem}>
                <Text style={s.heroCeremonyLabel}>HORA</Text>
                <Text style={s.heroCeremonyVal}>5:00 PM</Text>
              </View>
              <View style={s.heroCeremonyDot} />
              <View style={s.heroCeremonyItem}>
                <Text style={s.heroCeremonyLabel}>LUGAR</Text>
                <Text style={s.heroCeremonyVal}>Escenario Principal</Text>
              </View>
            </View>
          </View>
        </LinearGradient>


        {/* ── Stats strip ────────────────────────────────────────────────── */}
        <View style={s.statsStrip}>
          {[
            { n: '3', l: 'Categorías' },
            { n: '8', l: 'Subcategorías' },
            { n: '24', l: 'Premiaciones' },
          ].map((st, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={s.statsDot} />}
              <View style={s.statItem}>
                <Text style={s.statNum}>{st.n}</Text>
                <Text style={s.statLbl}>{st.l}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* ── Categories ─────────────────────────────────────────────────── */}
        {CATEGORIAS.map(cat => {
          const isExpCat = expandedCat === cat.id;
          return (
            <View key={cat.id} style={s.catBlock}>
              {/* Category header */}
              <TouchableOpacity
                onPress={() => setExpandedCat(isExpCat ? null : cat.id)}
                activeOpacity={0.88}
              >
                <LinearGradient colors={cat.gradient} start={{x:0,y:0}} end={{x:1,y:1}} style={s.catHeader}>
                  <View style={s.catHeaderLeft}>
                    <View style={s.catEmojiRing}>
                      <Text style={s.catEmoji}>{cat.emoji}</Text>
                    </View>
                    <View>
                      <Text style={s.catName}>{cat.nombre}</Text>
                      <Text style={s.catMeta}>{cat.subcategorias.length} {cat.id === 'barismo' ? 'competencia' : 'subcategorías'} · {cat.totalPremio}</Text>
                    </View>
                  </View>
                  <View style={[s.catChevronWrap, isExpCat && s.catChevronWrapActive]}>
                    <Text style={s.catChevron}>{isExpCat ? '▲' : '▼'}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {isExpCat && (
                <View style={s.catContent}>
                  {/* Description */}
                  <View style={s.catDescBox}>
                    <Text style={s.catDescText}>{cat.descripcion}</Text>
                  </View>

                  {/* Subcategories */}
                  {cat.subcategorias.map(sub => {
                    const subKey = `${cat.id}_${sub.id}`;
                    const isExpSub = expandedSub === subKey;
                    return (
                      <View key={sub.id} style={[s.subBlock, { borderLeftColor: cat.color }]}>
                        {/* Subcategory header */}
                        <TouchableOpacity
                          style={s.subHeader}
                          onPress={() => setExpandedSub(isExpSub ? null : subKey)}
                          activeOpacity={0.85}
                        >
                          <LinearGradient
                            colors={[cat.color + '28', cat.color + '10']}
                            start={{x:0,y:0}} end={{x:1,y:0}}
                            style={StyleSheet.absoluteFill}
                          />
                          <Text style={s.subEmoji}>{sub.emoji}</Text>
                          <View style={{flex:1}}>
                            <Text style={[s.subName, {color: cat.color}]}>{sub.nombre}</Text>
                            {sub.nota && <Text style={s.subNota}>{sub.nota}</Text>}
                          </View>
                          <View style={[s.subPill, {borderColor: cat.color + '60'}]}>
                            <Text style={[s.subPillText, {color: cat.color}]}>
                              {isExpSub ? 'Ocultar ▲' : 'Ver premios ▼'}
                            </Text>
                          </View>
                        </TouchableOpacity>

                        {isExpSub && (
                          <View style={s.premiosWrap}>
                            {sub.premios.map((p) => (
                              <View key={p.lugar} style={[s.premioCard, p.lugar === 1 && s.premioCardGold]}>
                                {p.lugar === 1 && (
                                  <LinearGradient
                                    colors={['#3A2800','#251800']}
                                    style={StyleSheet.absoluteFill}
                                  />
                                )}
                                {/* Medal header */}
                                <LinearGradient colors={MEDAL_GRAD[p.lugar]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.medalBar}>
                                  <Text style={s.medalEmoji}>{MEDAL_EMOJI[p.lugar]}</Text>
                                  <Text style={s.medalLabel}>{LUGAR_LABEL[p.lugar]}</Text>
                                  <View style={s.dineroBadge}>
                                    <Text style={s.dineroText}>{p.dinero}</Text>
                                  </View>
                                </LinearGradient>
                                {/* Entregables */}
                                <View style={s.entregablesWrap}>
                                  <Text style={s.entregablesTitle}>🎁 ENTREGABLES</Text>
                                  {p.entregables.map((e, i) => (
                                    <View key={i} style={s.entregableItem}>
                                      <Text style={[s.entregableDot, {color: p.lugar === 1 ? T.gold : T.muted}]}>◆</Text>
                                      <Text style={s.entregableText}>{e}</Text>
                                    </View>
                                  ))}
                                </View>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        {/* ── Ceremony date footer ──────────────────────────────────────── */}
        <LinearGradient colors={['#1C1008','#2C1A0E']} style={s.dateCard}>
          <View style={s.dateCardInner}>
            <Text style={s.dateCardIcon}>🎖️</Text>
            <View style={{flex:1}}>
              <Text style={s.dateCardTitle}>CEREMONIA DE PREMIACIÓN</Text>
              <Text style={s.dateCardDate}>Sábado 16 de agosto de 2026 · 5:00 PM</Text>
              <Text style={s.dateCardPlace}>Escenario Principal · Feria Internacional del Café · Chaparral, Tolima</Text>
            </View>
          </View>
        </LinearGradient>

        <CopyrightFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: T.bg },
  header:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 20, gap: 12 },
  backBtn:          { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  backIcon:         { fontSize: 26, color: '#FFF', lineHeight: 30, fontWeight: '300' },
  headerEyebrow:    { fontSize: 7, fontWeight: '700', color: T.gold, letterSpacing: 2, marginBottom: 3 },
  headerTitle:      { fontSize: 22, fontWeight: '900', color: T.text, letterSpacing: 3 },
  trophyRing:       { width: 52, height: 52, borderRadius: 26, overflow: 'hidden', borderWidth: 2, borderColor: T.gold + '60' },
  trophyGrad:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  trophyEmoji:      { fontSize: 26 },

  hero:             { paddingVertical: 28, paddingHorizontal: 20, alignItems: 'center' },
  heroInner:        { alignItems: 'center', gap: 8 },
  heroEyebrow:      { fontSize: 9, fontWeight: '900', color: '#2C1A0E', letterSpacing: 3 },
  heroTitle:        { fontSize: 26, fontWeight: '900', color: '#1A0800', textAlign: 'center', lineHeight: 30, letterSpacing: 1 },
  heroDivider:      { width: 80, height: 2, backgroundColor: '#2C1A0E', opacity: 0.4, marginVertical: 6 },
  heroCeremony:     { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 4 },
  heroCeremonyItem: { alignItems: 'center' },
  heroCeremonyLabel:{ fontSize: 7, fontWeight: '900', color: '#4A2800', letterSpacing: 2 },
  heroCeremonyVal:  { fontSize: 13, fontWeight: '900', color: '#1A0800' },
  heroCeremonyDot:  { width: 4, height: 4, borderRadius: 2, backgroundColor: '#2C1A0E', opacity: 0.5 },

  scroll:           { padding: 14 },
  statsStrip:       { flexDirection: 'row', backgroundColor: T.card, borderRadius: 16, padding: 18, marginBottom: 16, alignItems: 'center', justifyContent: 'center', gap: 0, borderWidth: 1, borderColor: T.borderGold },
  statsDot:         { width: 1, height: 36, backgroundColor: T.borderGold, marginHorizontal: 20 },
  statItem:         { alignItems: 'center', gap: 2 },
  statNum:          { fontSize: 30, fontWeight: '900', color: T.gold },
  statLbl:          { fontSize: 9, color: T.muted, letterSpacing: 1, textTransform: 'uppercase' },

  catBlock:         { marginBottom: 12, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: T.borderGold },
  catHeader:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16, justifyContent: 'space-between' },
  catHeaderLeft:    { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  catEmojiRing:     { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)' },
  catEmoji:         { fontSize: 26 },
  catName:          { fontSize: 18, fontWeight: '900', color: '#FFF', letterSpacing: 0.5, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width:0,height:1}, textShadowRadius: 4 },
  catMeta:          { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  catChevronWrap:   { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  catChevronWrapActive:{ backgroundColor: 'rgba(255,255,255,0.2)' },
  catChevron:       { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '900' },
  catContent:       { backgroundColor: T.card, borderTopWidth: 1, borderTopColor: T.border, padding: 14, gap: 10 },
  catDescBox:       { backgroundColor: T.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: T.border, marginBottom: 4 },
  catDescText:      { fontSize: 12, color: T.textSub, lineHeight: 20, fontStyle: 'italic' },

  subBlock:         { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: T.border, borderLeftWidth: 3 },
  subHeader:        { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10, overflow: 'hidden' },
  subEmoji:         { fontSize: 20, flexShrink: 0 },
  subName:          { fontSize: 15, fontWeight: '900', letterSpacing: 0.3 },
  subNota:          { fontSize: 9, color: T.muted, marginTop: 2, letterSpacing: 0.5 },
  subPill:          { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, flexShrink: 0 },
  subPillText:      { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  premiosWrap:      { padding: 12, gap: 10, backgroundColor: T.bg },
  premioCard:       { borderRadius: 14, overflow: 'hidden', borderWidth: 1.5, borderColor: T.border },
  premioCardGold:   { borderColor: T.goldDark },
  medalBar:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, gap: 10 },
  medalEmoji:       { fontSize: 26, flexShrink: 0 },
  medalLabel:       { flex: 1, fontSize: 11, fontWeight: '900', color: '#FFF', letterSpacing: 2, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width:0,height:1}, textShadowRadius: 3 },
  dineroBadge:      { backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  dineroText:       { fontSize: 13, fontWeight: '900', color: '#FFF' },
  entregablesWrap:  { padding: 14, gap: 6, backgroundColor: T.surface },
  entregablesTitle: { fontSize: 8, fontWeight: '900', color: T.gold, letterSpacing: 2, marginBottom: 4 },
  entregableItem:   { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  entregableDot:    { fontSize: 7, marginTop: 5, flexShrink: 0 },
  entregableText:   { fontSize: 12, color: T.textSub, flex: 1, lineHeight: 18 },

  dateCard:         { borderRadius: 18, overflow: 'hidden', marginTop: 6, borderWidth: 1, borderColor: T.borderGold },
  dateCardInner:    { flexDirection: 'row', gap: 14, padding: 18, alignItems: 'center' },
  dateCardIcon:     { fontSize: 36, flexShrink: 0 },
  dateCardTitle:    { fontSize: 10, fontWeight: '900', color: T.gold, letterSpacing: 2, marginBottom: 4 },
  dateCardDate:     { fontSize: 15, fontWeight: '900', color: T.text, lineHeight: 20 },
  dateCardPlace:    { fontSize: 10, color: T.muted, marginTop: 3, lineHeight: 15 },
} as any);
