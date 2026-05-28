import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { STANDS, SECCIONES_MAPA, getMunicipio } from '../../data/mockData';

const C = { bg: '#0B1608', card: '#142210', card2: '#1C3018', gold: '#CFA020', text: '#F3EED6', muted: '#6A8060', danger: '#E05050', green: '#4CAF50' };

export default function MapaFeriaScreen() {
  const { t } = useTranslation();
  const nav = useNavigation();
  const [seccionActiva, setSeccionActiva] = useState<string>('all');

  const standsFiltered = seccionActiva === 'all'
    ? STANDS
    : STANDS.filter(s => s.seccion === seccionActiva);

  const standsAbiertos = standsFiltered.filter(s => s.activo).length;

  return (
    <LinearGradient colors={[C.bg, '#0F1E0B', C.bg]} style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={s.backBtn}>
          <Text style={s.backText}>‹ Volver</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{t('map.title', 'MAPA DE LA FERIA')}</Text>
          <Text style={s.subtitle}>{standsAbiertos} {t('map.stands_open', 'stands abiertos')} de {standsFiltered.length} total</Text>
        </View>
      </View>

      {/* Section Filters */}
      <View style={s.filtersWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
          <TouchableOpacity
            style={[s.filterTab, seccionActiva === 'all' && s.filterTabActive]}
            onPress={() => setSeccionActiva('all')}
          >
            <Text style={[s.filterText, seccionActiva === 'all' && s.filterTextActive]}>
              🗺️ {t('map.all_sections', 'Todas')}
            </Text>
          </TouchableOpacity>
          {SECCIONES_MAPA.map(sec => (
            <TouchableOpacity
              key={sec.id}
              style={[s.filterTab, seccionActiva === sec.id && { backgroundColor: sec.color, borderColor: sec.color }]}
              onPress={() => setSeccionActiva(sec.id)}
            >
              <Text style={[s.filterText, seccionActiva === sec.id && { color: '#FFF' }]}>
                {sec.icono} {sec.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Section Info Banner */}
      {seccionActiva !== 'all' && (() => {
        const sec = SECCIONES_MAPA.find(s => s.id === seccionActiva);
        if (!sec) return null;
        return (
          <View style={[s.sectionBanner, { borderColor: sec.color }]}>
            <Text style={s.sectionBannerIcon}>{sec.icono}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.sectionBannerName, { color: sec.color }]}>{sec.nombre}</Text>
              <Text style={s.sectionBannerDesc}>{sec.descripcion}</Text>
            </View>
          </View>
        );
      })()}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {standsFiltered.map((stand) => {
          const mun = getMunicipio(stand.municipioId);
          const sec = SECCIONES_MAPA.find(s => s.id === stand.seccion);
          return (
            <View key={stand.id} style={[s.standCard, !stand.activo && s.standClosed]}>
              <View style={s.standHeader}>
                {sec && (
                  <View style={[s.secBadge, { backgroundColor: sec.color + '33', borderColor: sec.color }]}>
                    <Text style={[s.secBadgeText, { color: sec.color }]}>{sec.icono} Zona {sec.id}</Text>
                  </View>
                )}
                <View style={[s.statusDot, { backgroundColor: stand.activo ? C.green : C.danger }]} />
                <Text style={[s.statusText, { color: stand.activo ? C.green : C.danger }]}>
                  {stand.activo ? 'Abierto' : 'Cerrado'}
                </Text>
              </View>

              <Text style={s.standName}>{stand.nombre}</Text>

              {mun && (
                <View style={s.munRow}>
                  <Text style={s.munEmoji}>{mun.emoji}</Text>
                  <Text style={s.munName}>{mun.nombre}</Text>
                  <View style={[s.regionBadge, { backgroundColor: mun.color + '33' }]}>
                    <Text style={[s.regionText, { color: mun.color }]}>{mun.region}</Text>
                  </View>
                </View>
              )}

              <View style={s.productsList}>
                {stand.productos.map((prod, i) => (
                  <View key={i} style={s.productChip}>
                    <Text style={s.productText}>• {prod}</Text>
                  </View>
                ))}
              </View>

              {stand.ventas !== undefined && (
                <View style={s.ventas}>
                  <Text style={s.ventasNum}>{stand.ventas}</Text>
                  <Text style={s.ventasLbl}> ventas hoy</Text>
                </View>
              )}
            </View>
          );
        })}
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
  filtersWrap: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.card2 },
  filters: { paddingHorizontal: 20, gap: 8 },
  filterTab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.card2 },
  filterTabActive: { backgroundColor: C.gold, borderColor: C.gold },
  filterText: { fontSize: 11, fontWeight: '700', color: C.muted },
  filterTextActive: { color: C.bg },
  sectionBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 20, marginVertical: 10, backgroundColor: C.card, borderRadius: 12, borderWidth: 1, padding: 12 },
  sectionBannerIcon: { fontSize: 28 },
  sectionBannerName: { fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  sectionBannerDesc: { fontSize: 11, color: C.muted, marginTop: 2 },
  scroll: { padding: 20, paddingBottom: 40 },
  standCard: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.card2 },
  standClosed: { opacity: 0.55 },
  standHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  secBadge: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  secBadgeText: { fontSize: 9, fontWeight: '900' },
  statusDot: { width: 7, height: 7, borderRadius: 4, marginLeft: 'auto' },
  statusText: { fontSize: 10, fontWeight: '700' },
  standName: { fontSize: 16, fontWeight: '900', color: C.text, marginBottom: 8 },
  munRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  munEmoji: { fontSize: 14 },
  munName: { fontSize: 12, color: C.muted, fontWeight: '600' },
  regionBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  regionText: { fontSize: 9, fontWeight: '700' },
  productsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  productChip: { backgroundColor: C.card2, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  productText: { fontSize: 11, color: C.muted },
  ventas: { flexDirection: 'row', alignItems: 'baseline' },
  ventasNum: { fontSize: 18, fontWeight: '900', color: C.gold },
  ventasLbl: { fontSize: 11, color: C.muted },
});
