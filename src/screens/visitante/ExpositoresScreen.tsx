import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Linking, TextInput,
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
  green: '#2D6A3F', red: '#C0392B',
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
  redes: { facebook?: string; instagram?: string; linkedin?: string; youtube?: string; twitter?: string };
}

const EXPOSITORES: Expositor[] = [
  // Productores
  { id: 'p1', nombre: 'Finca El Paraíso', categoria: 'productor', contacto: 'Carlos Andrés Mesa', telefono: '+57 316 123 4567', correo: 'contacto@fincaelparaiso.co', web: 'https://fincaelparaiso.co', descripcion: 'Productores de cafés especiales de altura en Chaparral, Tolima. Especialistas en proceso lavado y honey con puntajes SCA superiores a 87 puntos.', emoji: '🌿', color: '#2D6A3F', redes: { instagram: 'https://instagram.com', facebook: 'https://facebook.com' } },
  { id: 'p2', nombre: 'Café Las Acacias', categoria: 'productor', contacto: 'María Fernanda López', telefono: '+57 310 987 6543', correo: 'info@lasacacias.co', web: 'https://lasacacias.co', descripcion: 'Finca familiar con 25 años de tradición cafetera. Cultivamos variedades Geisha, Castillo y Caturra entre 1.700 y 2.100 m.s.n.m.', emoji: '🌸', color: '#7B4A2A', redes: { instagram: 'https://instagram.com', facebook: 'https://facebook.com', youtube: 'https://youtube.com' } },
  { id: 'p3', nombre: 'Productores del Sur Tolimense', categoria: 'productor', contacto: 'Asociación ASOPROTOL', telefono: '+57 321 456 7890', correo: 'asoprotol@gmail.com', web: '', descripcion: 'Asociación de 120 familias caficultoras del sur del Tolima. Promovemos el café de paz y la sostenibilidad ambiental.', emoji: '👨‍🌾', color: '#5D4037', redes: { facebook: 'https://facebook.com' } },
  // Tostadores
  { id: 't1', nombre: 'Tostadora Andina Café', categoria: 'tostador', contacto: 'Santiago Restrepo', telefono: '+57 315 234 5678', correo: 'ventas@tostadoraandina.com', web: 'https://tostadoraandina.com', descripcion: 'Tostadores artesanales con tuestes de perfil personalizado. Ofrecemos perfiles de tueste medio y claro para resaltar los sabores únicos del Tolima.', emoji: '🔥', color: '#BF360C', redes: { instagram: 'https://instagram.com', facebook: 'https://facebook.com', linkedin: 'https://linkedin.com' } },
  { id: 't2', nombre: 'Roast Lab Tolima', categoria: 'tostador', contacto: 'Diana Milena Castro', telefono: '+57 317 345 6789', correo: 'hello@roastlabtolima.co', web: 'https://roastlabtolima.co', descripcion: 'Laboratorio de tostión especializado en micro-lotes. Cada bolsa cuenta la historia del origen, el caficultor y el proceso de tostión.', emoji: '⚗️', color: '#4527A0', redes: { instagram: 'https://instagram.com', youtube: 'https://youtube.com' } },
  { id: 't3', nombre: 'Café Artesano del Tolima', categoria: 'tostador', contacto: 'Pedro Enrique Vargas', telefono: '+57 300 111 2233', correo: 'pedrovargas@cafeartesano.co', web: '', descripcion: 'Pequeña tostadora familiar que trabaja directamente con fincas locales. Producción de 100 kg/día con tostador de tambor artesanal.', emoji: '☕', color: '#C8860B', redes: { facebook: 'https://facebook.com', instagram: 'https://instagram.com' } },
  // Casas Comerciales
  { id: 'c1', nombre: 'Exporter Café S.A.S.', categoria: 'casas', contacto: 'Andrés Felipe Nieto', telefono: '+57 1 234 5678', correo: 'exports@exportercafe.com', web: 'https://exportercafe.com', descripcion: 'Casa exportadora de café colombiano de origen. Conectamos productores del Tolima con compradores internacionales en más de 15 países.', emoji: '🌍', color: '#1565C0', redes: { linkedin: 'https://linkedin.com', facebook: 'https://facebook.com', twitter: 'https://twitter.com' } },
  { id: 'c2', nombre: 'Comercializadora Café Tolima', categoria: 'casas', contacto: 'Laura Sofía Morales', telefono: '+57 310 765 4321', correo: 'comercial@cafetolima.co', web: 'https://cafetolima.co', descripcion: 'Empresa comercializadora con 15 años de experiencia. Compramos, procesamos y exportamos cafés especiales del Tolima al mercado nacional e internacional.', emoji: '🏢', color: '#00695C', redes: { linkedin: 'https://linkedin.com', instagram: 'https://instagram.com' } },
  // Alcaldías e Instituciones
  { id: 'a1', nombre: 'Alcaldía de Chaparral', categoria: 'alcaldias', contacto: 'Alcalde Municipal', telefono: '+57 8 222 3344', correo: 'alcaldia@chaparral.gov.co', web: 'https://chaparral-tolima.gov.co', descripcion: 'Municipio anfitrión de la Feria Internacional del Café 2026. Lideramos el desarrollo social, cultural y cafetero del sur del Tolima.', emoji: '🏛️', color: '#1A237E', redes: { facebook: 'https://facebook.com', twitter: 'https://twitter.com' } },
  { id: 'a2', nombre: 'Comité de Cafeteros del Tolima', categoria: 'alcaldias', contacto: 'Director Departamental', telefono: '+57 8 261 3900', correo: 'comitetolima@cafedecolombia.com', web: 'https://federacioncafe.co', descripcion: 'Representamos a 38.000 familias caficultoras del Tolima. Brindamos asistencia técnica, acceso a mercados y programas de sostenibilidad.', emoji: '☕', color: '#B8860B', redes: { facebook: 'https://facebook.com', instagram: 'https://instagram.com', linkedin: 'https://linkedin.com' } },
  { id: 'a3', nombre: 'Universidad del Tolima', categoria: 'alcaldias', contacto: 'Rector', telefono: '+57 8 277 9999', correo: 'info@ut.edu.co', web: 'https://ut.edu.co', descripcion: 'Universidad pública con programas de investigación en agronomía y caficultura. Desarrollamos tecnologías para mejorar la calidad y sostenibilidad del café tolimense.', emoji: '🎓', color: '#6A1B9A', redes: { facebook: 'https://facebook.com', instagram: 'https://instagram.com', linkedin: 'https://linkedin.com' } },
  // Bancos
  { id: 'b1', nombre: 'Banco Agrario de Colombia', categoria: 'bancos', contacto: 'Gerente Regional Tolima', telefono: '+57 1 351 0000', correo: 'servicioalcliente@bancoagrario.gov.co', web: 'https://bancoagrario.gov.co', descripcion: 'Principal entidad financiera del sector rural colombiano. Ofrecemos créditos especiales para productores cafeteros, fintech rural y seguros agropecuarios.', emoji: '🏦', color: '#1B5E20', redes: { facebook: 'https://facebook.com', twitter: 'https://twitter.com', linkedin: 'https://linkedin.com' } },
  { id: 'b2', nombre: 'Bancamía', categoria: 'bancos', contacto: 'Coordinadora Comercial', telefono: '+57 1 886 0202', correo: 'contacto@bancamia.com.co', web: 'https://bancamia.com.co', descripcion: 'Banco de microfinanzas para el sector rural. Apoyamos a pequeños y medianos caficultores con créditos flexibles, ahorro y educación financiera.', emoji: '💳', color: '#E65100', redes: { facebook: 'https://facebook.com', instagram: 'https://instagram.com' } },
];

const CATS: { key: Categoria; emoji: string }[] = [
  { key: 'todos',    emoji: '🔍' },
  { key: 'productor', emoji: '🌿' },
  { key: 'tostador', emoji: '🔥' },
  { key: 'casas',    emoji: '🌍' },
  { key: 'alcaldias',emoji: '🏛️' },
  { key: 'bancos',   emoji: '🏦' },
];

const CAT_LABELS: Record<string, string> = {
  todos:     'Todos',
  productor: 'Productor',
  tostador:  'Tostador',
  casas:     'Casas Com.',
  alcaldias: 'Alcaldías',
  bancos:    'Bancos',
};

export default function ExpositoresScreen() {
  const { t } = useTranslation();
  const nav = useNavigation();
  const [cat, setCat] = useState<Categoria>('todos');
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

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* Header */}
      <LinearGradient colors={['#2C1A0E', '#5C3520', '#8B4A22']} style={s.headerGrad}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>{t('expositores.title', 'EXPOSITORES')}</Text>
          <Text style={s.headerSub}>{t('expositores.subtitle', 'Participantes de la Feria 2026')}</Text>
        </View>
        <TouchableOpacity
          style={[s.favToggle, showFavs && s.favToggleActive]}
          onPress={() => setShowFavs(v => !v)}
        >
          <Text style={s.favToggleIcon}>{showFavs ? '❤️' : '🤍'}</Text>
          <Text style={[s.favToggleText, showFavs && { color: T.amber }]}>
            {showFavs ? t('expositores.my_favs', 'MIS FAV.') : t('expositores.favorites', 'FAVORITOS')}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Category filters */}
      <View style={s.filterWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
          {CATS.map(c => (
            <TouchableOpacity
              key={c.key}
              style={[s.filterChip, cat === c.key && s.filterChipActive]}
              onPress={() => setCat(c.key)}
            >
              <Text style={s.filterEmoji}>{c.emoji}</Text>
              <Text style={[s.filterLabel, cat === c.key && s.filterLabelActive]}>
                {CAT_LABELS[c.key]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Count badge */}
      <View style={s.countRow}>
        <Text style={s.countText}>
          {list.length} {t('expositores.exhibitors', 'expositores')}
          {showFavs ? ` · ❤️ ${t('expositores.favorites_label', 'favoritos')}` : ''}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {list.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>{showFavs ? '🤍' : '🔍'}</Text>
            <Text style={s.emptyText}>
              {showFavs
                ? t('expositores.no_favs', 'Aún no tienes favoritos.\nToca el ❤️ en cualquier expositor.')
                : t('expositores.no_results', 'Sin resultados para esta categoría.')}
            </Text>
          </View>
        ) : (
          list.map(exp => {
            const isExp = expanded === exp.id;
            const isFav = favorites.has(exp.id);
            return (
              <View key={exp.id} style={[s.card, { borderTopColor: exp.color }]}>
                {/* Card header */}
                <TouchableOpacity style={s.cardHeader} onPress={() => setExpanded(isExp ? null : exp.id)} activeOpacity={0.85}>
                  <View style={[s.emojiCircle, { backgroundColor: exp.color + '18', borderColor: exp.color + '50' }]}>
                    <Text style={s.emojiCircleText}>{exp.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={s.catBadgeRow}>
                      <View style={[s.catBadge, { backgroundColor: exp.color }]}>
                        <Text style={s.catBadgeText}>{CAT_LABELS[exp.categoria].toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={s.cardName}>{exp.nombre}</Text>
                    <Text style={s.cardContact}>👤 {exp.contacto}</Text>
                  </View>
                  <View style={s.cardActions}>
                    <TouchableOpacity style={s.favBtn} onPress={() => toggle(exp.id)}>
                      <Text style={s.favBtnIcon}>{isFav ? '❤️' : '🤍'}</Text>
                    </TouchableOpacity>
                    <Text style={[s.chevron, isExp && s.chevronUp]}>›</Text>
                  </View>
                </TouchableOpacity>

                {/* Expanded detail */}
                {isExp && (
                  <View style={s.cardDetail}>
                    <Text style={s.cardDesc}>{exp.descripcion}</Text>

                    {/* Contact info */}
                    <View style={s.infoGrid}>
                      <TouchableOpacity style={s.infoBtn} onPress={() => Linking.openURL(`tel:${exp.telefono}`)}>
                        <Text style={s.infoBtnIcon}>📞</Text>
                        <Text style={s.infoBtnLabel}>{t('expositores.phone', 'Teléfono')}</Text>
                        <Text style={s.infoBtnVal}>{exp.telefono}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={s.infoBtn} onPress={() => Linking.openURL(`mailto:${exp.correo}`)}>
                        <Text style={s.infoBtnIcon}>✉️</Text>
                        <Text style={s.infoBtnLabel}>{t('expositores.email', 'Correo')}</Text>
                        <Text style={s.infoBtnVal} numberOfLines={1}>{exp.correo}</Text>
                      </TouchableOpacity>
                    </View>

                    {exp.web ? (
                      <TouchableOpacity style={[s.webBtn, { borderColor: exp.color }]} onPress={() => Linking.openURL(exp.web)}>
                        <Text style={s.webBtnIcon}>🌐</Text>
                        <Text style={[s.webBtnText, { color: exp.color }]}>{t('expositores.website', 'Página Web')}</Text>
                        <Text style={[s.webBtnArrow, { color: exp.color }]}>→</Text>
                      </TouchableOpacity>
                    ) : null}

                    {/* Social media */}
                    {Object.keys(exp.redes).length > 0 && (
                      <View style={s.socialSection}>
                        <Text style={s.socialTitle}>{t('expositores.social', 'REDES SOCIALES')}</Text>
                        <View style={s.socialRow}>
                          {exp.redes.instagram && (
                            <TouchableOpacity style={[s.socialBtn, { backgroundColor: '#E1306C' }]} onPress={() => Linking.openURL(exp.redes.instagram!)}>
                              <Text style={s.socialBtnText}>📷 Instagram</Text>
                            </TouchableOpacity>
                          )}
                          {exp.redes.facebook && (
                            <TouchableOpacity style={[s.socialBtn, { backgroundColor: '#1877F2' }]} onPress={() => Linking.openURL(exp.redes.facebook!)}>
                              <Text style={s.socialBtnText}>📘 Facebook</Text>
                            </TouchableOpacity>
                          )}
                          {exp.redes.linkedin && (
                            <TouchableOpacity style={[s.socialBtn, { backgroundColor: '#0A66C2' }]} onPress={() => Linking.openURL(exp.redes.linkedin!)}>
                              <Text style={s.socialBtnText}>💼 LinkedIn</Text>
                            </TouchableOpacity>
                          )}
                          {exp.redes.youtube && (
                            <TouchableOpacity style={[s.socialBtn, { backgroundColor: '#FF0000' }]} onPress={() => Linking.openURL(exp.redes.youtube!)}>
                              <Text style={s.socialBtnText}>▶️ YouTube</Text>
                            </TouchableOpacity>
                          )}
                          {exp.redes.twitter && (
                            <TouchableOpacity style={[s.socialBtn, { backgroundColor: '#000' }]} onPress={() => Linking.openURL(exp.redes.twitter!)}>
                              <Text style={s.socialBtnText}>✖ Twitter/X</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
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
  favToggle:      { flexDirection: 'column', alignItems: 'center', gap: 2, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8 },
  favToggleActive:{ backgroundColor: 'rgba(200,150,12,0.3)' },
  favToggleIcon:  { fontSize: 16 },
  favToggleText:  { fontSize: 7, fontWeight: '900', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5 },
  filterWrap:     { backgroundColor: T.parchment, borderBottomWidth: 1, borderBottomColor: T.border },
  filterScroll:   { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterChip:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: T.card, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1.5, borderColor: T.border },
  filterChipActive:{ backgroundColor: T.coffeeDark, borderColor: T.coffeeDark },
  filterEmoji:    { fontSize: 13 },
  filterLabel:    { fontSize: 11, fontWeight: '700', color: T.body },
  filterLabelActive:{ color: '#FFF' },
  countRow:       { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: T.amberPale, borderBottomWidth: 1, borderBottomColor: T.border },
  countText:      { fontSize: 11, fontWeight: '700', color: T.amberDark },
  scroll:         { padding: 14, paddingBottom: 20 },
  emptyState:     { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyIcon:      { fontSize: 48 },
  emptyText:      { fontSize: 14, color: T.muted, textAlign: 'center', lineHeight: 22 },
  card:           { backgroundColor: T.card, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: T.border, borderTopWidth: 4, overflow: 'hidden', shadowColor: T.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  cardHeader:     { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  emojiCircle:    { width: 52, height: 52, borderRadius: 26, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  emojiCircleText:{ fontSize: 24 },
  catBadgeRow:    { flexDirection: 'row', marginBottom: 4 },
  catBadge:       { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  catBadgeText:   { fontSize: 8, fontWeight: '900', color: '#FFF', letterSpacing: 0.8 },
  cardName:       { fontSize: 15, fontWeight: '900', color: T.dark, lineHeight: 19 },
  cardContact:    { fontSize: 11, color: T.muted, marginTop: 2 },
  cardActions:    { alignItems: 'center', gap: 8, flexShrink: 0 },
  favBtn:         { width: 32, height: 32, borderRadius: 16, backgroundColor: T.amberPale, alignItems: 'center', justifyContent: 'center' },
  favBtnIcon:     { fontSize: 16 },
  chevron:        { fontSize: 22, color: T.muted, transform: [{ rotate: '90deg' }] },
  chevronUp:      { transform: [{ rotate: '-90deg' }] },
  cardDetail:     { paddingHorizontal: 14, paddingBottom: 16, borderTopWidth: 1, borderTopColor: T.border },
  cardDesc:       { fontSize: 13, color: T.body, lineHeight: 20, marginTop: 12, marginBottom: 14 },
  infoGrid:       { flexDirection: 'row', gap: 10, marginBottom: 10 },
  infoBtn:        { flex: 1, backgroundColor: T.bg, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: T.border, gap: 2 },
  infoBtnIcon:    { fontSize: 16, marginBottom: 2 },
  infoBtnLabel:   { fontSize: 8, fontWeight: '900', color: T.muted, letterSpacing: 1, textTransform: 'uppercase' },
  infoBtnVal:     { fontSize: 11, fontWeight: '700', color: T.dark },
  webBtn:         { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 14 },
  webBtnIcon:     { fontSize: 16 },
  webBtnText:     { flex: 1, fontSize: 13, fontWeight: '700' },
  webBtnArrow:    { fontSize: 18, fontWeight: '900' },
  socialSection:  { gap: 8 },
  socialTitle:    { fontSize: 8, fontWeight: '900', color: T.muted, letterSpacing: 2 },
  socialRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  socialBtn:      { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  socialBtnText:  { fontSize: 11, fontWeight: '700', color: '#FFF' },
});
