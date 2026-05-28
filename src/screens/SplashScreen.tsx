import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const GOLD   = '#C8960C';
const GOLD_L = '#E8B820';
const CREAM  = '#F5EDD8';

interface Props { onFinish: () => void }

export default function SplashScreen({ onFinish }: Props) {
  const allOpacity   = useRef(new Animated.Value(0)).current;
  const logoScale    = useRef(new Animated.Value(0.6)).current;
  const lineScale    = useRef(new Animated.Value(0)).current;
  const titleY       = useRef(new Animated.Value(18)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subOpacity   = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Everything fades in + logo scales up
      Animated.parallel([
        Animated.timing(allOpacity, { toValue: 1, duration: 320, easing: Easing.out(Easing.quad), useNativeDriver: false }),
        Animated.timing(logoScale,  { toValue: 1, duration: 450, easing: Easing.out(Easing.back(1.4)), useNativeDriver: false }),
      ]),
      // 2. Divider line draws in
      Animated.timing(lineScale, { toValue: 1, duration: 280, easing: Easing.out(Easing.exp), useNativeDriver: false }),
      // 3. Title slides up and fades
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 360, useNativeDriver: false }),
        Animated.timing(titleY,       { toValue: 0, duration: 360, easing: Easing.out(Easing.exp), useNativeDriver: false }),
      ]),
      // 4. Sub-info fades
      Animated.timing(subOpacity, { toValue: 1, duration: 300, useNativeDriver: false }),
      // 5. Hold 800ms
      Animated.timing(screenOpacity, { toValue: 1, duration: 800, useNativeDriver: false }),
      // 6. Fade out
      Animated.timing(screenOpacity, { toValue: 0, duration: 450, useNativeDriver: false }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[s.root, { opacity: screenOpacity }]}>
      <LinearGradient colors={['#1A0C00', '#2C1800', '#3A2200']} style={StyleSheet.absoluteFill} />

      <Animated.View style={[s.content, { opacity: allOpacity }]}>

        {/* Logo with decorative rings centered around it */}
        <View style={s.logoContainer}>
          {/* Rings behind logo */}
          <View style={s.ring2} />
          <View style={s.ring1} />
          <View style={s.glowRing} />
          {/* Logo on top */}
          <Animated.View style={[s.logoWrap, { transform: [{ scale: logoScale }] }]}>
            <LinearGradient colors={['#5C3520', '#7B4A2A', '#5C3520']} style={s.logoCircle}>
              <Text style={s.logoEmoji}>☕</Text>
            </LinearGradient>
            <View style={s.logoRing} />
          </Animated.View>
        </View>

        {/* Divider */}
        <Animated.View style={[s.dividerRow, { transform: [{ scaleX: lineScale }] }]}>
          <View style={s.dividerLine} />
          <Text style={s.dividerStar}>✦</Text>
          <View style={s.dividerLine} />
        </Animated.View>

        {/* Title */}
        <Animated.View style={[s.titleBlock, { opacity: titleOpacity, transform: [{ translateY: titleY }] }]}>
          <Text style={s.title}>PASAPORTE</Text>
          <Text style={s.titleGold}>CAFETERO</Text>
        </Animated.View>

        {/* Sub info */}
        <Animated.View style={[s.subBlock, { opacity: subOpacity }]}>
          <View style={s.subBadge}>
            <Text style={s.subBadgeText}>✦ EDICIÓN 2026 ✦</Text>
          </View>
          <Text style={s.fairName}>Feria Internacional del Café</Text>
          <Text style={s.city}>CHAPARRAL · TOLIMA</Text>
          <View style={s.yearRow}>
            <View style={s.yearLine} />
            <Text style={s.year}>14 · 15 · 16 DE AGOSTO</Text>
            <View style={s.yearLine} />
          </View>
        </Animated.View>

      </Animated.View>
    </Animated.View>
  );
}

const RING_SIZE = 240;

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#1A0C00' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 0 },

  // Logo container — rings + logo all stacked and centered together
  logoContainer: { width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  ring1:   { position: 'absolute', width: RING_SIZE,       height: RING_SIZE,       borderRadius: RING_SIZE / 2,   borderWidth: 1, borderColor: GOLD + '25' },
  ring2:   { position: 'absolute', width: RING_SIZE - 50,  height: RING_SIZE - 50,  borderRadius: (RING_SIZE-50)/2, borderWidth: 1, borderColor: GOLD + '15' },
  glowRing:{ position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: GOLD + '14' },

  logoWrap:   { position: 'absolute' },
  logoCircle: { width: 108, height: 108, borderRadius: 54, alignItems: 'center', justifyContent: 'center' },
  logoEmoji:  { fontSize: 50 },
  logoRing:   { position: 'absolute', top: -4, left: -4, width: 116, height: 116, borderRadius: 58, borderWidth: 1.5, borderColor: GOLD + '65' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', width: 200, marginBottom: 22, gap: 12 },
  dividerLine:{ flex: 1, height: 1, backgroundColor: GOLD + '55' },
  dividerStar:{ color: GOLD, fontSize: 11 },

  titleBlock: { alignItems: 'center', marginBottom: 30 },
  title:      { fontSize: 40, fontWeight: '900', color: CREAM, letterSpacing: 2, lineHeight: 42 },
  titleGold:  { fontSize: 40, fontWeight: '900', color: GOLD, letterSpacing: 2, lineHeight: 46 },

  subBlock:    { alignItems: 'center', gap: 6 },
  subBadge:    { borderRadius: 30, paddingHorizontal: 18, paddingVertical: 6, borderWidth: 1, borderColor: GOLD + '50', backgroundColor: GOLD + '15', marginBottom: 2 },
  subBadgeText:{ fontSize: 10, fontWeight: '900', color: GOLD_L, letterSpacing: 3.5 },
  fairName:    { fontSize: 11, fontWeight: '700', color: CREAM + 'AA', letterSpacing: 1.5 },
  city:        { fontSize: 18, fontWeight: '900', color: CREAM, letterSpacing: 4 },
  yearRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  yearLine:    { width: 22, height: 1, backgroundColor: GOLD + '40' },
  year:        { fontSize: 10, color: GOLD + 'AA', letterSpacing: 2.5, fontWeight: '700' },
});
