import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AGENDA, EventoAgenda } from '../../data/mockData';

const C = { bg: '#0B1608', card: '#142210', card2: '#1C3018', gold: '#CFA020', goldLight: '#EAC040', text: '#F3EED6', muted: '#6A8060' };

const TYPE_COLORS: Record<EventoAgenda['tipo'], string> = {
  apertura: '#CFA020', cata: '#2E7D32', subasta: '#C62828',
  taller: '#1565C0', premiacion: '#7B1FA2', cultural: '#00695C', conferencia: '#37474F',
};
const TYPE_LABELS: Record<EventoAgenda['tipo'], string> = {
  apertura: 'Apertura', cata: 'Cata', subasta: 'Subasta',
  taller: 'Taller', premiacion: 'Premiación', cultural: 'Cultural', conferencia: 'Conferencia',
};

const DIAS = [
  { key: 1, label: 'Jue 29 May' },
  { key: 2, label: 'Vie 30 May' },
  { key: 3, label: 'Sáb 31 May' },
];

export default function AgendaScreen() {
  const { t } = useTranslation();
  const nav = useNavigation();
  const [diaActivo, setDiaActivo] = useState(1);
  const eventos = AGENDA.filter(e => e.dia === diaActivo);

  return (
    <LinearGradient colors={[C.bg, '#0F1E0B', C.bg]} style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={s.backBtn}>
          <Text style={s.backText}>‹ Volver</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{t('agenda.title', 'AGENDA DEL EVENTO')}</Text>
          <Text style={s.subtitle}>{t('agenda.subtitle', 'Feria Internacional del Café · Chaparral 2026')}</Text>
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
              {/* Timeline line */}
              {idx < eventos.length - 1 && <View style={[s.timeline, { backgroundColor: color + '40' }]} />}

              <View style={[s.timeDot, { backgroundColor: color }]} />

              <View style={s.eventContent}>
                <View style={s.eventTopRow}>
                  <Text style={s.eventTime}>{evento.hora}</Text>
                  <View style={[s.typeBadge, { backgroundColor: color + '33', borderColor: color }]}>
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

        {/* Day Summary */}
        <View style={s.summary}>
          <Text style={s.summaryText}>
            {eventos.length} eventos programados · {eventos.filter(e => e.tipo === 'subasta').length > 0 ? '🔴 Incluye subasta en vivo' : 'Sin subasta este día'}
          </Text>
        </View>
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
  tabs: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 14, gap: 10 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.card2, alignItems: 'center' },
  tabActive: { backgroundColor: C.gold, borderColor: C.gold },
  tabText: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 0.5 },
  tabTextActive: { color: C.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 8 },
  eventCard: { flexDirection: 'row', marginBottom: 4, paddingLeft: 12 },
  timeline: { position: 'absolute', left: 17, top: 28, bottom: -4, width: 2 },
  timeDot: { width: 12, height: 12, borderRadius: 6, marginTop: 16, marginRight: 14, flexShrink: 0 },
  eventContent: { flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: C.card2 },
  eventTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  eventTime: { fontSize: 18, fontWeight: '900', color: C.gold },
  typeBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  typeText: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  eventTitle: { fontSize: 14, fontWeight: '800', color: C.text, marginBottom: 6, lineHeight: 20 },
  venueRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  venueIcon: { fontSize: 11 },
  venueText: { fontSize: 11, color: C.muted },
  eventDesc: { fontSize: 12, color: C.muted, lineHeight: 18 },
  summary: { backgroundColor: C.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.card2, marginTop: 8 },
  summaryText: { fontSize: 12, color: C.muted, textAlign: 'center' },
});
