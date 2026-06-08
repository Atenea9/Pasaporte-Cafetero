import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text, Animated } from 'react-native';
import { Asset } from 'expo-asset';
import { LinearGradient } from 'expo-linear-gradient';

interface Props { onFinish: () => void }

const videoModule = require('../../assets/intro.mp4');

export default function VideoIntroScreen({ onFinish }: Props) {
  const videoRef    = useRef<HTMLVideoElement | null>(null);
  const fallback    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeAnim    = useRef(new Animated.Value(1)).current;
  const [phase, setPhase] = useState<'splash' | 'playing'>('splash');
  const [ready, setReady] = useState(false);

  const finish = () => {
    if (fallback.current) clearTimeout(fallback.current);
    onFinish();
  };

  useEffect(() => {
    if (Platform.OS !== 'web') { finish(); return; }

    const load = async () => {
      try {
        const [asset] = await Asset.loadAsync(videoModule);
        const uri = asset.localUri ?? asset.uri;
        if (!videoRef.current || !uri) { finish(); return; }
        videoRef.current.src = uri;
        videoRef.current.load();
        setReady(true);
      } catch {
        finish();
      }
    };
    load();
    return () => { if (fallback.current) clearTimeout(fallback.current); };
  }, []);

  const handleStart = async () => {
    if (!videoRef.current || !ready) { finish(); return; }

    // User gesture → browser MUST allow sound
    videoRef.current.muted  = false;
    videoRef.current.volume = 1;

    try {
      await videoRef.current.play();
    } catch {
      finish();
      return;
    }

    // Fade out splash overlay
    Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
      setPhase('playing');
    });

    fallback.current = setTimeout(finish, 30_000);
  };

  if (Platform.OS !== 'web') return null;

  return (
    <View style={s.root}>
      {/* Video element — always mounted so it pre-buffers */}
      {/* @ts-ignore */}
      <video
        ref={videoRef}
        playsInline
        preload="auto"
        style={s.video as any}
        onEnded={finish}
        onError={finish}
      />

      {/* Splash overlay — shown until user taps START */}
      {phase === 'splash' && (
        <Animated.View style={[s.splash, { opacity: fadeAnim }]} pointerEvents="auto">
          <LinearGradient
            colors={['#1A0A00', '#3D1A00', '#5C2E00', '#2C1A0E']}
            style={StyleSheet.absoluteFill}
          />

          {/* Decorative top line */}
          <View style={s.splashTopLine} />

          {/* Badge */}
          <View style={s.badge}>
            <Text style={s.badgeText}>✦ FERIA INTERNACIONAL DEL CAFÉ ✦</Text>
          </View>

          {/* Coffee icon */}
          <Text style={s.splashIcon}>☕</Text>

          {/* Title */}
          <Text style={s.splashTitle}>PASAPORTE{'\n'}CAFETERO</Text>
          <Text style={s.splashSub}>Chaparral, Tolima · Colombia{'\n'}Agosto 2026</Text>

          {/* Separator */}
          <View style={s.sep}>
            <View style={s.sepLine} />
            <Text style={s.sepDot}>◆</Text>
            <View style={s.sepLine} />
          </View>

          {/* Start button */}
          <TouchableOpacity style={s.startBtn} onPress={handleStart} activeOpacity={0.85}>
            <LinearGradient colors={['#C8960C', '#E8B820', '#C8960C']} style={s.startGrad}>
              <Text style={s.startIcon}>▶</Text>
              <Text style={s.startText}>INICIAR EXPERIENCIA</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={s.soundNote}>🔊 Se reproducirá con sonido</Text>

          {/* Skip */}
          <TouchableOpacity style={s.splashSkip} onPress={finish} activeOpacity={0.7}>
            <Text style={s.splashSkipTxt}>Omitir ›</Text>
          </TouchableOpacity>

          {/* Bottom decoration */}
          <View style={s.splashBottomLine} />
        </Animated.View>
      )}

      {/* Skip button while playing */}
      {phase === 'playing' && (
        <TouchableOpacity style={s.skip} onPress={finish} activeOpacity={0.7}>
          <Text style={s.skipTxt}>Omitir  ›</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:            { flex: 1, backgroundColor: '#000' },
  video:           { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' } as any,

  splash:          { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', gap: 20 } as any,
  splashTopLine:   { position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: '#C8960C' },
  splashBottomLine:{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: '#C8960C' },

  badge:           { backgroundColor: 'rgba(200,150,12,0.15)', borderRadius: 30, paddingHorizontal: 20, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(200,150,12,0.4)' },
  badgeText:       { color: '#C8960C', fontSize: 9, fontWeight: '900', letterSpacing: 2.5 },

  splashIcon:      { fontSize: 64, marginTop: 4 },
  splashTitle:     { fontSize: 38, fontWeight: '900', color: '#FFF', textAlign: 'center', letterSpacing: 6, lineHeight: 44 },
  splashSub:       { fontSize: 13, color: 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 20 },

  sep:             { flexDirection: 'row', alignItems: 'center', gap: 12, width: 220 },
  sepLine:         { flex: 1, height: 1, backgroundColor: 'rgba(200,150,12,0.4)' },
  sepDot:          { color: '#C8960C', fontSize: 10 },

  startBtn:        { borderRadius: 50, overflow: 'hidden', shadowColor: '#C8960C', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20, elevation: 12, marginTop: 8 },
  startGrad:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 18, paddingHorizontal: 36 },
  startIcon:       { fontSize: 18, color: '#1A0A00' },
  startText:       { fontSize: 16, fontWeight: '900', color: '#1A0A00', letterSpacing: 2 },

  soundNote:       { fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: -8 },

  splashSkip:      { position: 'absolute', bottom: 40, right: 28, paddingHorizontal: 16, paddingVertical: 8 },
  splashSkipTxt:   { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '600', letterSpacing: 1 },

  skip:            { position: 'absolute', bottom: 36, right: 24, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  skipTxt:         { color: '#FFF', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
});
