import React, { useRef, useEffect, useState } from 'react';
import {
  View, StyleSheet, Platform, TouchableOpacity,
  Text, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Asset } from 'expo-asset';

interface Props { onFinish: () => void }

const videoModule = require('../../assets/intro.mp4');

export default function VideoIntroScreen({ onFinish }: Props) {
  const [phase, setPhase] = useState<'tap' | 'playing' | 'done'>('tap');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const videoRef   = useRef<HTMLVideoElement | null>(null);
  const fallback   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;

  const clearTimer = () => { if (fallback.current) clearTimeout(fallback.current); };

  const finish = () => {
    clearTimer();
    setPhase('done');
    onFinish();
  };

  useEffect(() => {
    if (Platform.OS !== 'web') { finish(); return; }

    Asset.loadAsync(videoModule)
      .then(([a]) => setVideoUri(a.localUri ?? a.uri))
      .catch(() => finish());

    Animated.timing(fadeInAnim, {
      toValue: 1, duration: 600,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();

    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: false }),
      Animated.timing(pulseAnim, { toValue: 1.00, duration: 900, useNativeDriver: false }),
    ])).start();

    return clearTimer;
  }, []);

  const startVideo = () => {
    if (!videoUri || !videoRef.current) return;
    setPhase('playing');
    videoRef.current.src = videoUri;
    videoRef.current.play().catch(() => finish());
    fallback.current = setTimeout(finish, 8000);
  };

  if (Platform.OS !== 'web') return null;

  return (
    <View style={s.root}>
      {/* Tap-to-start overlay */}
      {phase === 'tap' && (
        <Animated.View style={[s.tapOverlay, { opacity: fadeInAnim }]}>
          <LinearGradient
            colors={['#0D0800', '#1A1000', '#2C1800']}
            style={StyleSheet.absoluteFill}
          />

          <View style={s.logoWrap}>
            <View style={s.logoRing} />
            <LinearGradient colors={['#5C3520', '#7B4A2A', '#5C3520']} style={s.logoCircle}>
              <Text style={s.logoEmoji}>☕</Text>
            </LinearGradient>
          </View>

          <Text style={s.titleLine1}>PASAPORTE</Text>
          <Text style={s.titleLine2}>CAFETERO</Text>

          <View style={s.divider}>
            <View style={s.divLine} />
            <Text style={s.divStar}>✦</Text>
            <View style={s.divLine} />
          </View>

          <Text style={s.fairLabel}>Feria Internacional del Café</Text>
          <Text style={s.fairCity}>CHAPARRAL · TOLIMA</Text>

          <TouchableOpacity
            style={s.tapBtn}
            onPress={startVideo}
            activeOpacity={0.85}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <LinearGradient colors={['#C8960C', '#E8B820']} style={s.tapBtnGrad}>
                <Text style={s.tapBtnText}>▶  INGRESAR</Text>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>

          <Text style={s.skipTapText} onPress={finish}>Omitir</Text>
        </Animated.View>
      )}

      {/* Video player (visible while playing) */}
      {/* @ts-ignore */}
      <video
        ref={videoRef}
        playsInline
        style={{
          ...s.video as any,
          display: phase === 'playing' ? 'block' : 'none',
        }}
        onEnded={finish}
        onError={finish}
      />

      {/* Skip button while video plays */}
      {phase === 'playing' && (
        <TouchableOpacity style={s.skipBtn} onPress={finish} activeOpacity={0.7}>
          <Text style={s.skipBtnText}>Omitir  ›</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#000' },

  tapOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },

  logoWrap:   { width: 120, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  logoRing:   { position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 1.5, borderColor: 'rgba(200,150,12,0.45)' },
  logoCircle: { width: 104, height: 104, borderRadius: 52, alignItems: 'center', justifyContent: 'center' },
  logoEmoji:  { fontSize: 52 },

  titleLine1: { fontSize: 38, fontWeight: '900', color: '#F5EDD8', letterSpacing: 3, lineHeight: 42 },
  titleLine2: { fontSize: 38, fontWeight: '900', color: '#C8960C', letterSpacing: 3, lineHeight: 46, marginBottom: 20 },

  divider:    { flexDirection: 'row', alignItems: 'center', width: 180, marginBottom: 16, gap: 10 },
  divLine:    { flex: 1, height: 1, backgroundColor: 'rgba(200,150,12,0.4)' },
  divStar:    { color: '#C8960C', fontSize: 11 },

  fairLabel:  { fontSize: 11, fontWeight: '700', color: 'rgba(245,237,216,0.65)', letterSpacing: 2, marginBottom: 4 },
  fairCity:   { fontSize: 17, fontWeight: '900', color: '#F5EDD8', letterSpacing: 4, marginBottom: 40 },

  tapBtn:     { borderRadius: 30, overflow: 'hidden', shadowColor: '#C8960C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8, marginBottom: 24 },
  tapBtnGrad: { paddingHorizontal: 40, paddingVertical: 16 },
  tapBtnText: { fontSize: 17, fontWeight: '900', color: '#1A0C00', letterSpacing: 3 },

  skipTapText:{ fontSize: 12, color: 'rgba(245,237,216,0.45)', letterSpacing: 1, textDecorationLine: 'underline' },

  video:      { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' } as any,

  skipBtn:    { position: 'absolute', bottom: 32, right: 24, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  skipBtnText:{ color: '#FFF', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
});
