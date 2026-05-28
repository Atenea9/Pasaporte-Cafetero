import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AUSPICIADORES } from '../../data/mockData';

const C = { bg: '#0B1608', card: '#142210', card2: '#1C3018', gold: '#CFA020', goldLight: '#EAC040', text: '#F3EED6', muted: '#6A8060' };

export default function AuspiciadoresScreen() {
  const { t } = useTranslation();
  const nav = useNavigation();

  const featured = AUSPICIADORES.filter(a => a.destacado);
  const others = AUSPICIADORES.filter(a => !a.destacado);

  return (
    <LinearGradient colors={[C.bg, '#0F1E0B', C.bg]} style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={s.backBtn}>
          <Text style={s.backText}>‹ Volver</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{t('sponsors.title', 'AUSPICIADORES')}</Text>
          <Text style={s.subtitle}>{t('sponsors.subtitle', 'Entidades que hacen posible la Feria 2026')}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Featured Sponsors */}
        {featured.map((auspiciador) => {
          const isGob = auspiciador.id === 'gob_tolima';
          return (
            <LinearGradient
              key={auspiciador.id}
              colors={isGob ? ['#1565C0', '#0D3B7A', C.card] : ['#1B5E20', '#0D3B15', C.card]}
              style={s.featuredCard}
            >
              {/* Role Badge */}
              <View style={[s.roleBadge, { backgroundColor: isGob ? '#1565C0' : '#1B5E20' }]}>
                <Text style={s.roleText}>⭐  {t(`sponsors.${auspiciador.id === 'gob_tolima' ? 'main_sponsor' : 'co_organizer'}`, auspiciador.rol)}</Text>
              </View>

              {/* Logo placeholder */}
              <View style={[s.logoPlaceholder, { borderColor: auspiciador.color }]}>
                <Text style={s.logoEmoji}>{auspiciador.emoji}</Text>
              </View>

              <Text style={s.featuredName}>{auspiciador.nombre}</Text>

              {/* Special highlight for Gobernadora */}
              {auspiciador.cargo && (
                <View style={s.governorCard}>
                  <View style={s.governorLeft}>
                    <View style={s.governorAvatarPlaceholder}>
                      <Text style={s.governorAvatarText}>AMM</Text>
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.governorLabel}>GOBERNADORA DEL TOLIMA</Text>
                    <Text style={s.governorName}>Adriana Magali Matiz</Text>
                    <View style={s.governorBadge}>
                      <Text style={s.governorBadgeText}>🏆  {t('sponsors.governor_highlight', 'Impulsora del café tolimense')}</Text>
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
            </LinearGradient>
          );
        })}

        {/* Other Sponsors */}
        <Text style={s.sectionTitle}>ALIADOS ESTRATÉGICOS</Text>
        {others.map((auspiciador) => (
          <View key={auspiciador.id} style={s.aliadoCard}>
            <View style={[s.aliadoIcon, { backgroundColor: auspiciador.color + '33', borderColor: auspiciador.color }]}>
              <Text style={s.aliadoEmoji}>{auspiciador.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={s.aliadoTopRow}>
                <Text style={s.aliadoNombre}>{auspiciador.nombre}</Text>
                <View style={[s.rolePill, { backgroundColor: auspiciador.color + '22', borderColor: auspiciador.color }]}>
                  <Text style={[s.rolePillText, { color: auspiciador.color }]}>{auspiciador.rol}</Text>
                </View>
              </View>
              <Text style={s.aliadoDesc}>{auspiciador.descripcion}</Text>
            </View>
          </View>
        ))}

        {/* Footer Message */}
        <LinearGradient colors={['#2A1F00', C.card]} style={s.footerCard}>
          <Text style={s.footerTitle}>🌿 JUNTOS POR EL CAFÉ DE TOLIMA</Text>
          <Text style={s.footerText}>
            La Feria Internacional del Café de Chaparral 2026 es posible gracias a la unión de entidades públicas y privadas comprometidas con el desarrollo sostenible de la caficultura tolimense y su proyección en los mercados internacionales.
          </Text>
        </LinearGradient>
      </ScrollView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 54, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.card2 },
  backBtn: { marginRight: 12, paddingBottom: 2 },
  backText: { fontSize: 16, color: C.gold, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '900', color: C.text, letterSpacing: 1 },
  subtitle: { fontSize: 10, color: C.muted, marginTop: 2 },
  scroll: { padding: 20, paddingBottom: 40 },
  featuredCard: { borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: C.card2 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 16 },
  roleText: { fontSize: 10, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  logoPlaceholder: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 14, backgroundColor: 'rgba(255,255,255,0.08)' },
  logoEmoji: { fontSize: 32 },
  featuredName: { fontSize: 20, fontWeight: '900', color: C.text, marginBottom: 14, lineHeight: 24 },
  governorCard: { flexDirection: 'row', gap: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: C.gold + '44' },
  governorLeft: {},
  governorAvatarPlaceholder: { width: 54, height: 54, borderRadius: 27, backgroundColor: C.gold + '44', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.gold },
  governorAvatarText: { fontSize: 13, fontWeight: '900', color: C.gold },
  governorLabel: { fontSize: 9, color: C.muted, letterSpacing: 1.5, marginBottom: 2 },
  governorName: { fontSize: 16, fontWeight: '900', color: C.goldLight, marginBottom: 6 },
  governorBadge: { backgroundColor: C.gold + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  governorBadgeText: { fontSize: 10, color: C.gold, fontWeight: '800' },
  featuredDesc: { fontSize: 13, color: C.text, lineHeight: 20, marginBottom: 14, opacity: 0.85 },
  featuredStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statChip: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  statChipText: { fontSize: 10, color: C.text, fontWeight: '600' },
  sectionTitle: { fontSize: 10, fontWeight: '900', color: C.muted, letterSpacing: 2, marginBottom: 12, marginTop: 4 },
  aliadoCard: { flexDirection: 'row', gap: 14, backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.card2 },
  aliadoIcon: { width: 52, height: 52, borderRadius: 26, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  aliadoEmoji: { fontSize: 24 },
  aliadoTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 8 },
  aliadoNombre: { fontSize: 14, fontWeight: '900', color: C.text, flex: 1 },
  rolePill: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },
  rolePillText: { fontSize: 9, fontWeight: '900' },
  aliadoDesc: { fontSize: 12, color: C.muted, lineHeight: 17 },
  footerCard: { borderRadius: 16, padding: 18, marginTop: 8, borderWidth: 1, borderColor: C.gold + '44' },
  footerTitle: { fontSize: 12, fontWeight: '900', color: C.gold, letterSpacing: 1, marginBottom: 10 },
  footerText: { fontSize: 12, color: C.muted, lineHeight: 19 },
});
