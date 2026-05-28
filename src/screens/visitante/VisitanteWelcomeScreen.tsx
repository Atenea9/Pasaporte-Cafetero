import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  SafeAreaView, StatusBar, Dimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { VisitanteNavProp } from '../../navigation/types';
import { useApp } from '../../context/AppContext';

const { width, height } = Dimensions.get('window');

const T = {
  bg:       '#FAF7F0',
  card:     '#FFFFFF',
  dark:     '#2C1810',
  body:     '#4A3728',
  muted:    '#8A7060',
  gold:     '#B8860B',
  goldDark: '#8B6308',
  goldPale: '#F5E6B0',
  green:    '#2D5A1E',
  greenPale:'#E8F2E4',
  border:   '#E8D5B0',
};

export default function VisitanteWelcomeScreen() {
  const nav = useNavigation<VisitanteNavProp>();
  const { state, dispatch } = useApp();

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // If user already registered, go to home
    if (state.usuario) {
      nav.navigate('Inicio');
      return;
    }
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [state.usuario]);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <Animated.View style={[s.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

        {/* Hero Section */}
        <LinearGradient colors={[T.green, '#4A8030', '#2D5A1E']} style={s.hero}>
          <View style={s.heroContent}>
            <Text style={s.heroEmoji}>☕</Text>
            <Text style={s.heroTitle}>PASAPORTE{'\n'}CAFETERO</Text>
            <Text style={s.heroSub}>Feria Internacional del Café{'\n'}Chaparral, Tolima 2026</Text>
          </View>
          <View style={s.heroDecor}>
            <Text style={s.heroDecorText}>14 · 15 · 16 AGO</Text>
          </View>
        </LinearGradient>

        {/* Options */}
        <View style={s.optionsContainer}>
          <Text style={s.optionsTitle}>¿Cómo deseas ingresar?</Text>

          {/* Iniciar Sesión */}
          <TouchableOpacity
            style={s.optionCard}
            activeOpacity={0.85}
            onPress={() => nav.navigate('Login')}
          >
            <LinearGradient colors={[T.green, '#3A7028']} style={s.optionGrad}>
              <View style={s.optionIcon}>
                <Text style={s.optionEmoji}>🪪</Text>
              </View>
              <View style={s.optionText}>
                <Text style={s.optionTitle}>Ya tengo pasaporte</Text>
                <Text style={s.optionSub}>Ingresa con tu cédula o teléfono</Text>
              </View>
              <Text style={s.optionArrow}>›</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Crear Pasaporte */}
          <TouchableOpacity
            style={[s.optionCard, s.optionCardOutline]}
            activeOpacity={0.85}
            onPress={() => nav.navigate('Registro')}
          >
            <View style={s.optionGradOutline}>
              <View style={[s.optionIcon, s.optionIconOutline]}>
                <Text style={s.optionEmoji}>📝</Text>
              </View>
              <View style={s.optionText}>
                <Text style={[s.optionTitle, { color: T.dark }]}>Crear mi pasaporte</Text>
                <Text style={[s.optionSub, { color: T.muted }]}>Regístrate gratis en 30 segundos</Text>
              </View>
              <Text style={[s.optionArrow, { color: T.gold }]}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Benefits */}
          <View style={s.benefitsBox}>
            <Text style={s.benefitsTitle}>¿Qué ganas con el pasaporte?</Text>
            <View style={s.benefitsList}>
              {[
                { icon: '🗺️', text: 'Visita los 38 municipios cafeteros y colecciona sellos' },
                { icon: '⭐', text: 'Acumula puntos por cada compra en los stands' },
                { icon: '🏆', text: 'Gana premios: café, kits, cursos y visitas a fincas' },
              ].map((b, i) => (
                <View key={i} style={s.benefitItem}>
                  <Text style={s.benefitIcon}>{b.icon}</Text>
                  <Text style={s.benefitText}>{b.text}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: T.bg },
  container:        { flex: 1 },
  hero:             { paddingTop: 40, paddingBottom: 32, paddingHorizontal: 24, alignItems: 'center' },
  heroContent:      { alignItems: 'center', marginBottom: 12 },
  heroEmoji:        { fontSize: 52, marginBottom: 10 },
  heroTitle:        { fontSize: 36, fontWeight: '900', color: '#FFF', textAlign: 'center', letterSpacing: 2, lineHeight: 40 },
  heroSub:          { fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 10, lineHeight: 20 },
  heroDecor:        { marginTop: 8, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  heroDecorText:    { color: '#FFF', fontSize: 12, fontWeight: '800', letterSpacing: 2 },

  optionsContainer: { flex: 1, padding: 20, paddingTop: 24 },
  optionsTitle:     { fontSize: 16, fontWeight: '700', color: T.dark, textAlign: 'center', marginBottom: 18 },

  optionCard:       { borderRadius: 18, overflow: 'hidden', marginBottom: 14, shadowColor: T.dark, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
  optionCardOutline:{ borderWidth: 1.5, borderColor: T.border, overflow: 'visible', backgroundColor: T.card },
  optionGrad:       { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
  optionGradOutline:{ flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
  optionIcon:       { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  optionIconOutline:{ backgroundColor: T.goldPale },
  optionEmoji:      { fontSize: 26 },
  optionText:       { flex: 1 },
  optionTitle:      { fontSize: 16, fontWeight: '900', color: '#FFF', marginBottom: 3 },
  optionSub:        { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  optionArrow:      { fontSize: 30, color: 'rgba(255,255,255,0.7)', fontWeight: '300' },

  benefitsBox:      { backgroundColor: T.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: T.border, marginTop: 4 },
  benefitsTitle:    { fontSize: 12, fontWeight: '800', color: T.gold, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 },
  benefitsList:     { gap: 12 },
  benefitItem:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  benefitIcon:      { fontSize: 20, marginTop: -2 },
  benefitText:      { flex: 1, fontSize: 13, color: T.body, lineHeight: 19 },
});
