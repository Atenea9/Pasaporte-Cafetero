import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import { Asset } from 'expo-asset';

interface Props { onFinish: () => void }

const videoModule = require('../../assets/intro.mp4');

export default function VideoIntroScreen({ onFinish }: Props) {
  const videoRef   = useRef<HTMLVideoElement | null>(null);
  const fallback   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready, setReady]     = useState(false);
  const [started, setStarted] = useState(false);

  const finish = () => {
    if (fallback.current) clearTimeout(fallback.current);
    onFinish();
  };

  useEffect(() => {
    if (Platform.OS !== 'web') { finish(); return; }

    Asset.loadAsync(videoModule).then(([asset]) => {
      const uri = asset.localUri ?? asset.uri;
      if (!videoRef.current || !uri) { finish(); return; }
      videoRef.current.src = uri;
      videoRef.current.load();
      setReady(true);
    }).catch(() => finish());

    return () => { if (fallback.current) clearTimeout(fallback.current); };
  }, []);

  const handleStart = async () => {
    if (!videoRef.current) return;
    setStarted(true);
    videoRef.current.muted  = false;
    videoRef.current.volume = 1;
    try {
      await videoRef.current.play();
      fallback.current = setTimeout(finish, 35_000);
    } catch {
      finish();
    }
  };

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

      {ready && !started && (
        <TouchableOpacity
          style={s.overlay}
          onPress={handleStart}
          activeOpacity={1}
        >
          <View style={s.playBtn}>
            <Text style={s.playIcon}>▶</Text>
          </View>
          <Text style={s.hint}>Toca para comenzar</Text>
        </TouchableOpacity>
      )}

      {started && (
        <TouchableOpacity style={s.skip} onPress={finish} activeOpacity={0.7}>
          <Text style={s.skipTxt}>Omitir  ›</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#000' },
  video:   {
    position: 'absolute', top: 0, left: 0,
    width: '100%', height: '100%', objectFit: 'cover',
  } as any,

  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  playBtn: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(200,134,10,0.9)',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
  },
  playIcon: { fontSize: 30, color: '#FFF', marginLeft: 6 },
  hint: { marginTop: 16, color: 'rgba(255,255,255,0.85)', fontSize: 14, letterSpacing: 1, fontWeight: '600' },

  skip:    {
    position: 'absolute', bottom: 36, right: 24,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  skipTxt: { color: '#FFF', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
});
