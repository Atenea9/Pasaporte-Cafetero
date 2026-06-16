import CopyrightFooter from '../../components/CopyrightFooter';
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AGENDA, EventoAgenda } from '../../data/mockData';

const T = {
  bg: '#FAF7F0', card: '#FFFFFF', dark: '#2C1810', body: '#4A3728',
  muted: '#8A7060', gold: '#B8860B', green: '#2D5A1E', border: '#E8D5B0',
};

const TYPE_COLORS: Record<EventoAgenda['tipo'], string> = {
  apertura: '#B8860B', cata: '#2E7D32', subasta: '#C62828',
  taller: '#1565C0', premiacion: '#7B1FA2', cultural: '#00695C', conferencia: '#37474F',
};
const TYPE_LABELS: Record<EventoAgenda['tipo'], string> = {
  apertura: 'Apertura', cata: 'Cata', subasta: 'Subasta',
  taller: 'Taller', premiacion: 'Premiación', cultural: 'Cultural', conferencia: 'Conferencia',
};
const DIAS = [
  { key: 1, label: 'Jue 14 Ago' },
  { key: 2, label: 'Vie 15 Ago' },
  { key: 3, label: 'Sáb 16 Ago' },
];

export default function AgendaScreen() {
  const { t } = useTranslation();
  const nav = useNavigation();
  const [diaActivo, setDiaActivo] = useState(1);
  const eventos = AGENDA.filter(e => e.dia === diaActivo);

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
          <Text style={s.title}>{t('agenda.title', 'AGENDA DEL EVENTO')}</Text>
          <Text style={s.subtitle}>Feria Internacional del Café · Chaparral 2026</Text>
        </View>
      </View>

      {/* Day Tabs */}
      <View style={s.tabs}>
        {DIAS.map(dia => (
          <TouchableOpacity
            key={dia.key}
            style={[s.tab, diaActivo === dia.key && s.tabActive]}
            onPress={() => setDiaActivo(dia.key)}
          >
            <Text style={[s.tabText, diaActivo === dia.key && s.tabTextActive]}>{dia.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {eventos.map((evento, idx) => {
          const color = TYPE_COLORS[evento.tipo];
          return (
            <View key={evento.id} style={s.eventCard}>
              {idx < eventos.length - 1 && <View style={[s.timeline, { backgroundColor: color + '50' }]} />}
              <View style={[s.timeDot, { backgroundColor: color }]} />
              <View style={s.eventContent}>
                <View style={s.eventTopRow}>
                  <Text style={[s.eventTime, { color }]}>{evento.hora}</Text>
                  <View style={[s.typeBadge, { backgroundColor: color + '18', borderColor: color + '60' }]}>
                    <Text style={[s.typeText, { color }]}>{TYPE_LABELS[evento.tipo]}</Text>
                  </View>
                </View>
                <Text style={s.eventTitle}>{evento.titulo}</Text>
                <View style={s.venueRow}>
                  <Text style={s.venueIcon}>📍</Text>
                  <Text style={s.venueText}>{evento.lugar}</Text>
                </View>
                <Text style={s.eventDesc}>{evento.descripcion}</Text>
              </View>
            </View>
          );
        })}

        <View style={s.summary}>
          <Text style={s.summaryText}>
            {eventos.length} eventos programados
            {eventos.filter(e => e.tipo === 'subasta').length > 0 ? ' · 🔴 Incluye subasta en vivo' : ''}
          </Text>
        </View>
        <CopyrightFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: T.bg },
  header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: T.border },
  backBtn:        { flexDirection: 'row', alignItems: 'center', gap: 2, marginRight: 12 },
  backIcon:       { fontSize: 28, color: T.green, lineHeight: 32, fontWeight: '300' },
  backText:       { fontSize: 15, color: T.green, fontWeight: '600' },
  title:          { fontSize: 15, fontWeight: '900', color: T.dark, letterSpacing: 0.5 },
  subtitle:       { fontSize: 10, color: T.muted, marginTop: 2 },
  tabs:           { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8, borderBottomWidth: 1, borderBottomColor: T.border },
  tab:            { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: T.card, borderWidth: 1, borderColor: T.border, alignItems: 'center' },
  tabActive:      { backgroundColor: T.green, borderColor: T.green },
  tabText:        { fontSize: 11, fontWeight: '700', color: T.muted },
  tabTextActive:  { color: '#FFF' },
  scroll:         { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 12 },
  eventCard:      { flexDirection: 'row', marginBottom: 4, paddingLeft: 8 },
  timeline:       { position: 'absolute', left: 13, top: 28, bottom: -4, width: 2 },
  timeDot:        { width: 12, height: 12, borderRadius: 6, marginTop: 16, marginRight: 12, flexShrink: 0 },
  eventContent:   { flex: 1, backgroundColor: T.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: T.border },
  eventTopRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  eventTime:      { fontSize: 18, fontWeight: '900' },
  typeBadge:      { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  typeText:       { fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  eventTitle:     { fontSize: 14, fontWeight: '800', color: T.dark, marginBottom: 6, lineHeight: 20 },
  venueRow:       { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  venueIcon:      { fontSize: 11 },
  venueText:      { fontSize: 11, color: T.muted },
  eventDesc:      { fontSize: 12, color: T.body, lineHeight: 18 },
  summary:        { backgroundColor: T.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: T.border, marginTop: 8 },
  summaryText:    { fontSize: 12, color: T.muted, textAlign: 'center' },
});
