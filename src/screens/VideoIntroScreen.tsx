import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import { Asset } from 'expo-asset';

interface Props { onFinish: () => void }

const videoModule = require('../../assets/intro.mp4');

export default function VideoIntroScreen({ onFinish }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fallback = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finish = () => {
    if (fallback.current) clearTimeout(fallback.current);
    onFinish();
  };

  useEffect(() => {
    if (Platform.OS !== 'web') { finish(); return; }

    Asset.loadAsync(videoModule).then(([asset]) => {
      const uri = asset.localUri ?? asset.uri;
      if (!videoRef.current || !uri) { finish(); return; }
      const vid = videoRef.current;
      vid.src = uri;
      vid.muted = false;
      vid.volume = 1;
      vid.play().catch(() => {
        vid.muted = true;
        vid.play().catch(finish);
      });
      fallback.current = setTimeout(finish, 35_000);
    }).catch(finish);

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
      <TouchableOpacity style={s.skip} onPress={finish} activeOpacity={0.7}>
        <Text style={s.skipTxt}>Omitir  ›</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#000' },
  video:   { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' } as any,
  skip:    { position: 'absolute', bottom: 36, right: 24, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  skipTxt: { color: '#FFF', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
});
