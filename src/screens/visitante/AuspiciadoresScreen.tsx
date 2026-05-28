import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AUSPICIADORES } from '../../data/mockData';

const T = {
  bg: '#FAF7F0', card: '#FFFFFF', dark: '#2C1810', body: '#4A3728',
  muted: '#8A7060', gold: '#B8860B', goldPale: '#F5E6B0',
  green: '#2D5A1E', greenPale: '#E8F2E4', border: '#E8D5B0',
};

export default function AuspiciadoresScreen() {
  const { t } = useTranslation();
  const nav = useNavigation();

  const featured = AUSPICIADORES.filter(a => a.destacado);
  const others   = AUSPICIADORES.filter(a => !a.destacado);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Text style={s.backIcon}>‹</Text>
          <Text style={s.backText}>Volver</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{t('sponsors.title', 'AUSPICIADORES')}</Text>
          <Text style={s.subtitle}>Entidades que hacen posible la Feria 2026</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Featured Sponsors */}
        {featured.map((auspiciador) => {
          const isGob = auspiciador.id === 'gob_tolima';
          const accentColor = isGob ? '#1565C0' : T.green;
          return (
            <View key={auspiciador.id} style={[s.featuredCard, { borderTopColor: accentColor }]}>
              <View style={[s.roleBadge, { backgroundColor: accentColor }]}>
                <Text style={s.roleText}>⭐ {auspiciador.rol}</Text>
              </View>

              <View style={[s.logoPlaceholder, { borderColor: auspiciador.color }]}>
                <Text style={s.logoEmoji}>{auspiciador.emoji}</Text>
              </View>

              <Text style={s.featuredName}>{auspiciador.nombre}</Text>

              {auspiciador.cargo && (
                <View style={s.governorCard}>
                  <View style={s.governorAvatar}>
                    <Text style={s.governorAvatarText}>AMM</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.governorLabel}>GOBERNADORA DEL TOLIMA</Text>
                    <Text style={s.governorName}>Adriana Magali Matiz</Text>
                    <View style={s.governorBadge}>
                      <Text style={s.governorBadgeText}>🏆 Impulsora del café tolimense</Text>
                    </View>
                  </View>
                </View>
              )}

              <Text style={s.featuredDesc}>{auspiciador.descripcion}</Text>

              <View style={s.featuredStats}>
                {auspiciador.id === 'gob_tolima' && (
                  <>
                    <View style={s.statChip}><Text style={s.statChipText}>📋 Mandato 2024-2027</Text></View>
                    <View style={s.statChip}><Text style={s.statChipText}>🌿 +38 Municipios</Text></View>
                    <View style={s.statChip}><Text style={s.statChipText}>🏛️ Gobernación Tolima</Text></View>
                  </>
                )}
                {auspiciador.id === 'comite_cafeteros' && (
                  <>
                    <View style={s.statChip}><Text style={s.statChipText}>👨‍🌾 38.000+ familias</Text></View>
                    <View style={s.statChip}><Text style={s.statChipText}>☕ 38 Municipios</Text></View>
                    <View style={s.statChip}><Text style={s.statChipText}>📊 100% Tolima</Text></View>
                  </>
                )}
              </View>
            </View>
          );
        })}

        {/* Aliados */}
        <View style={s.sectionHeader}>
          <View style={s.sectionLine} />
          <Text style={s.sectionTitle}>ALIADOS ESTRATÉGICOS</Text>
          <View style={s.sectionLine} />
        </View>

        {others.map((auspiciador) => (
          <View key={auspiciador.id} style={[s.aliadoCard, { borderLeftColor: auspiciador.color }]}>
            <View style={[s.aliadoIcon, { backgroundColor: auspiciador.color + '18', borderColor: auspiciador.color + '50' }]}>
              <Text style={s.aliadoEmoji}>{auspiciador.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={s.aliadoTopRow}>
                <Text style={s.aliadoNombre}>{auspiciador.nombre}</Text>
                <View style={[s.rolePill, { backgroundColor: auspiciador.color + '18', borderColor: auspiciador.color + '50' }]}>
                  <Text style={[s.rolePillText, { color: auspiciador.color }]}>{auspiciador.rol}</Text>
                </View>
              </View>
              <Text style={s.aliadoDesc}>{auspiciador.descripcion}</Text>
            </View>
          </View>
        ))}

        {/* Footer */}
        <View style={s.footerCard}>
          <Text style={s.footerTitle}>🌿 JUNTOS POR EL CAFÉ DEL TOLIMA</Text>
          <Text style={s.footerText}>
            La Feria Internacional del Café de Chaparral 2026 es posible gracias a la unión de entidades públicas y privadas comprometidas con el desarrollo sostenible de la caficultura tolimense.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: T.bg },
  header:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: T.border },
  backBtn:           { flexDirection: 'row', alignItems: 'center', gap: 2, marginRight: 12 },
  backIcon:          { fontSize: 28, color: T.green, lineHeight: 32, fontWeight: '300' },
  backText:          { fontSize: 15, color: T.green, fontWeight: '600' },
  title:             { fontSize: 14, fontWeight: '900', color: T.dark, letterSpacing: 0.5 },
  subtitle:          { fontSize: 10, color: T.muted, marginTop: 2 },
  scroll:            { padding: 16, paddingBottom: 40 },
  featuredCard:      { backgroundColor: T.card, borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: T.border, borderTopWidth: 4 },
  roleBadge:         { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 14 },
  roleText:          { fontSize: 10, fontWeight: '900', color: '#FFF', letterSpacing: 0.8 },
  logoPlaceholder:   { width: 68, height: 68, borderRadius: 34, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 12, backgroundColor: T.bg },
  logoEmoji:         { fontSize: 32 },
  featuredName:      { fontSize: 19, fontWeight: '900', color: T.dark, marginBottom: 12, lineHeight: 24 },
  governorCard:      { flexDirection: 'row', gap: 12, backgroundColor: T.goldPale, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: T.gold + '50' },
  governorAvatar:    { width: 52, height: 52, borderRadius: 26, backgroundColor: T.gold + '30', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: T.gold },
  governorAvatarText:{ fontSize: 13, fontWeight: '900', color: T.gold },
  governorLabel:     { fontSize: 9, color: T.muted, letterSpacing: 1.5, marginBottom: 2 },
  governorName:      { fontSize: 15, fontWeight: '900', color: T.dark, marginBottom: 6 },
  governorBadge:     { backgroundColor: T.gold + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  governorBadgeText: { fontSize: 10, color: T.gold, fontWeight: '800' },
  featuredDesc:      { fontSize: 13, color: T.body, lineHeight: 20, marginBottom: 12 },
  featuredStats:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statChip:          { backgroundColor: T.bg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: T.border },
  statChipText:      { fontSize: 10, color: T.body, fontWeight: '600' },
  sectionHeader:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: 4 },
  sectionLine:       { flex: 1, height: 1, backgroundColor: T.border },
  sectionTitle:      { fontSize: 9, fontWeight: '900', color: T.gold, letterSpacing: 2 },
  aliadoCard:        { flexDirection: 'row', gap: 12, backgroundColor: T.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: T.border, borderLeftWidth: 4 },
  aliadoIcon:        { width: 50, height: 50, borderRadius: 25, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  aliadoEmoji:       { fontSize: 24 },
  aliadoTopRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5, gap: 8 },
  aliadoNombre:      { fontSize: 14, fontWeight: '800', color: T.dark, flex: 1 },
  rolePill:          { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },
  rolePillText:      { fontSize: 9, fontWeight: '900' },
  aliadoDesc:        { fontSize: 12, color: T.muted, lineHeight: 17 },
  footerCard:        { backgroundColor: T.greenPale, borderRadius: 16, padding: 18, marginTop: 8, borderWidth: 1, borderColor: T.green + '30' },
  footerTitle:       { fontSize: 12, fontWeight: '900', color: T.green, letterSpacing: 0.8, marginBottom: 8 },
  footerText:        { fontSize: 12, color: T.body, lineHeight: 19 },
});
