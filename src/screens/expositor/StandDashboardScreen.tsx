import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { ExpositorNavProp } from '../../navigation/types';

const T = {
  bg: '#FAF7F0', card: '#FFFFFF', dark: '#2C1810', body: '#4A3728',
  muted: '#8A7060', gold: '#B8860B', goldPale: '#F5E6B0',
  green: '#2D5A1E', greenLight: '#4A8030', greenPale: '#E8F2E4',
  border: '#E8D5B0', accent: '#C0392B',
};

export default function StandDashboardScreen() {
  const nav = useNavigation<ExpositorNavProp>();
  const [active, setActive] = useState(true);

  const SECTIONS = [
    {
      icon: '📦', title: 'Catálogo de Productos',
      desc: 'Crea y gestiona los productos que venderás en la feria',
      screen: 'StandCatalog' as const,
      badge: 'Agregar productos',
      color: T.green,
    },
    {
      icon: '🌿', title: 'Perfil de la Finca',
      desc: 'Cuenta la historia de tu finca, origen y proceso del café',
      screen: 'FincaProfile' as const,
      badge: 'Editar perfil',
      color: '#5D4037',
    },
    {
      icon: '📷', title: 'Escanear Visitante',
      desc: 'Registra ventas escaneando el QR del pasaporte',
      screen: 'Scanner' as const,
      badge: 'Escanear ahora',
      color: T.gold,
    },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
            <Text style={s.backIcon}>‹</Text>
            <Text style={s.backText}>Volver</Text>
          </TouchableOpacity>
          <View style={s.headerRight}>
            <View style={[s.statusBadge, active && s.statusActive]}>
              <View style={[s.statusDot, active && s.statusDotActive]} />
              <Text style={[s.statusText, active && s.statusTextActive]}>
                {active ? 'Stand Activo' : 'Stand Inactivo'}
              </Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <LinearGradient colors={[T.green, T.greenLight]} style={s.titleCard}>
          <Text style={s.titleIcon}>🏪</Text>
          <Text style={s.titleText}>Mi Stand</Text>
          <Text style={s.titleSub}>Gestiona tu presencia en la feria</Text>
        </LinearGradient>

        {/* Sections */}
        {SECTIONS.map((sec) => (
          <TouchableOpacity key={sec.screen} style={s.sectionCard} onPress={() => nav.navigate(sec.screen)} activeOpacity={0.85}>
            <View style={[s.sectionIconBox, { backgroundColor: sec.color + '18' }]}>
              <Text style={s.sectionIcon}>{sec.icon}</Text>
            </View>
            <View style={s.sectionBody}>
              <Text style={s.sectionTitle}>{sec.title}</Text>
              <Text style={s.sectionDesc}>{sec.desc}</Text>
            </View>
            <View style={[s.sectionBadge, { backgroundColor: sec.color }]}>
              <Text style={s.sectionBadgeText}>{sec.badge}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Visitors Info */}
        <View style={s.infoCard}>
          <Text style={s.infoTitle}>ℹ️ ¿Cómo funciona el stand?</Text>
          <Text style={s.infoBody}>
            Los visitantes y compradores internacionales podrán ver tu catálogo de productos y el perfil de tu finca desde su pasaporte digital.{'\n\n'}
            Al escanear el QR del visitante cuando realizan una compra, les emites un sello de tu municipio y ellos acumulan puntos.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: T.bg },
  scroll:           { padding: 20, paddingTop: 16, paddingBottom: 40 },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn:          { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8, marginLeft: -8 },
  backIcon:         { fontSize: 28, color: T.green, lineHeight: 32, fontWeight: '300' },
  backText:         { fontSize: 15, color: T.green, fontWeight: '600' },
  headerRight:      { alignItems: 'flex-end' },
  statusBadge:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: T.card, borderWidth: 1, borderColor: T.border },
  statusActive:     { borderColor: T.green + '50', backgroundColor: T.greenPale },
  statusDot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: T.muted },
  statusDotActive:  { backgroundColor: T.green },
  statusText:       { fontSize: 12, color: T.muted, fontWeight: '600' },
  statusTextActive: { color: T.green },
  titleCard:        { borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20 },
  titleIcon:        { fontSize: 48, marginBottom: 8 },
  titleText:        { fontSize: 28, fontWeight: '900', color: '#FFF', marginBottom: 4 },
  titleSub:         { fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  sectionCard:      { backgroundColor: T.card, borderRadius: 18, padding: 18, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: T.border, shadowColor: T.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  sectionIconBox:   { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sectionIcon:      { fontSize: 28 },
  sectionBody:      { flex: 1 },
  sectionTitle:     { fontSize: 15, fontWeight: '800', color: T.dark, marginBottom: 4 },
  sectionDesc:      { fontSize: 12, color: T.muted, lineHeight: 17 },
  sectionBadge:     { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, flexShrink: 0 },
  sectionBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFF', letterSpacing: 0.3 },
  infoCard:         { backgroundColor: T.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: T.border, borderLeftWidth: 4, borderLeftColor: T.gold },
  infoTitle:        { fontSize: 14, fontWeight: '800', color: T.dark, marginBottom: 10 },
  infoBody:         { fontSize: 13, color: T.body, lineHeight: 20 },
});
