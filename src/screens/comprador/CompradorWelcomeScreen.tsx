import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  SafeAreaView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { CompradorNavProp } from '../../navigation/types';
import { useApp } from '../../context/AppContext';
import LangSelector from '../../components/LangSelector';

const T = {
  bg:         '#FBF7ED',
  card:       '#FFFDF8',
  dark:       '#2C1A0E',
  body:       '#5C3520',
  muted:      '#9B7B5A',
  amber:      '#C8960C',
  amberPale:  '#FBF0C8',
  coffee:     '#7B4A2A',
  coffeeDark: '#5C3520',
  border:     '#EDD9A8',
  blue:       '#1565C0',
  bluePale:   '#E3F0FF',
};

export default function CompradorWelcomeScreen() {
  const nav = useNavigation<CompradorNavProp>();
  const { state } = useApp();
  const { t } = useTranslation();
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    if (state.usuario) { nav.navigate('Dashboard'); return; }
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [state.usuario]);

  const features = [
    t('welcomeScreen.feature_1', '🏆 Catálogo de microlotes y análisis SCA'),
    t('welcomeScreen.feature_2', '💰 Subasta en tiempo real con pujas en USD'),
    t('welcomeScreen.feature_3', '📊 Perfiles detallados de cada finca cafetera'),
    t('welcomeScreen.feature_4', '🗺️ Mapa de stands y agenda del evento'),
  ];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={T.blue} />

      {/* Language selector */}
      <View style={s.topBar}>
        <LangSelector />
      </View>

      <Animated.View style={[s.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

        {/* Hero — international blue + amber badge */}
        <LinearGradient colors={['#0D47A1', '#1565C0', '#1976D2']} style={s.hero}>
          <LinearGradient colors={[T.amberPale, '#FFF8DC']} style={s.heroBadge}>
            <Text style={s.heroBadgeText}>☕ SPECIALTY COFFEE AUCTION</Text>
          </LinearGradient>
          <Text style={s.heroEmoji}>🌍</Text>
          <Text style={s.heroTitle}>{t('welcomeScreen.comprador_title', 'COMPRADOR\nINTERNACIONAL')}</Text>
          <Text style={s.heroSub}>{t('welcomeScreen.comprador_sub', 'Subasta Internacional de Café\nCharrarral, Tolima · Colombia 2026')}</Text>
        </LinearGradient>

        <View style={s.body}>
          <Text style={s.bodyTitle}>{t('welcomeScreen.how_to_enter', '¿Cómo deseas ingresar?')}</Text>

          <TouchableOpacity style={s.optCard} onPress={() => nav.navigate('Login')} activeOpacity={0.85}>
            <LinearGradient colors={['#1565C0', '#0D47A1']} style={s.optGrad}>
              <View style={s.optIcon}><Text style={s.optEmoji}>🪪</Text></View>
              <View style={s.optText}>
                <Text style={s.optTitle}>{t('welcomeScreen.have_access', 'Ya tengo acceso')}</Text>
                <Text style={s.optSub}>{t('welcomeScreen.login_sub', 'Ingresa con tu cédula o teléfono')}</Text>
              </View>
              <Text style={s.optArrow}>›</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={s.optCardOutline} onPress={() => nav.navigate('Registro')} activeOpacity={0.85}>
            <View style={s.optGradOutline}>
              <View style={[s.optIcon, s.optIconOutline]}><Text style={s.optEmoji}>📝</Text></View>
              <View style={s.optText}>
                <Text style={[s.optTitle, { color: T.dark }]}>{t('welcomeScreen.register_as_buyer', 'Registrarme como comprador')}</Text>
                <Text style={[s.optSub, { color: T.muted }]}>{t('welcomeScreen.buyer_sub', 'Accede a los catálogos y subastas')}</Text>
              </View>
              <Text style={[s.optArrow, { color: T.amber }]}>›</Text>
            </View>
          </TouchableOpacity>

          <View style={s.infoBox}>
            <Text style={s.infoTitle}>{t('welcomeScreen.exclusive_access', 'Acceso exclusivo a:')}</Text>
            {features.map((f, i) => (
              <View key={i} style={s.infoRow}>
                <Text style={s.infoText}>{f}</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: T.bg },
  container:       { flex: 1 },
  topBar:          { position: 'absolute', top: 48, right: 16, zIndex: 10 },
  hero:            { paddingTop: 56, paddingBottom: 32, paddingHorizontal: 24, alignItems: 'center', gap: 10 },
  heroBadge:       { borderRadius: 30, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(200,150,12,0.3)', marginBottom: 4 },
  heroBadgeText:   { color: T.coffeeDark, fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  heroEmoji:       { fontSize: 50 },
  heroTitle:       { fontSize: 30, fontWeight: '900', color: '#FFF', textAlign: 'center', letterSpacing: 2, lineHeight: 34 },
  heroSub:         { fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 20 },
  body:            { flex: 1, padding: 20, paddingTop: 24 },
  bodyTitle:       { fontSize: 15, fontWeight: '700', color: T.dark, textAlign: 'center', marginBottom: 18 },
  optCard:         { borderRadius: 18, overflow: 'hidden', marginBottom: 14, shadowColor: '#1565C0', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 10, elevation: 5 },
  optCardOutline:  { borderRadius: 18, borderWidth: 1.5, borderColor: T.border, marginBottom: 14, backgroundColor: T.card },
  optGrad:         { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
  optGradOutline:  { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
  optIcon:         { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  optIconOutline:  { backgroundColor: T.bluePale },
  optEmoji:        { fontSize: 26 },
  optText:         { flex: 1 },
  optTitle:        { fontSize: 16, fontWeight: '900', color: '#FFF', marginBottom: 3 },
  optSub:          { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  optArrow:        { fontSize: 30, color: 'rgba(255,255,255,0.7)', fontWeight: '300' },
  infoBox:         { backgroundColor: T.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: T.border },
  infoTitle:       { fontSize: 11, fontWeight: '800', color: T.blue, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 },
  infoRow:         { paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: T.border },
  infoText:        { fontSize: 13, color: T.body },
});
