import React from 'react';
import {
  SafeAreaView, StatusBar, ScrollView, View, Text,
  TouchableOpacity, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { LOTES_SUBASTA } from '../../data/mockData';
import { T, CoffeePlantBg } from '../../components/FeriaHomeSections';

const sorted = [...LOTES_SUBASTA].sort((a, b) => b.sca - a.sca);

export default function Top40CafesScreen() {
  const nav = useNavigation<any>();

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <CoffeePlantBg />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={s.backBtn} activeOpacity={0.8}>
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>🏆 TOP 40 CAFÉS ESPECIALES</Text>
          <Text style={s.headerSub}>Feria Internacional del Café · Chaparral 2026</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Legend */}
        <View style={s.legend}>
          <LinearGradient colors={[T.parchment, '#FFFBF0']} style={StyleSheet.absoluteFill} />
          <Text style={s.legendText}>Ordenados por puntaje SCA · Toca un lote activo para ver la subasta</Text>
        </View>

        {sorted.map((lot, idx) => {
          const medal  = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
          const barPct = Math.max(((lot.sca - 80) / (92 - 80)) * 100, 6);
          const barColor = idx === 0 ? '#B8860B' : idx === 1 ? '#9B7B5A' : idx === 2 ? '#C0892A' : T.amber;

          return (
            <TouchableOpacity
              key={lot.id}
              style={s.card}
              onPress={() => lot.activa && nav.navigate('AuctionLive', { lotId: lot.id })}
              activeOpacity={lot.activa ? 0.8 : 1}
            >
              {/* rank */}
              <View style={s.rankCol}>
                <Text style={[s.medal, { color: idx < 3 ? barColor : T.muted }]}>{medal}</Text>
              </View>

              {/* info */}
              <View style={{ flex: 1 }}>
                <View style={s.nameRow}>
                  <Text style={s.finca} numberOfLines={1}>{lot.finca}</Text>
                  {lot.activa && (
                    <View style={s.livePill}><Text style={s.livePillText}>LIVE</Text></View>
                  )}
                </View>
                <Text style={s.meta}>{lot.variedad} · {lot.proceso} · ⛰️ {lot.altitud} m · ⚖️ {lot.peso_kg} kg</Text>
                <Text style={s.caficultor}>☕ {lot.caficultor}</Text>
                <View style={s.notes}>
                  {lot.notas.map((n, i) => (
                    <View key={i} style={s.noteChip}><Text style={s.noteText}>{n}</Text></View>
                  ))}
                </View>
                <View style={s.barBg}>
                  <View style={[s.barFill, { width: `${barPct}%` as any, backgroundColor: barColor }]} />
                </View>
              </View>

              {/* score */}
              <View style={s.scoreCol}>
                <LinearGradient colors={idx < 3 ? [T.amber, T.amberDark] : [T.parchment, T.parchDark]} style={s.scoreBadge}>
                  <Text style={[s.scoreNum, { color: idx < 3 ? '#FFF8E0' : T.amberDark }]}>{lot.sca.toFixed(1)}</Text>
                  <Text style={[s.scoreLbl, { color: idx < 3 ? 'rgba(255,248,224,0.8)' : T.muted }]}>SCA</Text>
                </LinearGradient>
                <Text style={s.usd}>${(lot.puja_actual_usd / 1000).toFixed(1)}k USD</Text>
                {!lot.activa && <Text style={s.adjudicado}>🔒 Adjudicado</Text>}
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: T.bg },
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, gap: 12 },
  backBtn:     { backgroundColor: T.card, borderRadius: 20, width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: T.borderMed },
  backArrow:   { fontSize: 22, color: T.coffee, fontWeight: '900', lineHeight: 26 },
  headerTitle: { fontSize: 13, fontWeight: '900', color: T.dark, letterSpacing: 0.5 },
  headerSub:   { fontSize: 9, color: T.muted, marginTop: 1 },
  scroll:      { paddingHorizontal: 16, paddingBottom: 40 },
  legend:      { borderRadius: 12, borderWidth: 1, borderColor: T.border, padding: 10, marginBottom: 14, overflow: 'hidden', alignItems: 'center' },
  legendText:  { fontSize: 10, color: T.muted, textAlign: 'center' },
  card:        { flexDirection: 'row', backgroundColor: T.card, borderRadius: 16, borderWidth: 1, borderColor: T.border, padding: 14, marginBottom: 10, gap: 10, alignItems: 'flex-start' },
  rankCol:     { width: 36, alignItems: 'center', paddingTop: 2 },
  medal:       { fontSize: 20, fontWeight: '900' },
  nameRow:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  finca:       { fontSize: 13, fontWeight: '900', color: T.dark, flex: 1 },
  meta:        { fontSize: 10, color: T.muted, marginBottom: 2 },
  caficultor:  { fontSize: 10, color: T.coffee, fontWeight: '600', marginBottom: 6 },
  notes:       { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
  noteChip:    { backgroundColor: T.amberPale, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: T.border },
  noteText:    { fontSize: 9, color: T.coffee },
  barBg:       { height: 4, backgroundColor: T.parchDark, borderRadius: 2, overflow: 'hidden' },
  barFill:     { height: '100%', borderRadius: 2 },
  scoreCol:    { alignItems: 'center', minWidth: 58 },
  scoreBadge:  { borderRadius: 10, padding: 8, alignItems: 'center', minWidth: 52, marginBottom: 4 },
  scoreNum:    { fontSize: 18, fontWeight: '900' },
  scoreLbl:    { fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  usd:         { fontSize: 9, color: T.muted, textAlign: 'center' },
  adjudicado:  { fontSize: 8, color: T.muted, marginTop: 2 },
  livePill:    { backgroundColor: '#C62828', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  livePillText:{ fontSize: 7, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
});
