import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text, Animated } from 'react-native';
import { Asset } from 'expo-asset';

interface Props { onFinish: () => void }

const videoModule = require('../../assets/intro.mp4');

export default function VideoIntroScreen({ onFinish }: Props) {
  const videoRef  = useRef<HTMLVideoElement | null>(null);
  const fallback  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [muted, setMuted]     = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const finish = () => {
    if (fallback.current) clearTimeout(fallback.current);
    onFinish();
  };

  useEffect(() => {
    if (Platform.OS !== 'web') { finish(); return; }

    const play = async () => {
      try {
        const [asset] = await Asset.loadAsync(videoModule);
        const uri = asset.localUri ?? asset.uri;
        if (!videoRef.current || !uri) { finish(); return; }

        videoRef.current.src = uri;
        videoRef.current.muted  = false;
        videoRef.current.volume = 1;

        try {
          await videoRef.current.play();
          // Sound is playing
        } catch {
          // Browser blocked audio — mute and retry
          videoRef.current.muted = true;
          setMuted(true);
          Animated.loop(Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.1, duration: 600, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1,   duration: 600, useNativeDriver: true }),
          ])).start();
          try { await videoRef.current.play(); } catch { finish(); return; }
        }

        fallback.current = setTimeout(finish, 30_000);
      } catch {
        finish();
      }
    };

    play();
    return () => { if (fallback.current) clearTimeout(fallback.current); };
  }, []);

  if (Platform.OS !== 'web') return null;

  return (
    <View style={s.root}>
      {/* @ts-ignore */}
      <video
        ref={videoRef}
        playsInline
        preload="auto"
        style={s.video as any}
        onEnded={finish}
        onError={finish}
      />

      {/* Unmute pill — prominent but not a full splash */}
      {muted && (
        <Animated.View style={[s.unmutePill, { transform: [{ scale: pulseAnim }] }]}>
          <TouchableOpacity
            style={s.unmuteTouchable}
            onPress={() => {
              if (videoRef.current) {
                videoRef.current.muted = false;
                videoRef.current.volume = 1;
                setMuted(false);
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={s.unmuteIcon}>🔇</Text>
            <Text style={s.unmuteTxt}>Toca para activar sonido</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Skip */}
      <TouchableOpacity style={s.skip} onPress={finish} activeOpacity={0.7}>
        <Text style={s.skipTxt}>Omitir  ›</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: '#000' },
  video: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' } as any,

  unmutePill: {
    position: 'absolute', top: 48, alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: 40, borderWidth: 1, borderColor: 'rgba(200,150,12,0.6)',
    overflow: 'hidden',
  },
  unmuteTouchable: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 22, paddingVertical: 12,
  },
  unmuteIcon: { fontSize: 18 },
  unmuteTxt:  { color: '#F5D87A', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },

  skip:    { position: 'absolute', bottom: 36, right: 24, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  skipTxt: { color: '#FFF', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
});
