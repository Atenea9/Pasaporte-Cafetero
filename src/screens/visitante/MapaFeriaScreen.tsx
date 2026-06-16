import CopyrightFooter from '../../components/CopyrightFooter';
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { STANDS, SECCIONES_MAPA, getMunicipio } from '../../data/mockData';

const T = {
  bg: '#FAF7F0', card: '#FFFFFF', dark: '#2C1810', body: '#4A3728',
  muted: '#8A7060', gold: '#B8860B', green: '#2D5A1E', greenPale: '#E8F2E4',
  border: '#E8D5B0', accent: '#C0392B',
};

export default function MapaFeriaScreen() {
  const { t } = useTranslation();
  const nav = useNavigation();
  const [seccionActiva, setSeccionActiva] = useState<string>('all');

  const standsFiltered = seccionActiva === 'all'
    ? STANDS
    : STANDS.filter(s => s.seccion === seccionActiva);
  const standsAbiertos = standsFiltered.filter(s => s.activo).length;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={s.backBtn}>
          <Text style={s.backIcon}>‹</Text>
          <Text style={s.backText}>Volver</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{t('map.title', 'MAPA DE LA FERIA')}</Text>
          <Text style={s.subtitle}>{standsAbiertos} stands abiertos de {standsFiltered.length} total</Text>
        </View>
      </View>

      {/* Section Filters */}
      <View style={s.filtersWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
          <TouchableOpacity
            style={[s.filterTab, seccionActiva === 'all' && s.filterTabActive]}
            onPress={() => setSeccionActiva('all')}
          >
            <Text style={[s.filterText, seccionActiva === 'all' && s.filterTextActive]}>🗺️ Todas</Text>
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

      {/* Section Banner */}
      {seccionActiva !== 'all' && (() => {
        const sec = SECCIONES_MAPA.find(s => s.id === seccionActiva);
        if (!sec) return null;
        return (
          <View style={[s.sectionBanner, { borderLeftColor: sec.color }]}>
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
                  <View style={[s.secBadge, { backgroundColor: sec.color + '18', borderColor: sec.color + '50' }]}>
                    <Text style={[s.secBadgeText, { color: sec.color }]}>{sec.icono} {sec.nombre}</Text>
                  </View>
                )}
                <View style={[s.statusDot, { backgroundColor: stand.activo ? T.green : T.accent }]} />
                <Text style={[s.statusText, { color: stand.activo ? T.green : T.accent }]}>
                  {stand.activo ? 'Abierto' : 'Cerrado'}
                </Text>
              </View>

              <Text style={s.standName}>{stand.nombre}</Text>

              {mun && (
                <View style={s.munRow}>
                  <Text style={s.munEmoji}>{mun.emoji}</Text>
                  <Text style={s.munName}>{mun.nombre}</Text>
                  <View style={[s.regionBadge, { backgroundColor: mun.color + '18' }]}>
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
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: T.bg },
  header:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: T.border },
  backBtn:           { flexDirection: 'row', alignItems: 'center', gap: 2, marginRight: 12 },
  backIcon:          { fontSize: 28, color: T.green, lineHeight: 32, fontWeight: '300' },
  backText:          { fontSize: 15, color: T.green, fontWeight: '600' },
  title:             { fontSize: 15, fontWeight: '900', color: T.dark, letterSpacing: 0.5 },
  subtitle:          { fontSize: 10, color: T.muted, marginTop: 2 },
  filtersWrap:       { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.border },
  filters:           { paddingHorizontal: 16, gap: 8 },
  filterTab:         { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: T.card, borderWidth: 1, borderColor: T.border },
  filterTabActive:   { backgroundColor: T.gold, borderColor: T.gold },
  filterText:        { fontSize: 11, fontWeight: '700', color: T.muted },
  filterTextActive:  { color: '#FFF' },
  sectionBanner:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginVertical: 10, backgroundColor: T.card, borderRadius: 12, borderWidth: 1, borderColor: T.border, borderLeftWidth: 4, padding: 12 },
  sectionBannerIcon: { fontSize: 28 },
  sectionBannerName: { fontSize: 13, fontWeight: '900' },
  sectionBannerDesc: { fontSize: 11, color: T.muted, marginTop: 2 },
  scroll:            { padding: 16, paddingBottom: 40 },
  standCard:         { backgroundColor: T.card, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: T.border, shadowColor: T.dark, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  standClosed:       { opacity: 0.55 },
  standHeader:       { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  secBadge:          { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  secBadgeText:      { fontSize: 9, fontWeight: '900' },
  statusDot:         { width: 7, height: 7, borderRadius: 4, marginLeft: 'auto' },
  statusText:        { fontSize: 10, fontWeight: '700' },
  standName:         { fontSize: 16, fontWeight: '900', color: T.dark, marginBottom: 8 },
  munRow:            { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  munEmoji:          { fontSize: 14 },
  munName:           { fontSize: 12, color: T.muted, fontWeight: '600' },
  regionBadge:       { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  regionText:        { fontSize: 9, fontWeight: '700' },
  productsList:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  productChip:       { backgroundColor: T.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: T.border },
  productText:       { fontSize: 11, color: T.body },
  ventas:            { flexDirection: 'row', alignItems: 'baseline' },
  ventasNum:         { fontSize: 18, fontWeight: '900', color: T.gold },
  ventasLbl:         { fontSize: 11, color: T.muted },
});
