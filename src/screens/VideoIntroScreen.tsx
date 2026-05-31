import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import { Asset } from 'expo-asset';

interface Props { onFinish: () => void }

const videoModule = require('../../assets/intro.mp4');

export default function VideoIntroScreen({ onFinish }: Props) {
  const videoRef  = useRef<HTMLVideoElement | null>(null);
  const fallback  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [muted, setMuted] = useState(false);

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

        // Try with sound first
        try {
          await videoRef.current.play();
        } catch {
          // Browser blocked audio autoplay — mute and retry
          videoRef.current.muted = true;
          setMuted(true);
          try {
            await videoRef.current.play();
          } catch {
            finish();
            return;
          }
        }

        fallback.current = setTimeout(finish, 10000);
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
        style={s.video as any}
        onEnded={finish}
        onError={finish}
      />

      {/* Unmute button — only shown when forced to mute */}
      {muted && (
        <TouchableOpacity
          style={s.unmuteBtn}
          onPress={() => {
            if (videoRef.current) {
              videoRef.current.muted = false;
              setMuted(false);
            }
          }}
          activeOpacity={0.75}
        >
          <Text style={s.unmuteTxt}>🔇  Activar sonido</Text>
        </TouchableOpacity>
      )}

      {/* Skip */}
      <TouchableOpacity style={s.skip} onPress={finish} activeOpacity={0.7}>
        <Text style={s.skipTxt}>Omitir  ›</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: '#000' },
  video:     { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' } as any,
  unmuteBtn: { position: 'absolute', top: 40, left: 20, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  unmuteTxt: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  skip:      { position: 'absolute', bottom: 36, right: 24, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  skipTxt:   { color: '#FFF', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
});
