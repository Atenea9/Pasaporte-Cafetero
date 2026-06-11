import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const T = {
  bg: '#F9F3E3', card: '#FFFDF8', parchment: '#F5EDD0',
  dark: '#2C1A0E', body: '#5C3520', muted: '#9B7B5A',
  amber: '#C8960C', amberPale: '#FBF0C8', amberDark: '#8B6308',
  border: '#EDD9A8', borderMed: '#D4B886', gold: '#B8860B',
  green: '#2D5A1E', greenPale: '#E8F2E4',
};

const ALIADOS = [
  {
    id: 'gob_tolima', nombre: 'Gobernación del Tolima', emoji: '🏛️', color: '#1565C0',
    rol: 'Auspiciador Principal', web: 'https://www.tolima.gov.co',
    descripcion: 'La Gobernadora Adriana Magali Matiz ha sido una de las mayores promotoras del café del Tolima en los últimos años, liderando políticas de fomento, acceso a mercados internacionales y apoyo a las 38.000 familias caficultoras del departamento durante su mandato 2024-2027.',
    representante: { nombre: 'Adriana Magali Matiz', cargo: 'Gobernadora del Tolima', initials: 'AMM', badge: '🏆 Mayor promotora del café tolimense' },
    chips: ['📋 Mandato 2024–2027', '🌿 38 municipios', '🏛️ Gobernación Tolima'],
    destacado: true,
  },
  {
    id: 'comite', nombre: 'Comité de Cafeteros del Tolima', emoji: '☕', color: '#B8860B',
    rol: 'Co-organizador', web: 'https://federacioncafe.co',
    descripcion: 'El Comité Departamental de Cafeteros del Tolima representa a 38.000 familias caficultoras en 38 municipios. Brinda asistencia técnica, acceso a mercados, programas de sostenibilidad y es el principal aliado de los productores tolimenses.',
    representante: null,
    chips: ['👨‍🌾 38.000+ familias', '☕ 38 municipios', '📊 100% Tolima'],
    destacado: true,
  },
  {
    id: 'alcaldia', nombre: 'Alcaldía de Chaparral', emoji: '🏙️', color: '#00695C',
    rol: 'Sede Anfitriona', web: 'https://www.chaparral-tolima.gov.co',
    descripcion: 'La Alcaldía de Chaparral es el municipio anfitrión de la Feria Internacional del Café 2026, liderando el desarrollo social, cultural y cafetero del sur del Tolima y promoviendo el turismo rural en la región.',
    representante: null,
    chips: ['🌟 Sede Oficial 2026', '🗺️ Sur del Tolima', '🤝 Anfitrión'],
    destacado: false,
  },
  {
    id: 'utolima', nombre: 'Universidad del Tolima', emoji: '🎓', color: '#6A1B9A',
    rol: 'Aliado Académico', web: 'https://ut.edu.co',
    descripcion: 'La Universidad del Tolima aporta su capacidad investigativa y académica para el desarrollo de la caficultura regional, con programas de agronomía, biotecnología aplicada al café y formación de jóvenes caficultores del Tolima.',
    representante: null,
    chips: ['🔬 Investigación cafetera', '📚 Agronomía', '🌱 Innovación'],
    destacado: false,
  },
];

interface Patrocinador { nombre: string; sector: string; emoji: string; web?: string }
const PATROCINADORES: Record<'platino' | 'diamante' | 'oro', Patrocinador[]> = {
  platino: [
    { nombre: 'Banco Agrario de Colombia', sector: 'Financiero', emoji: '🏦', web: 'https://bancoagrario.gov.co' },
    { nombre: 'Federación Nacional de Cafeteros', sector: 'Gremial', emoji: '🌿', web: 'https://federacioncafe.co' },
  ],
  diamante: [
    { nombre: 'Bancamía', sector: 'Microfinanzas', emoji: '💳', web: 'https://bancamia.com.co' },
    { nombre: 'Cortolima', sector: 'Ambiental', emoji: '🌲', web: 'https://cortolima.gov.co' },
    { nombre: 'ProColombia', sector: 'Exportaciones', emoji: '🌍', web: 'https://procolombia.co' },
  ],
  oro: [
    { nombre: 'Cámara de Comercio del Tolima', sector: 'Empresarial', emoji: '💼' },
    { nombre: 'SENA Tolima', sector: 'Formación', emoji: '📘' },
    { nombre: 'Cooperativa Caficultores', sector: 'Cooperativo', emoji: '🤝' },
  ],
};

const TIER_CONFIG = {
  platino: { label: 'PLATINO', color: '#9E9E9E', gradient: ['#757575', '#BDBDBD'] as [string,string], emoji: '💎' },
  diamante:{ label: 'DIAMANTE', color: '#4FC3F7', gradient: ['#0288D1', '#29B6F6'] as [string,string], emoji: '💠' },
  oro:     { label: 'ORO',      color: '#B8860B', gradient: ['#8B6308', '#C8960C'] as [string,string], emoji: '🥇' },
};

export default function AuspiciadoresScreen() {
  const { t } = useTranslation();
  const nav = useNavigation();
  const [expandedSponsor, setExpandedSponsor] = useState<string | null>(null);

  const featured = ALIADOS.filter(a => a.destacado);
  const others   = ALIADOS.filter(a => !a.destacado);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#2C1A0E" />

      {/* Header */}
      <LinearGradient colors={['#2C1A0E', '#5C3520', '#8B4A22']} style={s.headerGrad}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>{t('aliados.title', 'ALIADOS FERIA')}</Text>
          <Text style={s.headerSub}>{t('aliados.subtitle', 'Entidades que hacen posible la Feria 2026')}</Text>
        </View>
        <Text style={s.headerEmoji}>🤝</Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Aliados Principales ─────────────────────────────────────────── */}
        {featured.map(aliado => (
          <View key={aliado.id} style={[s.featuredCard, { borderTopColor: aliado.color }]}>
            <View style={[s.roleBadge, { backgroundColor: aliado.color }]}>
              <Text style={s.roleText}>⭐ {aliado.rol}</Text>
            </View>
            <View style={s.featuredRow}>
              <View style={[s.logoCircle, { borderColor: aliado.color, backgroundColor: aliado.color + '12' }]}>
                <Text style={s.logoEmoji}>{aliado.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.featuredName}>{aliado.nombre}</Text>
                {aliado.representante && (
                  <View style={s.govCard}>
                    <View style={s.govAvatar}>
                      <Text style={s.govInitials}>{aliado.representante.initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.govCargo}>{aliado.representante.cargo.toUpperCase()}</Text>
                      <Text style={s.govNombre}>{aliado.representante.nombre}</Text>
                      <View style={s.govBadge}>
                        <Text style={s.govBadgeText}>{aliado.representante.badge}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>
            <Text style={s.featuredDesc}>{aliado.descripcion}</Text>
            <View style={s.chipsRow}>
              {aliado.chips.map((chip, i) => (
                <View key={i} style={s.chip}><Text style={s.chipText}>{chip}</Text></View>
              ))}
            </View>
            {aliado.web ? (
              <TouchableOpacity style={[s.webBtn, { borderColor: aliado.color }]} onPress={() => Linking.openURL(aliado.web)}>
                <Text style={s.webBtnIcon}>🌐</Text>
                <Text style={[s.webBtnText, { color: aliado.color }]}>{t('aliados.website', 'Sitio Web Oficial')}</Text>
                <Text style={[s.webBtnArrow, { color: aliado.color }]}>→</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))}

        {/* ── Aliados Estratégicos ────────────────────────────────────────── */}
        <View style={s.sectionHeader}>
          <View style={s.sectionLine} />
          <Text style={s.sectionTitle}>{t('aliados.allies_section', 'ALIADOS ESTRATÉGICOS')}</Text>
          <View style={s.sectionLine} />
        </View>

        {others.map(aliado => (
          <View key={aliado.id} style={[s.aliadoCard, { borderLeftColor: aliado.color }]}>
            <View style={[s.aliadoIcon, { backgroundColor: aliado.color + '18', borderColor: aliado.color + '50' }]}>
              <Text style={s.aliadoEmoji}>{aliado.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={s.aliadoTop}>
                <Text style={s.aliadoNombre}>{aliado.nombre}</Text>
                <View style={[s.rolePill, { backgroundColor: aliado.color + '18', borderColor: aliado.color + '50' }]}>
                  <Text style={[s.rolePillText, { color: aliado.color }]}>{aliado.rol}</Text>
                </View>
              </View>
              <Text style={s.aliadoDesc}>{aliado.descripcion}</Text>
              {aliado.web ? (
                <TouchableOpacity onPress={() => Linking.openURL(aliado.web)} style={s.aliadoWebLink}>
                  <Text style={[s.aliadoWebText, { color: aliado.color }]}>🌐 {aliado.web.replace('https://', '')}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ))}

        {/* ── Patrocinadores ─────────────────────────────────────────────── */}
        <View style={[s.sectionHeader, { marginTop: 10 }]}>
          <View style={s.sectionLine} />
          <Text style={s.sectionTitle}>{t('aliados.sponsors_section', 'PATROCINADORES')}</Text>
          <View style={s.sectionLine} />
        </View>

        {(['platino', 'diamante', 'oro'] as const).map(tier => {
          const cfg = TIER_CONFIG[tier];
          const isExp = expandedSponsor === tier;
          return (
            <View key={tier} style={[s.tierBlock, { borderTopColor: cfg.color }]}>
              <TouchableOpacity onPress={() => setExpandedSponsor(isExp ? null : tier)} style={s.tierHeader}>
                <LinearGradient colors={cfg.gradient} style={s.tierGrad}>
                  <Text style={s.tierEmoji}>{cfg.emoji}</Text>
                  <Text style={s.tierLabel}>{cfg.label}</Text>
                  <Text style={s.tierCount}>{PATROCINADORES[tier].length} empresas</Text>
                  <Text style={[s.tierChevron, isExp && s.tierChevronUp]}>›</Text>
                </LinearGradient>
              </TouchableOpacity>
              {isExp && (
                <View style={s.tierContent}>
                  {PATROCINADORES[tier].map((pat, i) => (
                    <TouchableOpacity
                      key={i}
                      style={s.patCard}
                      onPress={() => pat.web && Linking.openURL(pat.web)}
                      activeOpacity={pat.web ? 0.75 : 1}
                    >
                      <View style={[s.patCircle, { backgroundColor: cfg.color + '18', borderColor: cfg.color + '50' }]}>
                        <Text style={s.patEmoji}>{pat.emoji}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.patNombre}>{pat.nombre}</Text>
                        <Text style={s.patSector}>{pat.sector}</Text>
                      </View>
                      {pat.web && <Text style={[s.patArrow, { color: cfg.color }]}>→</Text>}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* Footer */}
        <View style={s.footerCard}>
          <Text style={s.footerTitle}>{t('aliados.footer_title', '🌿 JUNTOS POR EL CAFÉ DEL TOLIMA')}</Text>
          <Text style={s.footerText}>{t('aliados.footer_text', 'La Feria Internacional del Café de Chaparral 2026 es posible gracias a la unión de entidades públicas y privadas comprometidas con el desarrollo sostenible de la caficultura tolimense.')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: T.bg },
  headerGrad:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 18, gap: 10 },
  backBtn:         { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backIcon:        { fontSize: 26, color: '#FFF', lineHeight: 30, fontWeight: '300' },
  headerTitle:     { fontSize: 16, fontWeight: '900', color: '#FFF', letterSpacing: 1.5 },
  headerSub:       { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  headerEmoji:     { fontSize: 24 },
  scroll:          { padding: 16, paddingBottom: 40 },
  featuredCard:    { backgroundColor: T.card, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: T.border, borderTopWidth: 4, shadowColor: T.dark, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  roleBadge:       { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 12 },
  roleText:        { fontSize: 10, fontWeight: '900', color: '#FFF', letterSpacing: 0.8 },
  featuredRow:     { flexDirection: 'row', gap: 12, marginBottom: 12 },
  logoCircle:      { width: 64, height: 64, borderRadius: 32, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logoEmoji:       { fontSize: 30 },
  featuredName:    { fontSize: 16, fontWeight: '900', color: T.dark, marginBottom: 8, lineHeight: 22 },
  govCard:         { flexDirection: 'row', gap: 10, backgroundColor: T.amberPale, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: T.gold + '50' },
  govAvatar:       { width: 46, height: 46, borderRadius: 23, backgroundColor: T.gold + '30', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: T.gold },
  govInitials:     { fontSize: 12, fontWeight: '900', color: T.gold },
  govCargo:        { fontSize: 8, color: T.muted, letterSpacing: 1.5, marginBottom: 2 },
  govNombre:       { fontSize: 13, fontWeight: '900', color: T.dark, marginBottom: 5 },
  govBadge:        { backgroundColor: T.gold + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  govBadgeText:    { fontSize: 9, color: T.gold, fontWeight: '800' },
  featuredDesc:    { fontSize: 12, color: T.body, lineHeight: 19, marginBottom: 12 },
  chipsRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  chip:            { backgroundColor: T.bg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: T.border },
  chipText:        { fontSize: 10, color: T.body, fontWeight: '600' },
  webBtn:          { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  webBtnIcon:      { fontSize: 16 },
  webBtnText:      { flex: 1, fontSize: 13, fontWeight: '700' },
  webBtnArrow:     { fontSize: 18, fontWeight: '900' },
  sectionHeader:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: 4 },
  sectionLine:     { flex: 1, height: 1, backgroundColor: T.border },
  sectionTitle:    { fontSize: 9, fontWeight: '900', color: T.gold, letterSpacing: 2 },
  aliadoCard:      { flexDirection: 'row', gap: 12, backgroundColor: T.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: T.border, borderLeftWidth: 4 },
  aliadoIcon:      { width: 50, height: 50, borderRadius: 25, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  aliadoEmoji:     { fontSize: 24 },
  aliadoTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5, gap: 8 },
  aliadoNombre:    { fontSize: 13, fontWeight: '800', color: T.dark, flex: 1 },
  rolePill:        { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },
  rolePillText:    { fontSize: 9, fontWeight: '900' },
  aliadoDesc:      { fontSize: 11, color: T.muted, lineHeight: 16, marginBottom: 6 },
  aliadoWebLink:   { alignSelf: 'flex-start' },
  aliadoWebText:   { fontSize: 10, fontWeight: '700' },
  tierBlock:       { marginBottom: 12, borderRadius: 14, overflow: 'hidden', borderTopWidth: 3, borderTopColor: T.border },
  tierHeader:      { borderRadius: 14, overflow: 'hidden' },
  tierGrad:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  tierEmoji:       { fontSize: 22 },
  tierLabel:       { flex: 1, fontSize: 14, fontWeight: '900', color: '#FFF', letterSpacing: 1.5 },
  tierCount:       { fontSize: 10, color: 'rgba(255,255,255,0.7)' },
  tierChevron:     { fontSize: 22, color: 'rgba(255,255,255,0.7)', transform: [{ rotate: '90deg' }] },
  tierChevronUp:   { transform: [{ rotate: '-90deg' }] },
  tierContent:     { backgroundColor: T.card, borderWidth: 1, borderTopWidth: 0, borderColor: T.border, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, padding: 12, gap: 8 },
  patCard:         { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: T.bg, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: T.border },
  patCircle:       { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  patEmoji:        { fontSize: 20 },
  patNombre:       { fontSize: 13, fontWeight: '800', color: T.dark, marginBottom: 2 },
  patSector:       { fontSize: 10, color: T.muted },
  patArrow:        { fontSize: 18, fontWeight: '900' },
  footerCard:      { backgroundColor: T.greenPale, borderRadius: 16, padding: 18, marginTop: 8, borderWidth: 1, borderColor: T.green + '30' },
  footerTitle:     { fontSize: 12, fontWeight: '900', color: T.green, letterSpacing: 0.8, marginBottom: 8 },
  footerText:      { fontSize: 12, color: T.body, lineHeight: 19 },
});
