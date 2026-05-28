import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  SafeAreaView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { VisitanteNavProp } from '../../navigation/types';
import { useApp } from '../../context/AppContext';

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

export default function VisitanteWelcomeScreen() {
  const nav = useNavigation<VisitanteNavProp>();
  const { state } = useApp();
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    if (state.usuario) { nav.navigate('Inicio'); return; }
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [state.usuario]);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <Animated.View style={[s.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

        {/* Hero — rich coffee gradient */}
        <LinearGradient colors={[T.coffeeDark, T.coffee, '#A0663C']} style={s.hero}>
          <LinearGradient colors={[T.amberPale, '#FFF8DC']} style={s.heroBadge}>
            <Text style={s.heroBadgeText}>✦ PASAPORTE CAFETERO ✦</Text>
          </LinearGradient>
          <Text style={s.heroEmoji}>🌿</Text>
          <Text style={s.heroTitle}>VISITANTE</Text>
          <Text style={s.heroSub}>Feria Internacional del Café{'\n'}Chaparral, Tolima 2026</Text>
          <View style={s.heroDecor}>
            <Text style={s.heroDecorText}>14 · 15 · 16 AGO 2026</Text>
          </View>
        </LinearGradient>

        <View style={s.body}>
          <Text style={s.bodyTitle}>¿Cómo deseas ingresar?</Text>

          {/* Login */}
          <TouchableOpacity style={s.optCard} onPress={() => nav.navigate('Login')} activeOpacity={0.85}>
            <LinearGradient colors={[T.coffeeDark, T.coffee]} style={s.optGrad}>
              <View style={s.optIcon}>
                <Text style={s.optEmoji}>🪪</Text>
              </View>
              <View style={s.optText}>
                <Text style={s.optTitle}>Ya tengo pasaporte</Text>
                <Text style={s.optSub}>Ingresa con tu cédula o teléfono</Text>
              </View>
              <Text style={s.optArrow}>›</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Register */}
          <TouchableOpacity style={s.optCardOutline} onPress={() => nav.navigate('Registro')} activeOpacity={0.85}>
            <View style={s.optGradOutline}>
              <View style={[s.optIcon, s.optIconOutline]}>
                <Text style={s.optEmoji}>📝</Text>
              </View>
              <View style={s.optText}>
                <Text style={[s.optTitle, { color: T.dark }]}>Crear mi pasaporte</Text>
                <Text style={[s.optSub, { color: T.muted }]}>Regístrate gratis en 30 segundos</Text>
              </View>
              <Text style={[s.optArrow, { color: T.amber }]}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Benefits */}
          <View style={s.benefitsBox}>
            <Text style={s.benefitsTitle}>¿Qué ganas con el pasaporte?</Text>
            {[
              { icon: '🗺️', text: 'Visita los 38 municipios cafeteros y colecciona sellos' },
              { icon: '⭐', text: 'Acumula puntos por cada compra en los stands' },
              { icon: '🏆', text: 'Gana premios: café especial, kits, cursos y visitas a fincas' },
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

  hero:             { paddingTop: 44, paddingBottom: 32, paddingHorizontal: 24, alignItems: 'center', gap: 10 },
  heroBadge:        { borderRadius: 30, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: T.border + '80', marginBottom: 4 },
  heroBadgeText:    { color: T.coffeeDark, fontSize: 9, fontWeight: '900', letterSpacing: 3 },
  heroEmoji:        { fontSize: 50 },
  heroTitle:        { fontSize: 34, fontWeight: '900', color: '#FFF', letterSpacing: 4, lineHeight: 36 },
  heroSub:          { fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 20 },
  heroDecor:        { marginTop: 4, backgroundColor: T.amberPale, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  heroDecorText:    { color: T.coffeeDark, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },

  body:             { flex: 1, padding: 20, paddingTop: 24 },
  bodyTitle:        { fontSize: 15, fontWeight: '700', color: T.dark, textAlign: 'center', marginBottom: 18 },

  optCard:          { borderRadius: 18, overflow: 'hidden', marginBottom: 14, shadowColor: T.coffeeDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  optCardOutline:   { borderRadius: 18, borderWidth: 1.5, borderColor: T.border, marginBottom: 14, backgroundColor: T.card, shadowColor: T.dark, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  optGrad:          { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
  optGradOutline:   { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
  optIcon:          { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  optIconOutline:   { backgroundColor: T.amberPale },
  optEmoji:         { fontSize: 26 },
  optText:          { flex: 1 },
  optTitle:         { fontSize: 16, fontWeight: '900', color: '#FFF', marginBottom: 3 },
  optSub:           { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  optArrow:         { fontSize: 30, color: 'rgba(255,255,255,0.7)', fontWeight: '300' },

  benefitsBox:      { backgroundColor: T.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: T.border },
  benefitsTitle:    { fontSize: 11, fontWeight: '800', color: T.amber, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 },
  benefitItem:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  benefitIcon:      { fontSize: 20, marginTop: -2 },
  benefitText:      { flex: 1, fontSize: 13, color: T.body, lineHeight: 19 },
});
