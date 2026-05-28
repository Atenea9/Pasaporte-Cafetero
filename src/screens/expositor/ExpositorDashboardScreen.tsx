import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, StatusBar, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import type { ExpositorNavProp } from '../../navigation/types';

const { width } = Dimensions.get('window');

const T = {
  bg: '#FAF7F0', card: '#FFFFFF', dark: '#2C1810', body: '#4A3728',
  muted: '#8A7060', gold: '#B8860B', goldDark: '#8B6308', goldPale: '#F5E6B0',
  green: '#2D5A1E', greenLight: '#4A8030', greenPale: '#E8F2E4',
  blue: '#1565C0', border: '#E8D5B0', accent: '#C0392B',
};

export default function ExpositorDashboardScreen() {
  const nav = useNavigation<ExpositorNavProp>();
  const { user, logout } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const OPTIONS = [
    {
      key: 'stand',
      icon: '🏪',
      title: 'Mi Stand',
      subtitle: 'Catálogo, perfil comercial e historia de tu finca',
      color: T.green,
      colorPale: T.greenPale,
      screen: 'StandDashboard' as const,
      features: ['Catálogo de productos', 'Perfil comercial', 'Historia de la finca', 'Escanear visitantes'],
    },
    {
      key: 'subasta',
      icon: '🏆',
      title: 'Subasta',
      subtitle: 'Registra tus microlotes para la subasta internacional',
      color: T.gold,
      colorPale: T.goldPale,
      screen: 'SubastaDashboard' as const,
      features: ['Agregar microlotes', 'Análisis SCA', 'Perfil de finca', 'Pujas en tiempo real'],
    },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <Animated.ScrollView style={{ opacity: fadeAnim }} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.headerGreeting}>Bienvenido,</Text>
            <Text style={s.headerName}>{user?.name?.split(' ')[0] || 'Expositor'} 👋</Text>
            <Text style={s.headerSub}>Feria Internacional del Café · Chaparral 2026</Text>
          </View>
          <TouchableOpacity onPress={logout} style={s.logoutBtn}>
            <Text style={s.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={s.statsRow}>
          {[
            { icon: '📦', label: 'Productos', val: '—' },
            { icon: '🎫', label: 'Sellos emitidos', val: '0' },
            { icon: '💰', label: 'Ventas hoy', val: '$0' },
          ].map((st, i) => (
            <View key={i} style={s.statCard}>
              <Text style={s.statIcon}>{st.icon}</Text>
              <Text style={s.statVal}>{st.val}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Main Options */}
        <Text style={s.sectionTitle}>¿Qué deseas gestionar?</Text>

        {OPTIONS.map((opt) => (
          <TouchableOpacity key={opt.key} style={s.optCard} onPress={() => nav.navigate(opt.screen)} activeOpacity={0.88}>
            <LinearGradient colors={[opt.color, opt.color + 'CC']} style={s.optGrad}>
              <View style={s.optTop}>
                <View style={s.optIconWrap}>
                  <Text style={s.optIcon}>{opt.icon}</Text>
                </View>
                <View style={s.optTextWrap}>
                  <Text style={s.optTitle}>{opt.title}</Text>
                  <Text style={s.optSub}>{opt.subtitle}</Text>
                </View>
                <Text style={s.optArrow}>›</Text>
              </View>
              <View style={s.optFeatures}>
                {opt.features.map((f, i) => (
                  <View key={i} style={s.optFeature}>
                    <Text style={s.optFeatureDot}>•</Text>
                    <Text style={s.optFeatureText}>{f}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        {/* Scan Quick Access */}
        <TouchableOpacity style={s.scanCard} onPress={() => nav.navigate('Scanner')} activeOpacity={0.85}>
          <View style={s.scanLeft}>
            <Text style={s.scanIcon}>📷</Text>
          </View>
          <View style={s.scanText}>
            <Text style={s.scanTitle}>Escanear pasaporte de visitante</Text>
            <Text style={s.scanSub}>Registra ventas y emite sellos</Text>
          </View>
          <Text style={s.scanArrow}>›</Text>
        </TouchableOpacity>

      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: T.bg },
  scroll:         { padding: 20, paddingTop: 16, paddingBottom: 40 },
  header:         { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  headerLeft:     { flex: 1 },
  headerGreeting: { fontSize: 13, color: T.muted, marginBottom: 2 },
  headerName:     { fontSize: 24, fontWeight: '900', color: T.dark },
  headerSub:      { fontSize: 11, color: T.muted, marginTop: 3 },
  logoutBtn:      { backgroundColor: T.card, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: T.border, marginLeft: 12 },
  logoutText:     { color: T.accent, fontWeight: '700', fontSize: 13 },
  statsRow:       { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard:       { flex: 1, backgroundColor: T.card, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: T.border, shadowColor: T.dark, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  statIcon:       { fontSize: 22, marginBottom: 6 },
  statVal:        { fontSize: 18, fontWeight: '900', color: T.dark },
  statLabel:      { fontSize: 9, color: T.muted, textAlign: 'center', marginTop: 2, letterSpacing: 0.3 },
  sectionTitle:   { fontSize: 14, fontWeight: '800', color: T.body, marginBottom: 14, letterSpacing: 0.3 },
  optCard:        { borderRadius: 20, overflow: 'hidden', marginBottom: 16, shadowColor: T.dark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 6 },
  optGrad:        { padding: 20 },
  optTop:         { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  optIconWrap:    { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  optIcon:        { fontSize: 28 },
  optTextWrap:    { flex: 1 },
  optTitle:       { fontSize: 22, fontWeight: '900', color: '#FFF', marginBottom: 4 },
  optSub:         { fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 18 },
  optArrow:       { fontSize: 32, color: 'rgba(255,255,255,0.7)', fontWeight: '300' },
  optFeatures:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  optFeature:     { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, gap: 4 },
  optFeatureDot:  { color: 'rgba(255,255,255,0.7)', fontSize: 8 },
  optFeatureText: { fontSize: 11, color: '#FFF', fontWeight: '600' },
  scanCard:       { backgroundColor: T.card, borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: T.border, shadowColor: T.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  scanLeft:       { width: 48, height: 48, borderRadius: 24, backgroundColor: T.greenPale, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  scanIcon:       { fontSize: 24 },
  scanText:       { flex: 1 },
  scanTitle:      { fontSize: 14, fontWeight: '800', color: T.dark, marginBottom: 3 },
  scanSub:        { fontSize: 12, color: T.muted },
  scanArrow:      { fontSize: 28, color: T.gold, fontWeight: '300' },
});
