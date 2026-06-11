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
  amberDark: '#8B6308', border: '#EDD9A8', gold: '#B8860B',
};

interface PodiumEntry { lugar: number; nombre: string; finca?: string; municipio?: string; puntaje?: number; premio: string; entregables: string }
interface Subcategoria { id: string; nombre: string; emoji: string; podium: PodiumEntry[] }
interface Categoria { id: string; nombre: string; emoji: string; gradient: [string, string]; color: string; descripcion: string; subcategorias: Subcategoria[] }

const CATEGORIAS: Categoria[] = [
  {
    id: 'microlotes', nombre: 'Calidad Microlotes', emoji: '🏆',
    gradient: ['#8B6308', '#C8960C'], color: '#B8860B',
    descripcion: 'Competencia de microlotes de café especial. Premio a los tres primeros lugares en dinero y entregables por cada subcategoría.',
    subcategorias: [
      {
        id: 'mic_varietales', nombre: 'Varietales', emoji: '🌿',
        podium: [
          { lugar: 1, nombre: 'Carlos Andrés Mesa', finca: 'El Paraíso', municipio: 'Chaparral', puntaje: 91.25, premio: '$3.000.000 COP', entregables: 'Trofeo + Certificado SCA + Publicación Internacional' },
          { lugar: 2, nombre: 'María F. Rodríguez', finca: 'La Primavera', municipio: 'Roncesvalles', puntaje: 89.75, premio: '$1.800.000 COP', entregables: 'Trofeo + Certificado + Membresía SCAE' },
          { lugar: 3, nombre: 'Javier E. Muñoz', finca: 'El Recuerdo', municipio: 'Rioblanco', puntaje: 88.50, premio: '$1.000.000 COP', entregables: 'Trofeo + Certificado + Kit Premium' },
        ],
      },
      {
        id: 'mic_conv', nombre: 'Convencionales', emoji: '☕',
        podium: [
          { lugar: 1, nombre: 'Ana Lucía Pérez', finca: 'Las Acacias', municipio: 'Ataco', puntaje: 88.00, premio: '$2.500.000 COP', entregables: 'Trofeo + Certificado + Gira Internacional' },
          { lugar: 2, nombre: 'Pedro Ruiz Castro', finca: 'El Mirador', municipio: 'Chaparral', puntaje: 86.75, premio: '$1.500.000 COP', entregables: 'Trofeo + Certificado + Kit Catación' },
          { lugar: 3, nombre: 'Sandra M. Torres', finca: 'La Montaña', municipio: 'Planadas', puntaje: 85.50, premio: '$800.000 COP', entregables: 'Trofeo + Certificado + Insumos Agrícolas' },
        ],
      },
      {
        id: 'mic_honey', nombre: 'Honey', emoji: '🍯',
        podium: [
          { lugar: 1, nombre: 'Luis Ernesto Vargas', finca: 'El Edén', municipio: 'San Antonio', puntaje: 90.50, premio: '$2.800.000 COP', entregables: 'Trofeo + Certificado + Publicación SCA' },
          { lugar: 2, nombre: 'Claudia P. Sánchez', finca: 'Los Cedros', municipio: 'Chaparral', puntaje: 88.25, premio: '$1.600.000 COP', entregables: 'Trofeo + Certificado + Membresía' },
          { lugar: 3, nombre: 'Héctor M. Díaz', finca: 'La Cascada', municipio: 'Rioblanco', puntaje: 86.75, premio: '$900.000 COP', entregables: 'Trofeo + Certificado + Kit Tostión' },
        ],
      },
      {
        id: 'mic_natural', nombre: 'Natural', emoji: '🍑',
        podium: [
          { lugar: 1, nombre: 'Rosa Elena Giraldo', finca: 'El Porvenir', municipio: 'Herveo', puntaje: 92.00, premio: '$3.000.000 COP', entregables: 'Trofeo + Certificado + Gira Europa' },
          { lugar: 2, nombre: 'Fabio A. Moreno', finca: 'Agua Bonita', municipio: 'Roncesvalles', puntaje: 89.50, premio: '$1.800.000 COP', entregables: 'Trofeo + Certificado + Curso SCA' },
          { lugar: 3, nombre: 'Patricia Lozano', finca: 'El Descanso', municipio: 'Planadas', puntaje: 87.75, premio: '$1.000.000 COP', entregables: 'Trofeo + Certificado + Equipo Beneficio' },
        ],
      },
    ],
  },
  {
    id: 'catacion_comp', nombre: 'Catación', emoji: '☕',
    gradient: ['#1565C0', '#1976D2'], color: '#1565C0',
    descripcion: 'Competencia de catadores profesionales en tres categorías por edad y experiencia. Premio a los tres primeros lugares.',
    subcategorias: [
      {
        id: 'cat_semilla', nombre: 'Semilla', emoji: '🌱',
        podium: [
          { lugar: 1, nombre: 'Valentina Ospina', municipio: 'Ibagué', premio: '$2.000.000 COP', entregables: 'Trofeo + Beca Curso SCA Q-Grader + Certificado' },
          { lugar: 2, nombre: 'Samuel Ríos', municipio: 'Chaparral', premio: '$1.200.000 COP', entregables: 'Trofeo + Curso Catación + Certificado' },
          { lugar: 3, nombre: 'Isabela Cano', municipio: 'Honda', premio: '$700.000 COP', entregables: 'Trofeo + Kit Catación + Certificado' },
        ],
      },
      {
        id: 'cat_chapola', nombre: 'Chapola', emoji: '🌿',
        podium: [
          { lugar: 1, nombre: 'Andrés Herrera', municipio: 'Espinal', premio: '$2.500.000 COP', entregables: 'Trofeo + Q-Grader Certificación + Publicación' },
          { lugar: 2, nombre: 'Camila Suárez', municipio: 'Mariquita', premio: '$1.500.000 COP', entregables: 'Trofeo + Membresía SCA + Certificado' },
          { lugar: 3, nombre: 'Felipe Morales', municipio: 'Chaparral', premio: '$800.000 COP', entregables: 'Trofeo + Curso Avanzado + Certificado' },
        ],
      },
      {
        id: 'cat_mayores', nombre: 'Mayores', emoji: '🏅',
        podium: [
          { lugar: 1, nombre: 'Eduardo Monsalve', municipio: 'Bogotá', premio: '$3.500.000 COP', entregables: 'Trofeo + Gira Origen + Q-Grader Renewal + Publicación' },
          { lugar: 2, nombre: 'Marcela Quintero', municipio: 'Medellín', premio: '$2.000.000 COP', entregables: 'Trofeo + Membresía SCAE + Certificado Internacional' },
          { lugar: 3, nombre: 'Rodrigo Acosta', municipio: 'Ibagué', premio: '$1.200.000 COP', entregables: 'Trofeo + Curso Q-Grader + Kit Profesional' },
        ],
      },
    ],
  },
  {
    id: 'barismo', nombre: 'Barismo', emoji: '☕',
    gradient: ['#37474F', '#546E7A'], color: '#37474F',
    descripcion: 'Competencia de barismo profesional. Premio único a los tres primeros lugares en dinero y entregables.',
    subcategorias: [
      {
        id: 'bar_general', nombre: 'Barismo Chaparral 2026', emoji: '☕',
        podium: [
          { lugar: 1, nombre: 'Daniel Gutiérrez', municipio: 'Cali', premio: '$5.000.000 COP', entregables: 'Trofeo + Máquina Espresso La Marzocco + Certificado + Viaje Colombia' },
          { lugar: 2, nombre: 'Juliana Castro', municipio: 'Bogotá', premio: '$3.000.000 COP', entregables: 'Trofeo + Molino Profesional + Certificado + Membresía WBC' },
          { lugar: 3, nombre: 'Nicolás Peña', municipio: 'Medellín', premio: '$1.500.000 COP', entregables: 'Trofeo + Equipo Café Profesional + Certificado + Curso Avanzado' },
        ],
      },
    ],
  },
];

const MEDAL = ['🥇', '🥈', '🥉'];
const MEDAL_COLORS = ['#B8860B', '#9E9E9E', '#A0522D'];

export default function PremiacionesScreen() {
  const { t } = useTranslation();
  const nav = useNavigation();
  const [expandedCat, setExpandedCat] = useState<string | null>('microlotes');
  const [expandedSub, setExpandedSub] = useState<string | null>(null);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#2C1A0E" />

      {/* Header */}
      <LinearGradient colors={['#2C1A0E', '#5C3520', '#8B4A22']} style={s.headerGrad}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>{t('premiaciones.title', 'PREMIACIONES')}</Text>
          <Text style={s.headerSub}>{t('premiaciones.subtitle', 'Feria Internacional del Café · Chaparral 2026')}</Text>
        </View>
        <View style={s.trophyWrap}>
          <Text style={s.trophyEmoji}>🏆</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <LinearGradient colors={['#8B6308', '#C8960C', '#E8B820']} style={s.hero}>
          <Text style={s.heroTitle}>{t('premiaciones.hero_title', '✦ RECONOCIMIENTO A LA EXCELENCIA ✦')}</Text>
          <Text style={s.heroSub}>{t('premiaciones.hero_sub', '3 categorías · 10 subcategorías · Premios en dinero y entregables')}</Text>
        </LinearGradient>

        {CATEGORIAS.map(cat => {
          const isExpCat = expandedCat === cat.id;
          return (
            <View key={cat.id} style={s.catBlock}>
              {/* Category header */}
              <TouchableOpacity
                style={s.catHeader}
                onPress={() => setExpandedCat(isExpCat ? null : cat.id)}
                activeOpacity={0.85}
              >
                <LinearGradient colors={cat.gradient} style={s.catHeaderGrad}>
                  <Text style={s.catEmoji}>{cat.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.catName}>{cat.nombre}</Text>
                    <Text style={s.catSub}>{cat.subcategorias.length} {cat.id === 'barismo' ? 'competencia' : 'subcategorías'}</Text>
                  </View>
                  <Text style={[s.catChevron, isExpCat && s.catChevronUp]}>›</Text>
                </LinearGradient>
              </TouchableOpacity>

              {isExpCat && (
                <View style={s.catContent}>
                  <Text style={s.catDesc}>{cat.descripcion}</Text>

                  {cat.subcategorias.map(sub => {
                    const subKey = cat.id + '_' + sub.id;
                    const isExpSub = expandedSub === subKey;
                    return (
                      <View key={sub.id} style={[s.subBlock, { borderLeftColor: cat.color }]}>
                        <TouchableOpacity
                          style={s.subHeader}
                          onPress={() => setExpandedSub(isExpSub ? null : subKey)}
                          activeOpacity={0.85}
                        >
                          <Text style={s.subEmoji}>{sub.emoji}</Text>
                          <Text style={[s.subName, { color: cat.color }]}>{sub.nombre}</Text>
                          <Text style={s.subChevron}>{isExpSub ? '↑' : '↓'}</Text>
                        </TouchableOpacity>

                        {isExpSub && (
                          <View style={s.podium}>
                            {sub.podium.map((entry, idx) => (
                              <View key={entry.lugar} style={[s.podiumCard, idx === 0 && s.podiumCardGold]}>
                                {idx === 0 && (
                                  <LinearGradient colors={['#FBF0C8', '#FFF8E0']} style={StyleSheet.absoluteFill} />
                                )}
                                <View style={s.podiumTop}>
                                  <Text style={s.podiumMedal}>{MEDAL[idx]}</Text>
                                  <View style={{ flex: 1 }}>
                                    <Text style={s.podiumLugar}>
                                      {idx === 0 ? t('premiaciones.first', '1er Lugar') : idx === 1 ? t('premiaciones.second', '2do Lugar') : t('premiaciones.third', '3er Lugar')}
                                    </Text>
                                    <Text style={s.podiumNombre}>{entry.nombre}</Text>
                                    {entry.finca && <Text style={s.podiumFinca}>🏡 {entry.finca}</Text>}
                                    {entry.municipio && <Text style={s.podiumMun}>📍 {entry.municipio}{entry.puntaje ? ` · SCA ${entry.puntaje}` : ''}</Text>}
                                  </View>
                                  <View style={[s.premioTag, { borderColor: MEDAL_COLORS[idx] }]}>
                                    <Text style={[s.premioAmount, { color: MEDAL_COLORS[idx] }]}>{entry.premio}</Text>
                                  </View>
                                </View>
                                <View style={s.entregablesRow}>
                                  <Text style={s.entregablesLabel}>🎁 {t('premiaciones.deliverables', 'Entregables:')}</Text>
                                  <Text style={s.entregablesVal}>{entry.entregables}</Text>
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

        {/* Footer note */}
        <View style={s.footNote}>
          <Text style={s.footNoteIcon}>ℹ️</Text>
          <Text style={s.footNoteText}>
            {t('premiaciones.footer', 'La ceremonia de premiación se realizará el Sábado 31 de mayo a las 6:00 PM en el escenario principal.')}
          </Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: T.bg },
  headerGrad:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 18, gap: 10 },
  backBtn:        { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backIcon:       { fontSize: 26, color: '#FFF', lineHeight: 30, fontWeight: '300' },
  headerTitle:    { fontSize: 16, fontWeight: '900', color: '#FFF', letterSpacing: 1.5 },
  headerSub:      { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  trophyWrap:     { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,215,0,0.2)', alignItems: 'center', justifyContent: 'center' },
  trophyEmoji:    { fontSize: 24 },
  scroll:         { padding: 14 },
  hero:           { borderRadius: 18, padding: 20, alignItems: 'center', marginBottom: 18, shadowColor: '#8B6308', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  heroTitle:      { fontSize: 12, fontWeight: '900', color: '#2C1A0E', letterSpacing: 1.5, textAlign: 'center', marginBottom: 6 },
  heroSub:        { fontSize: 11, color: '#4A2010', textAlign: 'center', fontWeight: '600' },
  catBlock:       { marginBottom: 14, borderRadius: 18, overflow: 'hidden', shadowColor: T.dark, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  catHeader:      { borderRadius: 18, overflow: 'hidden' },
  catHeaderGrad:  { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  catEmoji:       { fontSize: 28 },
  catName:        { fontSize: 17, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
  catSub:         { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  catChevron:     { fontSize: 26, color: 'rgba(255,255,255,0.7)', transform: [{ rotate: '90deg' }] },
  catChevronUp:   { transform: [{ rotate: '-90deg' }] },
  catContent:     { backgroundColor: T.card, borderWidth: 1, borderTopWidth: 0, borderColor: T.border, borderBottomLeftRadius: 18, borderBottomRightRadius: 18, padding: 14 },
  catDesc:        { fontSize: 12, color: T.muted, lineHeight: 18, marginBottom: 14, fontStyle: 'italic' },
  subBlock:       { marginBottom: 10, borderLeftWidth: 3, borderRadius: 12, backgroundColor: T.bg, borderWidth: 1, borderColor: T.border, overflow: 'hidden' },
  subHeader:      { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  subEmoji:       { fontSize: 18 },
  subName:        { flex: 1, fontSize: 14, fontWeight: '800' },
  subChevron:     { fontSize: 14, color: T.muted, fontWeight: '700' },
  podium:         { paddingHorizontal: 12, paddingBottom: 12, gap: 8 },
  podiumCard:     { borderRadius: 14, padding: 12, borderWidth: 1.5, borderColor: T.border, overflow: 'hidden', backgroundColor: T.card },
  podiumCardGold: { borderColor: '#C8960C', shadowColor: '#C8960C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3 },
  podiumTop:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  podiumMedal:    { fontSize: 28, flexShrink: 0 },
  podiumLugar:    { fontSize: 9, fontWeight: '900', color: T.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 },
  podiumNombre:   { fontSize: 14, fontWeight: '900', color: T.dark },
  podiumFinca:    { fontSize: 11, color: T.muted, marginTop: 2 },
  podiumMun:      { fontSize: 11, color: T.muted },
  premioTag:      { borderWidth: 1.5, borderRadius: 10, padding: 8, alignItems: 'center', flexShrink: 0 },
  premioAmount:   { fontSize: 12, fontWeight: '900' },
  entregablesRow: { backgroundColor: T.parchment, borderRadius: 8, padding: 8, gap: 3 },
  entregablesLabel:{ fontSize: 8, fontWeight: '900', color: T.amberDark, letterSpacing: 1 },
  entregablesVal: { fontSize: 11, color: T.body, lineHeight: 16 },
  footNote:       { flexDirection: 'row', gap: 10, backgroundColor: T.amberPale, borderRadius: 14, padding: 14, marginTop: 6, borderWidth: 1, borderColor: T.border },
  footNoteIcon:   { fontSize: 18, flexShrink: 0 },
  footNoteText:   { flex: 1, fontSize: 12, color: T.body, lineHeight: 18 },
});
