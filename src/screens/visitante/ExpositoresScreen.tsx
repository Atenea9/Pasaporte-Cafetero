import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const T = {
  bg:         '#F9F3E3',
  card:       '#FFFDF8',
  dark:       '#0D0604',
  body:       '#3C2010',
  muted:      '#8A6A4A',
  gold:       '#C8960C',
  goldLight:  '#E8B820',
  goldDark:   '#8B6308',
  goldPale:   '#FBF0C8',
  border:     '#EDD9A8',
  borderMed:  '#D4B886',
  parchment:  '#F5EDD0',
  surface:    '#FFF8EE',
};

type Categoria = 'todos' | 'productor' | 'tostador' | 'casas' | 'alcaldias' | 'bancos';

interface Expositor {
  id: string;
  nombre: string;
  categoria: Categoria;
  contacto: string;
  telefono: string;
  correo: string;
  web: string;
  descripcion: string;
  emoji: string;
  color: string;
  gradiente: [string,string,string];
  redes: { facebook?: string; instagram?: string; linkedin?: string; youtube?: string; twitter?: string };
}

const EXPOSITORES: Expositor[] = [
  // Productores
  { id: 'p1', nombre: 'Finca El Paraíso', categoria: 'productor', contacto: 'Carlos Andrés Mesa', telefono: '+57 316 123 4567', correo: 'contacto@fincaelparaiso.co', web: 'https://fincaelparaiso.co', descripcion: 'Productores de cafés especiales de altura en Chaparral, Tolima. Especialistas en proceso lavado y honey con puntajes SCA superiores a 87 puntos.', emoji: '🌿', color: '#2E7D32', gradiente: ['#1B3A1C','#2E7D32','#43A047'], redes: { instagram: 'https://instagram.com', facebook: 'https://facebook.com' } },
  { id: 'p2', nombre: 'Café Las Acacias', categoria: 'productor', contacto: 'María Fernanda López', telefono: '+57 310 987 6543', correo: 'info@lasacacias.co', web: 'https://lasacacias.co', descripcion: 'Finca familiar con 25 años de tradición cafetera. Cultivamos variedades Geisha, Castillo y Caturra entre 1.700 y 2.100 m.s.n.m.', emoji: '🌸', color: '#7B3F20', gradiente: ['#3A1C0A','#7B3F20','#B8652A'], redes: { instagram: 'https://instagram.com', facebook: 'https://facebook.com', youtube: 'https://youtube.com' } },
  { id: 'p3', nombre: 'Productores del Sur Tolimense', categoria: 'productor', contacto: 'Asociación ASOPROTOL', telefono: '+57 321 456 7890', correo: 'asoprotol@gmail.com', web: '', descripcion: 'Asociación de 120 familias caficultoras del sur del Tolima. Promovemos el café de paz y la sostenibilidad ambiental.', emoji: '👨‍🌾', color: '#5D4037', gradiente: ['#2A1C14','#5D4037','#8D6E63'], redes: { facebook: 'https://facebook.com' } },
  // Tostadores
  { id: 't1', nombre: 'Tostadora Andina Café', categoria: 'tostador', contacto: 'Santiago Restrepo', telefono: '+57 315 234 5678', correo: 'ventas@tostadoraandina.com', web: 'https://tostadoraandina.com', descripcion: 'Tostadores artesanales con tuestes de perfil personalizado. Ofrecemos tueste medio y claro para resaltar los sabores únicos del Tolima.', emoji: '🔥', color: '#BF360C', gradiente: ['#5A1500','#BF360C','#E64A19'], redes: { instagram: 'https://instagram.com', facebook: 'https://facebook.com', linkedin: 'https://linkedin.com' } },
  { id: 't2', nombre: 'Roast Lab Tolima', categoria: 'tostador', contacto: 'Diana Milena Castro', telefono: '+57 317 345 6789', correo: 'hello@roastlabtolima.co', web: 'https://roastlabtolima.co', descripcion: 'Laboratorio de tostión especializado en micro-lotes. Cada bolsa cuenta la historia del origen, el caficultor y el proceso de tostión.', emoji: '⚗️', color: '#4527A0', gradiente: ['#1A0060','#4527A0','#7C4DFF'], redes: { instagram: 'https://instagram.com', youtube: 'https://youtube.com' } },
  { id: 't3', nombre: 'Café Artesano del Tolima', categoria: 'tostador', contacto: 'Pedro Enrique Vargas', telefono: '+57 300 111 2233', correo: 'pedrovargas@cafeartesano.co', web: '', descripcion: 'Pequeña tostadora familiar que trabaja directamente con fincas locales. 100 kg/día con tostador de tambor artesanal.', emoji: '☕', color: '#C8860B', gradiente: ['#5A3800','#C8860B','#E8B820'], redes: { facebook: 'https://facebook.com', instagram: 'https://instagram.com' } },
  // Casas Comerciales
  { id: 'c1', nombre: 'Exporter Café S.A.S.', categoria: 'casas', contacto: 'Andrés Felipe Nieto', telefono: '+57 1 234 5678', correo: 'exports@exportercafe.com', web: 'https://exportercafe.com', descripcion: 'Casa exportadora de café colombiano de origen. Conectamos productores del Tolima con compradores internacionales en más de 15 países.', emoji: '🌍', color: '#1565C0', gradiente: ['#0A1F60','#1565C0','#1E88E5'], redes: { linkedin: 'https://linkedin.com', facebook: 'https://facebook.com', twitter: 'https://twitter.com' } },
  { id: 'c2', nombre: 'Comercializadora Café Tolima', categoria: 'casas', contacto: 'Laura Sofía Morales', telefono: '+57 310 765 4321', correo: 'comercial@cafetolima.co', web: 'https://cafetolima.co', descripcion: 'Empresa comercializadora con 15 años de experiencia. Compramos, procesamos y exportamos cafés especiales del Tolima.', emoji: '🏢', color: '#00695C', gradiente: ['#002A24','#00695C','#00897B'], redes: { linkedin: 'https://linkedin.com', instagram: 'https://instagram.com' } },
  // Alcaldías e Instituciones
  { id: 'a1', nombre: 'Alcaldía de Chaparral', categoria: 'alcaldias', contacto: 'Alcalde Municipal', telefono: '+57 8 222 3344', correo: 'alcaldia@chaparral.gov.co', web: 'https://chaparral-tolima.gov.co', descripcion: 'Municipio anfitrión de la Feria Internacional del Café 2026. Lideramos el desarrollo social, cultural y cafetero del sur del Tolima.', emoji: '🏛️', color: '#1A237E', gradiente: ['#0A0F4A','#1A237E','#283593'], redes: { facebook: 'https://facebook.com', twitter: 'https://twitter.com' } },
  { id: 'a2', nombre: 'Comité de Cafeteros del Tolima', categoria: 'alcaldias', contacto: 'Director Departamental', telefono: '+57 8 261 3900', correo: 'comitetolima@cafedecolombia.com', web: 'https://federacioncafe.co', descripcion: 'Representamos a 38.000 familias caficultoras del Tolima. Brindamos asistencia técnica, acceso a mercados y programas de sostenibilidad.', emoji: '☕', color: '#B8860B', gradiente: ['#5A3800','#8B6308','#C8960C'], redes: { facebook: 'https://facebook.com', instagram: 'https://instagram.com', linkedin: 'https://linkedin.com' } },
  { id: 'a3', nombre: 'Universidad del Tolima', categoria: 'alcaldias', contacto: 'Rector', telefono: '+57 8 277 9999', correo: 'info@ut.edu.co', web: 'https://ut.edu.co', descripcion: 'Universidad pública con programas de investigación en agronomía y caficultura. Desarrollamos tecnologías para mejorar la calidad del café tolimense.', emoji: '🎓', color: '#6A1B9A', gradiente: ['#2A0050','#6A1B9A','#9C27B0'], redes: { facebook: 'https://facebook.com', instagram: 'https://instagram.com', linkedin: 'https://linkedin.com' } },
  // Bancos
  { id: 'b1', nombre: 'Banco Agrario de Colombia', categoria: 'bancos', contacto: 'Gerente Regional Tolima', telefono: '+57 1 351 0000', correo: 'servicioalcliente@bancoagrario.gov.co', web: 'https://bancoagrario.gov.co', descripcion: 'Principal entidad financiera del sector rural. Créditos especiales para productores cafeteros, fintech rural y seguros agropecuarios.', emoji: '🏦', color: '#1B5E20', gradiente: ['#0A2A0C','#1B5E20','#2E7D32'], redes: { facebook: 'https://facebook.com', twitter: 'https://twitter.com', linkedin: 'https://linkedin.com' } },
  { id: 'b2', nombre: 'Bancamía', categoria: 'bancos', contacto: 'Coordinadora Comercial', telefono: '+57 1 886 0202', correo: 'contacto@bancamia.com.co', web: 'https://bancamia.com.co', descripcion: 'Banco de microfinanzas para el sector rural. Apoyamos a pequeños y medianos caficultores con créditos flexibles y educación financiera.', emoji: '💳', color: '#E65100', gradiente: ['#6A2000','#E65100','#FF6D00'], redes: { facebook: 'https://facebook.com', instagram: 'https://instagram.com' } },
];

const CAT_FILTER: { key: Categoria; label: string; emoji: string; color: string }[] = [
  { key: 'todos',    label: 'Todos',       emoji: '✦',  color: '#C8960C' },
  { key: 'productor',label: 'Productores', emoji: '🌿', color: '#2E7D32' },
  { key: 'tostador', label: 'Tostadores',  emoji: '🔥', color: '#BF360C' },
  { key: 'casas',    label: 'Casas Com.', emoji: '🌍', color: '#1565C0' },
  { key: 'alcaldias',label: 'Instituciones',emoji:'🏛️', color: '#1A237E' },
  { key: 'bancos',   label: 'Bancos',      emoji: '🏦', color: '#1B5E20' },
];

const SOCIAL_ICONS: Record<string, {label:string; color:string}> = {
  instagram: { label: 'Instagram', color: '#E1306C' },
  facebook:  { label: 'Facebook',  color: '#1877F2' },
  linkedin:  { label: 'LinkedIn',  color: '#0A66C2' },
  youtube:   { label: 'YouTube',   color: '#FF0000' },
  twitter:   { label: 'Twitter/X', color: '#111' },
};

export default function ExpositoresScreen() {
  const { t } = useTranslation();
  const nav = useNavigation();
  const [cat, setCat]           = useState<Categoria>('todos');
  const [showFavs, setShowFavs] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (id: string) => setFavorites(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });

  const list = EXPOSITORES.filter(e => {
    if (showFavs && !favorites.has(e.id)) return false;
    if (cat !== 'todos' && e.categoria !== cat) return false;
    return true;
  });

  const activeCat = CAT_FILTER.find(c => c.key === cat)!;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0604" />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <LinearGradient colors={['#000000','#0D0604','#1C1008']} style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={{flex:1}}>
          <Text style={s.headerEyebrow}>FERIA INTERNACIONAL DEL CAFÉ · CHAPARRAL 2026</Text>
          <Text style={s.headerTitle}>EXPOSITORES</Text>
          <Text style={s.headerSub}>{EXPOSITORES.length} participantes · 5 categorías</Text>
        </View>
        <TouchableOpacity
          style={[s.favToggle, showFavs && s.favToggleActive]}
          onPress={() => setShowFavs(v => !v)}
        >
          <Text style={s.favIcon}>{showFavs ? '❤️' : '🤍'}</Text>
          <Text style={[s.favLabel, showFavs && {color: T.gold}]}>
            {showFavs ? 'MIS FAV.' : 'GUARDAR'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* ── Gold divider strip ─────────────────────────────────────────────── */}
      <LinearGradient colors={['#3A2000','#8B6308','#C8960C','#8B6308','#3A2000']} start={{x:0,y:0}} end={{x:1,y:0}} style={s.goldStrip} />

      {/* ── Category filter ────────────────────────────────────────────────── */}
      <View style={s.filterWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
          {CAT_FILTER.map(c => {
            const active = cat === c.key;
            return (
              <TouchableOpacity
                key={c.key}
                onPress={() => setCat(c.key)}
                activeOpacity={0.82}
                style={[s.filterChip, active && {borderColor: c.color, backgroundColor: c.color + '14'}]}
              >
                {active && (
                  <View style={[s.filterDot, {backgroundColor: c.color}]} />
                )}
                <Text style={s.filterEmoji}>{c.emoji}</Text>
                <Text style={[s.filterLabel, active && {color: c.color, fontWeight: '900'}]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Count strip ────────────────────────────────────────────────────── */}
      <View style={s.countStrip}>
        <View style={[s.countAccent, {backgroundColor: activeCat.color}]} />
        <Text style={s.countText}>
          <Text style={{color: activeCat.color, fontWeight: '900'}}>{list.length}</Text>
          {' expositores'}
          {showFavs ? ' · ❤️ favoritos' : ` · ${activeCat.label}`}
        </Text>
      </View>

      {/* ── List ───────────────────────────────────────────────────────────── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {list.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>{showFavs ? '🤍' : '🔍'}</Text>
            <Text style={s.emptyTitle}>{showFavs ? 'Sin favoritos aún' : 'Sin resultados'}</Text>
            <Text style={s.emptyText}>
              {showFavs
                ? 'Toca el ❤️ en cualquier expositor para guardarlo aquí.'
                : 'No hay expositores en esta categoría.'}
            </Text>
          </View>
        ) : (
          list.map(exp => {
            const isExp  = expanded === exp.id;
            const isFav  = favorites.has(exp.id);
            const catLabel = CAT_FILTER.find(c => c.key === exp.categoria)?.label ?? exp.categoria;
            return (
              <View key={exp.id} style={s.card}>
                {/* Card gradient header */}
                <LinearGradient colors={exp.gradiente} start={{x:0,y:0}} end={{x:1,y:1}} style={s.cardGradHeader}>
                  {/* Category badge */}
                  <View style={s.cardHeaderTop}>
                    <View style={s.catBadge}>
                      <Text style={s.catBadgeText}>{catLabel.toUpperCase()}</Text>
                    </View>
                    <TouchableOpacity
                      style={[s.favBtnCard, isFav && s.favBtnCardActive]}
                      onPress={() => toggle(exp.id)}
                    >
                      <Text style={s.favBtnCardIcon}>{isFav ? '❤️' : '🤍'}</Text>
                    </TouchableOpacity>
                  </View>
                  {/* Emoji + name */}
                  <View style={s.cardHeaderMain}>
                    <View style={s.emojiRing}>
                      <Text style={s.emojiText}>{exp.emoji}</Text>
                    </View>
                    <View style={{flex:1}}>
                      <Text style={s.cardName}>{exp.nombre}</Text>
                      <Text style={s.cardContactLine}>👤 {exp.contacto}</Text>
                    </View>
                    <TouchableOpacity
                      style={s.expandIconBtn}
                      onPress={() => setExpanded(isExp ? null : exp.id)}
                    >
                      <Text style={s.expandIcon}>{isExp ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>

                {/* Card body (always visible: short description) */}
                <TouchableOpacity
                  style={s.cardPreview}
                  onPress={() => setExpanded(isExp ? null : exp.id)}
                  activeOpacity={0.88}
                >
                  <Text style={s.cardPreviewText} numberOfLines={isExp ? 999 : 2}>
                    {exp.descripcion}
                  </Text>
                </TouchableOpacity>

                {/* Expanded detail */}
                {isExp && (
                  <View style={s.cardDetail}>
                    <View style={[s.detailDivider, {backgroundColor: exp.color + '30'}]} />

                    {/* Contact grid */}
                    <View style={s.contactGrid}>
                      <TouchableOpacity
                        style={[s.contactBtn, {borderColor: exp.color + '40'}]}
                        onPress={() => Linking.openURL(`tel:${exp.telefono}`)}
                      >
                        <LinearGradient colors={[exp.color + '18', exp.color + '08']} style={StyleSheet.absoluteFill} />
                        <Text style={s.contactBtnIcon}>📞</Text>
                        <Text style={s.contactBtnLabel}>TELÉFONO</Text>
                        <Text style={[s.contactBtnVal, {color: exp.color}]}>{exp.telefono}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[s.contactBtn, {borderColor: exp.color + '40'}]}
                        onPress={() => Linking.openURL(`mailto:${exp.correo}`)}
                      >
                        <LinearGradient colors={[exp.color + '18', exp.color + '08']} style={StyleSheet.absoluteFill} />
                        <Text style={s.contactBtnIcon}>✉️</Text>
                        <Text style={s.contactBtnLabel}>CORREO</Text>
                        <Text style={[s.contactBtnVal, {color: exp.color}]} numberOfLines={1}>{exp.correo}</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Website */}
                    {exp.web ? (
                      <TouchableOpacity
                        style={[s.webBtn, {borderColor: exp.color}]}
                        onPress={() => Linking.openURL(exp.web)}
                        activeOpacity={0.85}
                      >
                        <LinearGradient colors={[exp.color + '20', exp.color + '08']} style={StyleSheet.absoluteFill} />
                        <Text style={s.webBtnIcon}>🌐</Text>
                        <Text style={[s.webBtnText, {color: exp.color}]}>Visitar Página Web</Text>
                        <Text style={[s.webBtnArrow, {color: exp.color}]}>→</Text>
                      </TouchableOpacity>
                    ) : null}

                    {/* Social media */}
                    {Object.keys(exp.redes).length > 0 && (
                      <View style={s.socialWrap}>
                        <Text style={s.socialTitle}>REDES SOCIALES</Text>
                        <View style={s.socialRow}>
                          {(Object.entries(exp.redes) as [string, string][]).map(([key, url]) => {
                            const cfg = SOCIAL_ICONS[key];
                            if (!cfg || !url) return null;
                            return (
                              <TouchableOpacity
                                key={key}
                                style={[s.socialBtn, {backgroundColor: cfg.color}]}
                                onPress={() => Linking.openURL(url)}
                              >
                                <Text style={s.socialBtnText}>{cfg.label}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
        <View style={{height: 40}} />
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
  headerTitle:     { fontSize: 24, fontWeight: '900', color: '#FFF', letterSpacing: 3 },
  headerSub:       { fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 2, letterSpacing: 1 },
  favToggle:       { alignItems: 'center', gap: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  favToggleActive: { backgroundColor: 'rgba(200,150,12,0.25)', borderColor: T.gold + '80' },
  favIcon:         { fontSize: 18 },
  favLabel:        { fontSize: 7, fontWeight: '900', color: 'rgba(255,255,255,0.6)', letterSpacing: 1 },
  goldStrip:       { height: 3 },
  filterWrap:      { backgroundColor: T.parchment, borderBottomWidth: 1, borderBottomColor: T.border },
  filterScroll:    { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterChip:      { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: T.card, borderRadius: 22, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1.5, borderColor: T.border },
  filterDot:       { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },
  filterEmoji:     { fontSize: 13 },
  filterLabel:     { fontSize: 11, fontWeight: '700', color: T.muted },
  countStrip:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: T.goldPale, borderBottomWidth: 1, borderBottomColor: T.border },
  countAccent:     { width: 4, height: 18, borderRadius: 2 },
  countText:       { fontSize: 12, color: T.muted, letterSpacing: 0.3 },
  scroll:          { padding: 12, paddingBottom: 20 },
  emptyState:      { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyIcon:       { fontSize: 52 },
  emptyTitle:      { fontSize: 18, fontWeight: '900', color: T.muted },
  emptyText:       { fontSize: 13, color: T.muted, textAlign: 'center', lineHeight: 20 },

  card:            { backgroundColor: T.card, borderRadius: 20, marginBottom: 12, overflow: 'hidden', shadowColor: '#1A0800', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 12, elevation: 5, borderWidth: 1, borderColor: T.border },
  cardGradHeader:  { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16 },
  cardHeaderTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  catBadge:        { backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  catBadgeText:    { fontSize: 8, fontWeight: '900', color: '#FFF', letterSpacing: 1.5 },
  favBtnCard:      { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  favBtnCardActive:{ backgroundColor: 'rgba(255,50,80,0.4)', borderColor: '#FF5070' },
  favBtnCardIcon:  { fontSize: 17 },
  cardHeaderMain:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emojiRing:       { width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)', flexShrink: 0 },
  emojiText:       { fontSize: 26 },
  cardName:        { fontSize: 16, fontWeight: '900', color: '#FFF', lineHeight: 20, textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: {width:0,height:1}, textShadowRadius: 3 },
  cardContactLine: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  expandIconBtn:   { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  expandIcon:      { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '900' },
  cardPreview:     { paddingHorizontal: 16, paddingVertical: 12 },
  cardPreviewText: { fontSize: 13, color: T.body, lineHeight: 19 },
  cardDetail:      { paddingHorizontal: 14, paddingBottom: 16 },
  detailDivider:   { height: 1, marginBottom: 14 },
  contactGrid:     { flexDirection: 'row', gap: 8, marginBottom: 10 },
  contactBtn:      { flex: 1, borderRadius: 14, padding: 12, borderWidth: 1.5, overflow: 'hidden', gap: 3 },
  contactBtnIcon:  { fontSize: 18, marginBottom: 2 },
  contactBtnLabel: { fontSize: 7.5, fontWeight: '900', color: T.muted, letterSpacing: 1.5 },
  contactBtnVal:   { fontSize: 11, fontWeight: '700' },
  webBtn:          { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14, overflow: 'hidden' },
  webBtnIcon:      { fontSize: 18 },
  webBtnText:      { flex: 1, fontSize: 13, fontWeight: '800' },
  webBtnArrow:     { fontSize: 20, fontWeight: '900' },
  socialWrap:      { gap: 8 },
  socialTitle:     { fontSize: 8, fontWeight: '900', color: T.muted, letterSpacing: 2.5 },
  socialRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  socialBtn:       { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  socialBtnText:   { fontSize: 11, fontWeight: '800', color: '#FFF' },
} as any);
