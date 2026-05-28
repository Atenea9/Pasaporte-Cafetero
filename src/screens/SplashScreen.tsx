import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Easing, Dimensions, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface Props { onFinish: () => void }

export default function SplashScreen({ onFinish }: Props) {
  const bagScale     = useRef(new Animated.Value(0.4)).current;
  const bagOpacity   = useRef(new Animated.Value(0)).current;
  const lineScale    = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY       = useRef(new Animated.Value(20)).current;
  const subOpacity   = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // On web, setTimeout freezes in the iframe when unfocused — call onFinish immediately
    if (Platform.OS === 'web') {
      onFinish();
      return;
    }

    const fallback = setTimeout(() => onFinish(), 2200);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(bagScale,   { toValue: 1, duration: 500, easing: Easing.out(Easing.back(1.5)), useNativeDriver: false }),
        Animated.timing(bagOpacity, { toValue: 1, duration: 380, useNativeDriver: false }),
      ]),
      Animated.timing(lineScale,    { toValue: 1, duration: 260, easing: Easing.out(Easing.exp), useNativeDriver: false }),
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 380, useNativeDriver: false }),
        Animated.timing(titleY,       { toValue: 0, duration: 380, easing: Easing.out(Easing.exp), useNativeDriver: false }),
      ]),
      Animated.timing(subOpacity,   { toValue: 1, duration: 280, useNativeDriver: false }),
      Animated.timing(screenOpacity,{ toValue: 0, duration: 400, useNativeDriver: false }),
    ]).start(() => {
      clearTimeout(fallback);
      onFinish();
    });

    return () => clearTimeout(fallback);
  }, []);

  return (
    <Animated.View style={[s.root, { opacity: screenOpacity }]}>
      <LinearGradient
        colors={['#060F04', '#0C1A08', '#152210']}
        style={StyleSheet.absoluteFill}
      />

      {/* Warm gold glow behind bag */}
      <View
        style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}
        pointerEvents="none"
      >
        <View style={s.glow} />
      </View>

      {/* Coffee bag */}
      <Animated.Image
        source={require('../../assets/coffee-bag.png')}
        style={[s.bag, { transform: [{ scale: bagScale }], opacity: bagOpacity }]}
        resizeMode="contain"
      />

      {/* Divider */}
      <Animated.View style={[s.dividerRow, { transform: [{ scaleX: lineScale }] }]}>
        <View style={s.dividerLine} />
        <Text style={s.dividerStar}>✦</Text>
        <View style={s.dividerLine} />
      </Animated.View>

      {/* PASAPORTE CAFETERO */}
      <Animated.View style={[s.titleBlock, { opacity: titleOpacity, transform: [{ translateY: titleY }] }]}>
        <Text style={s.title}>PASAPORTE</Text>
        <Text style={s.titleGold}>CAFETERO</Text>
      </Animated.View>

      {/* Feria / Chaparral / 2026 */}
      <Animated.View style={[s.subBlock, { opacity: subOpacity }]}>
        <Text style={s.fairName}>Feria Internacional de Café</Text>
        <Text style={s.city}>CHAPARRAL</Text>
        <Text style={s.year}>2 0 2 6</Text>
      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0C1A08' },
  glow:        {
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: '#CFA020',
    opacity: 0.1,
    shadowColor: '#CFA020', shadowRadius: 80, shadowOpacity: 0.8,
  },
  bag:         { width: 130, height: 130, marginBottom: 22 },
  dividerRow:  { flexDirection: 'row', alignItems: 'center', width: '52%', marginBottom: 20, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#CFA02060' },
  dividerStar: { color: '#CFA020', fontSize: 10 },
  titleBlock:  { alignItems: 'center', marginBottom: 26 },
  title:       { fontSize: 40, fontWeight: '900', color: '#F3EED6', letterSpacing: -0.5, lineHeight: 42 },
  titleGold:   { fontSize: 40, fontWeight: '900', color: '#CFA020', letterSpacing: -0.5, lineHeight: 44 },
  subBlock:    { alignItems: 'center', gap: 4 },
  fairName:    { fontSize: 12, fontWeight: '700', color: '#EAC040', letterSpacing: 1.5 },
  city:        { fontSize: 20, fontWeight: '900', color: '#F3EED6', letterSpacing: 4, marginTop: 2 },
  year:        { fontSize: 10, color: '#6A8060', letterSpacing: 6, marginTop: 2 },
});
