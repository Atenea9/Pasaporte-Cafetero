import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';
import { MUNICIPIOS, NIVELES, PREMIOS, getNivelActual, getNivelSiguiente, getMunicipiosPorRegion } from '../../data/mockData';

const C = { bg: '#0B1608', card: '#142210', card2: '#1C3018', gold: '#CFA020', goldLight: '#EAC040', text: '#F3EED6', muted: '#6A8060', danger: '#E05050' };

const PREMIO_ICON: Record<string, string> = { cafe: '☕', kits_cafe: '🎁', cursos: '📚', visitas_exclusivas: '🏡' };
const PREMIO_NAME: Record<string, string> = {
  cafe: 'Café Especial del Tolima',
  kits_cafe: 'Kit de Café Artesanal',
  cursos: 'Curso Certificado SCA',
  visitas_exclusivas: 'Visita Exclusiva a Finca',
};

export const PasaporteScreen = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let alive = true;
    if (user) {
      mockDbService.getUserStats(user.uid).then(d => { if (alive) { setStats(d); setLoading(false); } });
    }
    return () => { alive = false; };
  }, [user]));

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={C.gold} />
    </View>
  );

  const puntos: number = stats?.points ?? 0;
  const obtainedStamps: string[] = stats?.stamps ?? [];
  const nivelActual = getNivelActual(puntos);
  const nivelSig = getNivelSiguiente(puntos);
  const progPct = nivelActual && nivelSig
    ? Math.min(((puntos - nivelActual.minPuntos) / (nivelSig.minPuntos - nivelActual.minPuntos)) * 100, 100)
    : nivelActual ? 100 : 0;
  const porRegion = getMunicipiosPorRegion();

  return (
    <LinearGradient colors={[C.bg, '#0F1E0B', C.bg]} style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Passport Cover */}
        <LinearGradient colors={['#3A2618', '#2A1A0E', '#1A110A']} style={s.cover}>
          <View style={s.coverTop}>
            <View>
              <Text style={s.coverCountry}>REPÚBLICA DE COLOMBIA</Text>
              <Text style={s.coverTitle}>PASAPORTE CAFETERO</Text>
              <Text style={s.coverFair}>Feria Internacional del Café · Chaparral 2026</Text>
            </View>
            {nivelActual && (
              <View style={[s.levelBadge, { backgroundColor: nivelActual.color }]}>
                <Text style={s.levelBadgeEmoji}>{nivelActual.emoji}</Text>
                <Text style={s.levelBadgeText}>{nivelActual.nombre}</Text>
              </View>
            )}
          </View>

          {/* QR Code Placeholder */}
          <View style={s.qrWrap}>
            <View style={s.qrCode}>
              <Text style={s.qrText}>▓▓▓▓▓▓▓{'\n'}▓░░░░░▓{'\n'}▓░▓░░▓▓{'\n'}▓░░░░░▓{'\n'}▓▓▓▓▓▓▓</Text>
            </View>
            <View style={s.qrInfo}>
              <Text style={s.qrLabel}>ID ÚNICO</Text>
              <Text style={s.qrId}>{user?.uid?.slice(-8).toUpperCase() || 'CF2026'}</Text>
              <Text style={s.qrInstruction}>{t('passport.qr_instruction', 'Muestra este QR al vendedor')}</Text>
            </View>
          </View>

          {/* Points & Progress */}
          <View style={s.ptsRow}>
            <View style={s.ptsBox}>
              <Text style={s.ptsNum}>{puntos}</Text>
              <Text style={s.ptsLbl}>{t('common.points', 'PUNTOS')}</Text>
            </View>
            <View style={{ flex: 1, marginHorizontal: 16 }}>
              <View style={s.progBg}>
                <View style={[s.progFill, { width: `${progPct}%` as any, backgroundColor: nivelActual?.color ?? C.muted }]} />
              </View>
              {nivelSig && <Text style={s.progLbl}>{nivelSig.minPuntos - puntos} pts → {nivelSig.nombre}</Text>}
              {!nivelSig && nivelActual && <Text style={[s.progLbl, { color: C.gold }]}>🏆 Nivel máximo alcanzado</Text>}
              {!nivelActual && <Text style={s.progLbl}>¡Haz una compra para ganar puntos!</Text>}
            </View>
            <View style={s.ptsBox}>
              <Text style={s.ptsNum}>{obtainedStamps.length}</Text>
              <Text style={s.ptsLbl}>{t('common.stamps', 'SELLOS')}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Prizes Section */}
        <Text style={s.sectionTitle}>{t('prizes.title', 'PREMIOS POR NIVEL')}</Text>
        <View style={s.prizesGrid}>
          {NIVELES.map((niv) => {
            const unlocked = nivelActual ? NIVELES.indexOf(nivelActual) >= NIVELES.indexOf(niv) : false;
            return (
              <View key={niv.id} style={[s.prizeCard, { borderColor: unlocked ? niv.color : C.card2, opacity: unlocked ? 1 : 0.5 }]}>
                <LinearGradient colors={unlocked ? [niv.color + '33', C.card] : [C.card, C.card]} style={s.prizeGrad}>
                  <Text style={s.prizeEmoji}>{PREMIO_ICON[niv.premioKey]}</Text>
                  <Text style={[s.prizeNivel, { color: unlocked ? niv.color : C.muted }]}>{niv.nombre}</Text>
                  <Text style={s.prizeName}>{PREMIO_NAME[niv.premioKey]}</Text>
                  <Text style={s.prizeRange}>{niv.minPuntos}{niv.maxPuntos > 9000 ? '+ pts' : `–${niv.maxPuntos} pts`}</Text>
                  {unlocked ? <Text style={[s.prizeStatus, { color: niv.color }]}>✓ DESBLOQUEADO</Text> : <Text style={[s.prizeStatus, { color: C.muted }]}>🔒 Bloqueado</Text>}
                </LinearGradient>
              </View>
            );
          })}
        </View>

        {/* Stamp Album */}
        <Text style={[s.sectionTitle, { marginTop: 8 }]}>{t('passport.stamp_album', 'ÁLBUM DE SELLOS')}</Text>
        <View style={s.albumHeader}>
          <Text style={s.albumSub}>{obtainedStamps.length} / 38 sellos obtenidos</Text>
          {obtainedStamps.length === 38 && <Text style={s.albumComplete}>🏆 ¡Álbum Completo!</Text>}
        </View>

        {(['Norte', 'Centro', 'Sur'] as const).map((region) => {
          const muns = porRegion[region] ?? [];
          const obtainedInRegion = muns.filter(m => obtainedStamps.includes(m.id)).length;
          return (
            <View key={region} style={s.regionBlock}>
              <View style={s.regionHeader}>
                <Text style={s.regionName}>REGIÓN {region.toUpperCase()}</Text>
                <Text style={s.regionCount}>{obtainedInRegion}/{muns.length}</Text>
              </View>
              <View style={s.stampsGrid}>
                {muns.map((mun) => {
                  const obtained = obtainedStamps.includes(mun.id);
                  return (
                    <View key={mun.id} style={[s.stamp, { borderColor: obtained ? mun.color : C.card2 }, obtained && { backgroundColor: mun.color + '22' }]}>
                      <Text style={s.stampEmoji}>{obtained ? mun.emoji : '?'}</Text>
                      <Text style={[s.stampName, { color: obtained ? mun.color : C.muted }]} numberOfLines={2}>{obtained ? mun.nombre : '???'}</Text>
                      {obtained && <View style={[s.stampDot, { backgroundColor: mun.color }]} />}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
};

export default PasaporteScreen;

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 50, paddingBottom: 40 },
  cover: { borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1.5, borderColor: C.gold + '60' },
  coverTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  coverCountry: { fontSize: 9, color: C.muted, letterSpacing: 2, textTransform: 'uppercase' },
  coverTitle: { fontSize: 18, fontWeight: '900', color: C.gold, letterSpacing: 1, marginVertical: 4 },
  coverFair: { fontSize: 10, color: C.muted },
  levelBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center', maxWidth: 110 },
  levelBadgeEmoji: { fontSize: 18 },
  levelBadgeText: { fontSize: 9, fontWeight: '900', color: C.bg, textAlign: 'center', marginTop: 2 },
  qrWrap: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  qrCode: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 10, padding: 12, width: 90, height: 90, justifyContent: 'center', alignItems: 'center' },
  qrText: { fontSize: 10, color: C.bg, fontWeight: '900', lineHeight: 14, letterSpacing: 1, fontFamily: 'monospace' },
  qrInfo: { flex: 1 },
  qrLabel: { fontSize: 9, color: C.muted, letterSpacing: 2 },
  qrId: { fontSize: 20, fontWeight: '900', color: C.goldLight, letterSpacing: 2, marginVertical: 4 },
  qrInstruction: { fontSize: 10, color: C.muted, lineHeight: 14 },
  ptsRow: { flexDirection: 'row', alignItems: 'center' },
  ptsBox: { alignItems: 'center', minWidth: 60 },
  ptsNum: { fontSize: 26, fontWeight: '900', color: C.gold },
  ptsLbl: { fontSize: 9, color: C.muted, letterSpacing: 1 },
  progBg: { height: 8, backgroundColor: C.bg + '99', borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  progFill: { height: '100%', borderRadius: 4 },
  progLbl: { fontSize: 10, color: C.muted },
  sectionTitle: { fontSize: 10, fontWeight: '900', color: C.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
  prizesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  prizeCard: { width: '47.5%', borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  prizeGrad: { padding: 14 },
  prizeEmoji: { fontSize: 24, marginBottom: 6 },
  prizeNivel: { fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  prizeName: { fontSize: 12, color: C.text, fontWeight: '700', marginBottom: 4, lineHeight: 16 },
  prizeRange: { fontSize: 10, color: C.muted, marginBottom: 6 },
  prizeStatus: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  albumHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  albumSub: { fontSize: 12, color: C.muted },
  albumComplete: { fontSize: 13, color: C.gold, fontWeight: '900' },
  regionBlock: { marginBottom: 20 },
  regionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  regionName: { fontSize: 10, fontWeight: '900', color: C.goldLight, letterSpacing: 2 },
  regionCount: { fontSize: 11, color: C.muted },
  stampsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stamp: { width: 76, height: 76, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', padding: 4, backgroundColor: C.card },
  stampEmoji: { fontSize: 22 },
  stampName: { fontSize: 8, fontWeight: '700', textAlign: 'center', marginTop: 3, lineHeight: 10 },
  stampDot: { position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: 3 },
});
