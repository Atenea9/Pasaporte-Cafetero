import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  SafeAreaView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { CompradorNavProp } from '../../navigation/types';
import { useApp } from '../../context/AppContext';

const T = {
  bg: '#FAF7F0', card: '#FFFFFF', dark: '#2C1810', body: '#4A3728',
  muted: '#8A7060', gold: '#B8860B', goldDark: '#8B6308', goldPale: '#F5E6B0',
  blue: '#1565C0', bluePale: '#E3F0FF', border: '#E8D5B0',
};

export default function CompradorWelcomeScreen() {
  const nav = useNavigation<CompradorNavProp>();
  const { state } = useApp();
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (state.usuario) { nav.navigate('Dashboard'); return; }
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [state.usuario]);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={T.blue} />
      <Animated.View style={[s.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <LinearGradient colors={['#1565C0', '#0D47A1', '#1B5E20']} style={s.hero}>
          <Text style={s.heroEmoji}>🌍</Text>
          <Text style={s.heroTitle}>COMPRADOR{'\n'}INTERNACIONAL</Text>
          <Text style={s.heroSub}>Subasta Internacional de Café{'\n'}Chaparral, Tolima · Colombia 2026</Text>
          <View style={s.badge}>
            <Text style={s.badgeText}>☕ SPECIALTY COFFEE AUCTION</Text>
          </View>
        </LinearGradient>

        <View style={s.body}>
          <Text style={s.title}>¿Cómo deseas ingresar?</Text>

          <TouchableOpacity style={s.optCard} onPress={() => nav.navigate('Login')} activeOpacity={0.85}>
            <LinearGradient colors={['#1565C0', '#0D47A1']} style={s.optGrad}>
              <View style={s.optIcon}><Text style={s.optEmoji}>🪪</Text></View>
              <View style={s.optText}>
                <Text style={s.optTitle}>Ya tengo acceso</Text>
                <Text style={s.optSub}>Ingresa con tu cédula o teléfono</Text>
              </View>
              <Text style={s.optArrow}>›</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={s.optCardOutline} onPress={() => nav.navigate('Registro')} activeOpacity={0.85}>
            <View style={s.optGradOutline}>
              <View style={[s.optIcon, s.optIconOutline]}><Text style={s.optEmoji}>📝</Text></View>
              <View style={s.optText}>
                <Text style={[s.optTitle, { color: T.dark }]}>Registrarme como comprador</Text>
                <Text style={[s.optSub, { color: T.muted }]}>Accede a los catálogos y subastas</Text>
              </View>
              <Text style={[s.optArrow, { color: T.gold }]}>›</Text>
            </View>
          </TouchableOpacity>

          <View style={s.infoBox}>
            <Text style={s.infoTitle}>Acceso exclusivo a:</Text>
            {['🏆 Catálogo de microlotes y análisis SCA', '💰 Subasta en tiempo real con pujas en USD', '📊 Perfiles detallados de cada finca', '🗺️ Mapa de stands y agenda del evento'].map((t, i) => (
              <View key={i} style={s.infoRow}>
                <Text style={s.infoText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: T.bg },
  container:      { flex: 1 },
  hero:           { paddingTop: 44, paddingBottom: 32, paddingHorizontal: 24, alignItems: 'center' },
  heroEmoji:      { fontSize: 52, marginBottom: 10 },
  heroTitle:      { fontSize: 32, fontWeight: '900', color: '#FFF', textAlign: 'center', letterSpacing: 2, lineHeight: 36 },
  heroSub:        { fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 10, lineHeight: 20 },
  badge:          { marginTop: 12, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  badgeText:      { color: '#FFF', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  body:           { flex: 1, padding: 20, paddingTop: 24 },
  title:          { fontSize: 16, fontWeight: '700', color: T.dark, textAlign: 'center', marginBottom: 18 },
  optCard:        { borderRadius: 18, overflow: 'hidden', marginBottom: 14, shadowColor: '#1565C0', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  optCardOutline: { borderRadius: 18, borderWidth: 1.5, borderColor: T.border, marginBottom: 14, backgroundColor: T.card },
  optGrad:        { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
  optGradOutline: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
  optIcon:        { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  optIconOutline: { backgroundColor: T.bluePale },
  optEmoji:       { fontSize: 26 },
  optText:        { flex: 1 },
  optTitle:       { fontSize: 16, fontWeight: '900', color: '#FFF', marginBottom: 3 },
  optSub:         { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  optArrow:       { fontSize: 30, color: 'rgba(255,255,255,0.7)', fontWeight: '300' },
  infoBox:        { backgroundColor: T.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: T.border },
  infoTitle:      { fontSize: 12, fontWeight: '800', color: T.blue, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },
  infoRow:        { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: T.border },
  infoText:       { fontSize: 13, color: T.body },
});
