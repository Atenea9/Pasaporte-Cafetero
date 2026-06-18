import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Platform, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ExpositorStackParamList } from '../../navigation/types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../contexts/AuthContext';

type Nav = NativeStackNavigationProp<ExpositorStackParamList, 'ExpositorWelcome'>;

const T = {
  bg: '#F4EDD8', card: '#FFFDF8', dark: '#1A0A00',
  coffee: '#7B4A2A', amber: '#C8960C', amberDark: '#8B6308',
  green: '#1B5E20', greenLight: '#2E7D32', greenBg: '#E8F5E9',
  gold: '#B8860B', goldDark: '#8B6308', goldBg: '#FFF8E1',
  muted: '#9B7B5A', border: '#E8D5A8', white: '#FFFFFF',
};

export default function ExpositorWelcomeScreen() {
  const nav = useNavigation<Nav>();
  const { state } = useApp();
  const { logout } = useAuth();

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (state.expositorPerfil) {
      nav.replace('Dashboard');
      return;
    }
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  }, [state.expositorPerfil]);

  const handleBack = async () => {
    try { await logout(); } catch (_) {}
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={T.coffee} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={handleBack}>
          <Text style={s.backTxt}>← Salir</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerSub}>FERIA INTERNACIONAL DEL CAFÉ</Text>
          <Text style={s.headerTitle}>CHAPARRAL 2026</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Hero */}
          <View style={s.hero}>
            <Text style={s.heroEmoji}>🏪</Text>
            <Text style={s.heroTitle}>Portal Expositores</Text>
            <Text style={s.heroSub}>
              Registra tu participación, gestiona tu stand y presenta tus cafés al mundo.
            </Text>
          </View>

          {/* Stand Card */}
          <TouchableOpacity
            style={[s.pathCard, s.standCard]}
            activeOpacity={0.85}
            onPress={() => nav.navigate('ExpositorLogin', { tipo: 'stand' })}
          >
            <View style={s.pathCardHeader}>
              <Text style={s.pathEmoji}>🏪</Text>
              <View style={s.pathCardBadge}>
                <Text style={s.pathCardBadgeTxt}>MÁS POPULAR</Text>
              </View>
            </View>
            <Text style={[s.pathTitle, { color: T.greenLight }]}>Stand de Exhibición</Text>
            <Text style={s.pathDesc}>
              Tengo un espacio físico en la feria donde exhibiré y venderé mis productos cafeteros.
            </Text>
            <View style={s.featureList}>
              {['Catálogo de cafés y productos', 'Escaneo de pasaportes visitantes', 'Perfil comercial de tu stand', 'Estadísticas de ventas en tiempo real'].map(f => (
                <View key={f} style={s.featureRow}>
                  <Text style={[s.featureDot, { color: T.greenLight }]}>✓</Text>
                  <Text style={s.featureTxt}>{f}</Text>
                </View>
              ))}
            </View>
            <View style={[s.pathBtn, { backgroundColor: T.greenLight }]}>
              <Text style={s.pathBtnTxt}>Ingresar como Stand →</Text>
            </View>
          </TouchableOpacity>

          {/* Subasta Card */}
          <TouchableOpacity
            style={[s.pathCard, s.subastaCard]}
            activeOpacity={0.85}
            onPress={() => nav.navigate('ExpositorLogin', { tipo: 'subasta' })}
          >
            <View style={s.pathCardHeader}>
              <Text style={s.pathEmoji}>☕</Text>
            </View>
            <Text style={[s.pathTitle, { color: T.goldDark }]}>Microlotes & Subastas</Text>
            <Text style={s.pathDesc}>
              Participo con cafés especiales en las subastas de microlotes de la feria.
            </Text>
            <View style={s.featureList}>
              {['Registro de microlotes de alta calidad', 'Análisis de perfil SCA', 'Subastas en tiempo real', 'Visibilidad internacional para tu finca'].map(f => (
                <View key={f} style={s.featureRow}>
                  <Text style={[s.featureDot, { color: T.gold }]}>✓</Text>
                  <Text style={s.featureTxt}>{f}</Text>
                </View>
              ))}
            </View>
            <View style={[s.pathBtn, { backgroundColor: T.gold }]}>
              <Text style={s.pathBtnTxt}>Ingresar a Subastas →</Text>
            </View>
          </TouchableOpacity>

          {/* Footer note */}
          <Text style={s.footerNote}>
            ¿Primera vez? Regístrate en menos de 3 minutos con tu cédula y datos del stand.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:            { flex: 1, backgroundColor: T.bg },
  header:          { backgroundColor: T.coffee, paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight ?? 24) + 8, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn:         { padding: 6 },
  backTxt:         { color: '#FFF', fontSize: 14, fontWeight: '600' },
  headerCenter:    { alignItems: 'center' },
  headerSub:       { color: 'rgba(255,255,255,0.75)', fontSize: 9, letterSpacing: 1.5, fontWeight: '700' },
  headerTitle:     { color: T.amber, fontSize: 15, fontWeight: '800', letterSpacing: 1 },
  scroll:          { padding: 20, paddingBottom: 40 },
  hero:            { alignItems: 'center', marginBottom: 24, paddingVertical: 8 },
  heroEmoji:       { fontSize: 48, marginBottom: 8 },
  heroTitle:       { fontSize: 26, fontWeight: '800', color: T.dark, letterSpacing: 0.5, textAlign: 'center' },
  heroSub:         { fontSize: 14, color: T.muted, textAlign: 'center', marginTop: 8, lineHeight: 20, paddingHorizontal: 12 },
  pathCard:        { borderRadius: 20, padding: 22, marginBottom: 16, borderWidth: 1.5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  standCard:       { backgroundColor: '#F0FFF4', borderColor: '#A5D6A7' },
  subastaCard:     { backgroundColor: '#FFFDE7', borderColor: '#FFE082' },
  pathCardHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  pathEmoji:       { fontSize: 36 },
  pathCardBadge:   { backgroundColor: T.greenLight, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  pathCardBadgeTxt:{ color: '#FFF', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  pathTitle:       { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  pathDesc:        { fontSize: 13, color: T.muted, lineHeight: 19, marginBottom: 16 },
  featureList:     { gap: 8, marginBottom: 20 },
  featureRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  featureDot:      { fontSize: 14, fontWeight: '800', marginTop: 1 },
  featureTxt:      { fontSize: 13, color: T.coffee, flex: 1, lineHeight: 18 },
  pathBtn:         { borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  pathBtnTxt:      { color: '#FFF', fontSize: 14, fontWeight: '800', letterSpacing: 0.3 },
  footerNote:      { textAlign: 'center', color: T.muted, fontSize: 12, lineHeight: 17, marginTop: 8 },
});
