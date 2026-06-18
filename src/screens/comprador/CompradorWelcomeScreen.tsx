import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  SafeAreaView, StatusBar, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { CompradorNavProp } from '../../navigation/types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import LangSelector from '../../components/LangSelector';

const T = {
  bg:         '#FBF7ED',
  card:       '#FFFDF8',
  dark:       '#2C1A0E',
  body:       '#5C3520',
  muted:      '#9B7B5A',
  amber:      '#C8960C',
  amberLight: '#E8B820',
  amberPale:  '#FBF0C8',
  coffee:     '#7B4A2A',
  coffeeDark: '#5C3520',
  coffeePale: '#F0E0CC',
  border:     '#EDD9A8',
};

export default function CompradorWelcomeScreen() {
  const nav = useNavigation<CompradorNavProp>();
  const { state } = useApp();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    if (state.usuario || user) { nav.navigate('Dashboard'); return; }
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [state.usuario, user]);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={logout} activeOpacity={0.8}>
          <Text style={s.backIcon}>‹</Text>
          <Text style={s.backText}>{t('common.back', 'Volver')}</Text>
        </TouchableOpacity>
        <LangSelector style={s.langBtn} light />
      </View>

      <Animated.View style={[s.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

        <LinearGradient colors={[T.coffeeDark, T.coffee, '#A0663C']} style={s.hero}>
          <LinearGradient colors={[T.amberPale, '#FFF8DC']} style={s.heroBadge}>
            <Text style={s.heroBadgeText}>☕ COMPRADOR INTERNACIONAL</Text>
          </LinearGradient>
          <Text style={s.heroEmoji}>🌍</Text>
          <Text style={s.heroTitle}>{t('welcomeScreen.comprador_title', 'PASAPORTE\nCAFETERO').toUpperCase()}</Text>
          <Text style={s.heroSub}>Feria Internacional del Café{'\n'}Chaparral, Tolima 2026</Text>
          <View style={s.heroDecor}>
            <Text style={s.heroDecorText}>14 · 15 · 16 AGO 2026</Text>
          </View>
        </LinearGradient>

        <View style={s.body}>
          <Text style={s.bodyTitle}>{t('welcomeScreen.how_to_enter', '¿Cómo deseas ingresar?')}</Text>

          <TouchableOpacity style={s.optCard} onPress={() => nav.navigate('Login')} activeOpacity={0.85}>
            <LinearGradient colors={[T.coffeeDark, T.coffee]} style={s.optGrad}>
              <Image
                source={require('../../../assets/animal-visitante.png')}
                style={s.optBtnImg}
                resizeMode="contain"
              />
              <View style={s.optText}>
                <Text style={s.optTitle}>{t('welcomeScreen.have_passport', 'YA TENGO PASAPORTE')}</Text>
                <Text style={s.optSub}>{t('welcomeScreen.login_sub', 'INGRESA CON TU CÉDULA O TELÉFONO')}</Text>
              </View>
              <Text style={s.optArrow}>›</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={s.optCardOutline} onPress={() => nav.navigate('Registro')} activeOpacity={0.85}>
            <View style={s.optGradOutline}>
              <Image
                source={require('../../../assets/bear-mascot.png')}
                style={s.optBtnImg}
                resizeMode="contain"
              />
              <View style={s.optText}>
                <Text style={[s.optTitle, { color: T.dark }]}>{t('welcomeScreen.create_passport', 'CREAR MI PASAPORTE')}</Text>
                <Text style={[s.optSub, { color: T.muted }]}>{t('welcomeScreen.register_sub', 'REGÍSTRATE GRATIS EN 30 SEGUNDOS')}</Text>
              </View>
              <Text style={[s.optArrow, { color: T.amber }]}>›</Text>
            </View>
          </TouchableOpacity>

          <View style={s.benefitsBox}>
            <Text style={s.benefitsTitle}>{t('welcomeScreen.exclusive_access', 'Acceso exclusivo a:')}</Text>
            {[
              { icon: '🏆', text: t('welcomeScreen.feature_1', 'Catálogo de microlotes y análisis SCA') },
              { icon: '💰', text: t('welcomeScreen.feature_2', 'Subasta en tiempo real con pujas en USD') },
              { icon: '📊', text: t('welcomeScreen.feature_3', 'Perfiles detallados de cada finca cafetera') },
              { icon: '🗺️', text: t('welcomeScreen.feature_4', 'Mapa de stands y agenda del evento') },
            ].map((b, i) => (
              <View key={i} style={s.benefitItem}>
                <Text style={s.benefitIcon}>{b.icon}</Text>
                <Text style={s.benefitText}>{b.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: T.bg },
  container:        { flex: 1 },
  topBar:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, zIndex: 10 },
  backBtn:          { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 6, paddingHorizontal: 4 },
  backIcon:         { fontSize: 26, color: T.coffee, lineHeight: 30, fontWeight: '300' },
  backText:         { fontSize: 14, color: T.coffee, fontWeight: '700' },
  langBtn:          {},

  hero:             { paddingTop: 56, paddingBottom: 32, paddingHorizontal: 24, alignItems: 'center', gap: 10 },
  heroBadge:        { borderRadius: 30, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: T.border + '80', marginBottom: 4 },
  heroBadgeText:    { color: T.coffeeDark, fontSize: 9, fontWeight: '900', letterSpacing: 3 },
  heroEmoji:        { fontSize: 50 },
  heroTitle:        { fontSize: 34, fontWeight: '900', color: '#FFF', letterSpacing: 4, lineHeight: 36, textAlign: 'center' },
  heroSub:          { fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 20 },
  heroDecor:        { marginTop: 4, backgroundColor: T.amberPale, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  heroDecorText:    { color: T.coffeeDark, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },

  body:             { flex: 1, padding: 20, paddingTop: 24 },
  bodyTitle:        { fontSize: 15, fontWeight: '700', color: T.dark, textAlign: 'center', marginBottom: 18 },

  optCard:          { borderRadius: 18, overflow: 'hidden', marginBottom: 14, shadowColor: T.coffeeDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  optCardOutline:   { borderRadius: 18, borderWidth: 1.5, borderColor: T.border, marginBottom: 14, backgroundColor: T.card, shadowColor: T.dark, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  optGrad:          { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
  optGradOutline:   { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
  optBtnImg:        { width: 64, height: 64 },
  optText:          { flex: 1 },
  optTitle:         { fontSize: 18, fontWeight: '900', color: '#FFF', marginBottom: 4, letterSpacing: 0.5 },
  optSub:           { fontSize: 13, color: 'rgba(255,255,255,0.82)', letterSpacing: 0.3 },
  optArrow:         { fontSize: 30, color: 'rgba(255,255,255,0.7)', fontWeight: '300' },

  benefitsBox:      { backgroundColor: T.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: T.border },
  benefitsTitle:    { fontSize: 11, fontWeight: '800', color: T.amber, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 },
  benefitItem:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  benefitIcon:      { fontSize: 20, marginTop: -2 },
  benefitText:      { flex: 1, fontSize: 13, color: T.body, lineHeight: 19 },
});
