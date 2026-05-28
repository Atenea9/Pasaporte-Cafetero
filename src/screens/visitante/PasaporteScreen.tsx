import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Animated, Dimensions, SafeAreaView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';
import {
  MUNICIPIOS, NIVELES, getNivelActual, getNivelSiguiente, getMunicipiosPorRegion
} from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import type { VisitanteNavProp } from '../../navigation/types';

const { width } = Dimensions.get('window');

const T = {
  bg:          '#FAF7F0',
  parchment:   '#F0E8D0',
  parchDark:   '#E8D5B0',
  leather:     '#8B5E3C',
  leatherDark: '#6B4226',
  gold:        '#B8860B',
  goldLight:   '#D4A520',
  goldPale:    '#F5E6B0',
  green:       '#2D5A1E',
  greenPale:   '#E8F2E4',
  dark:        '#2C1810',
  body:        '#4A3728',
  muted:       '#8A7060',
  card:        '#FFFFFF',
  border:      '#D4B896',
  ink:         '#3A2818',
};

const STAMP_SHAPES = ['circle', 'hexagon', 'octagon', 'round-rect'];

function StampShape({ mun, size = 76, obtained }: { mun: typeof MUNICIPIOS[0]; size?: number; obtained: boolean }) {
  const baseStyle = {
    width: size, height: size, alignItems: 'center' as const, justifyContent: 'center' as const, padding: 4,
  };

  if (!obtained) {
    return (
      <View style={[baseStyle, ss.stampEmpty]}>
        <Text style={[ss.stampQ, { fontSize: size * 0.32 }]}>?</Text>
        <View style={ss.stampLines}>
          <View style={ss.stampLine} />
          <View style={ss.stampLine} />
        </View>
      </View>
    );
  }

  return (
    <View style={[baseStyle, ss.stampObtained, { borderColor: mun.color }]}>
      <LinearGradient colors={[mun.color + '22', mun.color + '08']} style={StyleSheet.absoluteFill} />
      <View style={[ss.stampInnerRing, { borderColor: mun.color + '60' }]} />
      <Text style={[ss.stampEmoji, { fontSize: size * 0.3 }]}>{mun.emoji}</Text>
      <View style={[ss.stampInk, { backgroundColor: mun.color }]} />
    </View>
  );
}

function PassportPage({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <View style={pg.page}>
      <View style={pg.pageInner}>
        {title && (
          <View style={pg.pageHeader}>
            <View style={pg.headerLine} />
            <Text style={pg.pageTitle}>{title}</Text>
            <View style={pg.headerLine} />
          </View>
        )}
        {children}
      </View>
      <View style={pg.pageBinding} />
    </View>
  );
}

export const PasaporteScreen = () => {
  const nav = useNavigation<VisitanteNavProp>();
  const { user } = useAuth();
  const { state } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(useCallback(() => {
    let alive = true;
    if (user) {
      mockDbService.getUserStats(user.uid).then(d => {
        if (alive) { setStats(d); setLoading(false); }
      });
    }
    return () => { alive = false; };
  }, [user]));

  if (loading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={T.gold} />
      <Text style={{ color: T.muted, marginTop: 12, fontSize: 13 }}>Abriendo tu pasaporte...</Text>
    </SafeAreaView>
  );

  const puntos: number = stats?.points ?? 0;
  const obtainedStamps: string[] = stats?.stamps ?? [];
  const nivelActual = getNivelActual(puntos);
  const nivelSig = getNivelSiguiente(puntos);
  const progPct = nivelActual && nivelSig
    ? Math.min(((puntos - nivelActual.minPuntos) / (nivelSig.minPuntos - nivelActual.minPuntos)) * 100, 100)
    : nivelActual ? 100 : 0;
  const porRegion = getMunicipiosPorRegion();
  const nombre = state.usuario?.nombre || user?.name || 'Cafetero';

  const PAGES = [
    { id: 'cover',   label: 'Portada',  icon: '📗' },
    { id: 'norte',   label: 'Norte',    icon: '🗺️' },
    { id: 'centro',  label: 'Centro',   icon: '🗺️' },
    { id: 'sur',     label: 'Sur',      icon: '🗺️' },
    { id: 'premios', label: 'Premios',  icon: '🏆' },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* Top Bar */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Text style={s.backIcon}>‹</Text>
          <Text style={s.backText}>Inicio</Text>
        </TouchableOpacity>
        <Text style={s.topTitle}>Pasaporte Cafetero</Text>
        <View style={s.stampCount}>
          <Text style={s.stampCountNum}>{obtainedStamps.length}</Text>
          <Text style={s.stampCountOf}>/38</Text>
        </View>
      </View>

      {/* Page Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsScroll} contentContainerStyle={s.tabsContent}>
        {PAGES.map((p, i) => (
          <TouchableOpacity
            key={p.id}
            style={[s.tab, activePage === i && s.tabActive]}
            onPress={() => { setActivePage(i); scrollRef.current?.scrollTo({ y: 0, animated: true }); }}
          >
            <Text style={[s.tabText, activePage === i && s.tabTextActive]}>{p.icon} {p.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── PAGE 0: PORTADA ── */}
        {activePage === 0 && (
          <View>
            {/* Passport Cover */}
            <View style={s.coverWrap}>
              <LinearGradient colors={[T.leatherDark, T.leather, '#A0714F']} style={s.cover}>
                {/* Embossed header */}
                <View style={s.embossHeader}>
                  <View style={s.embossLine} />
                  <Text style={s.embossCountry}>REPÚBLICA DE COLOMBIA</Text>
                  <View style={s.embossLine} />
                </View>
                <Text style={s.embossTitle}>PASAPORTE CAFETERO</Text>
                <Text style={s.embossSubtitle}>FERIA INTERNACIONAL DEL CAFÉ</Text>
                <Text style={s.embossCity}>CHAPARRAL · TOLIMA · 2026</Text>

                {/* Decorative coffee seal */}
                <View style={s.seal}>
                  <Text style={s.sealEmoji}>☕</Text>
                  <View style={s.sealRing} />
                  <View style={s.sealRing2} />
                </View>

                {/* Badge */}
                {nivelActual && (
                  <View style={[s.levelBadge, { backgroundColor: nivelActual.color }]}>
                    <Text style={s.levelBadgeEmoji}>{nivelActual.emoji}</Text>
                    <Text style={s.levelBadgeName}>{nivelActual.nombre}</Text>
                  </View>
                )}
              </LinearGradient>

              {/* Book spine effect */}
              <View style={s.spine} />
            </View>

            {/* Inside page 1: Identity */}
            <PassportPage title="IDENTIFICACIÓN DEL PORTADOR">
              <View style={s.idSection}>
                <View style={s.idAvatar}>
                  <Text style={s.idAvatarText}>{nombre.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={s.idData}>
                  <Text style={s.idLabel}>NOMBRE COMPLETO</Text>
                  <Text style={s.idValue}>{nombre.toUpperCase()}</Text>
                  <Text style={s.idLabel}>DOCUMENTO</Text>
                  <Text style={s.idValue}>{state.usuario?.cedula || user?.uid?.slice(-8).toUpperCase() || '—'}</Text>
                  <Text style={s.idLabel}>ORIGEN</Text>
                  <Text style={s.idValue}>{[state.usuario?.ciudad, state.usuario?.pais].filter(Boolean).join(' · ') || '—'}</Text>
                </View>
              </View>

              {/* QR Code */}
              <View style={s.qrSection}>
                <View style={s.qrBox}>
                  <Text style={s.qrPattern}>▓▓▓▓▓▓▓{'\n'}▓░░░░░▓{'\n'}▓░▓░░▓▓{'\n'}▓░░░░░▓{'\n'}▓▓▓▓▓▓▓</Text>
                </View>
                <View style={s.qrInfo}>
                  <Text style={s.qrIdLabel}>ID ÚNICO DE PASAPORTE</Text>
                  <Text style={s.qrId}>{(user?.uid?.slice(-8) || 'CF26-0000').toUpperCase()}</Text>
                  <Text style={s.qrInstruction}>Muestra este código al vendedor al realizar una compra para obtener tu sello</Text>
                  <View style={[s.qrDot, { backgroundColor: nivelActual?.color || T.muted }]} />
                </View>
              </View>

              {/* Points & Progress */}
              <View style={s.progressSection}>
                <View style={s.ptsRow}>
                  <View style={s.ptsBox}>
                    <Text style={s.ptsNum}>{puntos}</Text>
                    <Text style={s.ptsLabel}>PUNTOS</Text>
                  </View>
                  <View style={s.ptsDiv} />
                  <View style={s.ptsBox}>
                    <Text style={s.ptsNum}>{obtainedStamps.length}</Text>
                    <Text style={s.ptsLabel}>SELLOS</Text>
                  </View>
                  <View style={s.ptsDiv} />
                  <View style={s.ptsBox}>
                    <Text style={s.ptsNum}>{(38 - obtainedStamps.length)}</Text>
                    <Text style={s.ptsLabel}>PENDIENTES</Text>
                  </View>
                </View>
                <View style={s.progWrap}>
                  <View style={s.progBg}>
                    <View style={[s.progFill, { width: `${progPct}%` as any, backgroundColor: nivelActual?.color || T.gold }]} />
                  </View>
                  {nivelSig
                    ? <Text style={s.progLabel}>{nivelSig.minPuntos - puntos} pts más para: {nivelSig.nombre} {nivelSig.emoji}</Text>
                    : nivelActual
                    ? <Text style={[s.progLabel, { color: T.gold }]}>🏆 Nivel máximo alcanzado</Text>
                    : <Text style={s.progLabel}>Visita un stand y realiza una compra para ganar tu primer punto</Text>
                  }
                </View>
              </View>

              {/* Stamp mini-overview */}
              <View style={s.miniAlbum}>
                <Text style={s.miniAlbumTitle}>PROGRESO DEL ÁLBUM — {obtainedStamps.length} de 38 sellos</Text>
                <View style={s.miniGrid}>
                  {MUNICIPIOS.map((mun) => {
                    const got = obtainedStamps.includes(mun.id);
                    return (
                      <View
                        key={mun.id}
                        style={[
                          s.miniCell,
                          got && { backgroundColor: mun.color, borderColor: mun.color },
                        ]}
                      >
                        {got && <Text style={s.miniCellText}>{mun.emoji}</Text>}
                      </View>
                    );
                  })}
                </View>
              </View>
            </PassportPage>

            {/* Info note */}
            <View style={s.infoNote}>
              <Text style={s.infoNoteIcon}>ℹ️</Text>
              <Text style={s.infoNoteText}>Cada compra en los stands de los 38 municipios cafeteros del Tolima te otorga un sello único. Colecciónalos todos para completar el álbum.</Text>
            </View>
          </View>
        )}

        {/* ── REGION PAGES (1, 2, 3) ── */}
        {[1, 2, 3].includes(activePage) && (() => {
          const regionKey = (['Norte', 'Centro', 'Sur'] as const)[activePage - 1];
          const muns = porRegion[regionKey] ?? [];
          const obtained = muns.filter(m => obtainedStamps.includes(m.id));
          const pct = Math.round((obtained.length / muns.length) * 100);

          return (
            <PassportPage title={`REGIÓN ${regionKey.toUpperCase()} — ${obtained.length}/${muns.length} SELLOS`}>
              {/* Region progress */}
              <View style={s.regionProg}>
                <View style={s.regionProgBg}>
                  <View style={[s.regionProgFill, { width: `${pct}%` as any }]} />
                </View>
                <Text style={s.regionProgPct}>{pct}%</Text>
              </View>

              {pct === 100 && (
                <View style={s.regionComplete}>
                  <Text style={s.regionCompleteText}>🏆 ¡Región {regionKey} completada!</Text>
                </View>
              )}

              {/* Stamps grid */}
              <View style={s.stampsGrid}>
                {muns.map((mun) => {
                  const got = obtainedStamps.includes(mun.id);
                  return (
                    <View key={mun.id} style={s.stampCell}>
                      <StampShape mun={mun} size={72} obtained={got} />
                      <Text
                        style={[s.stampName, { color: got ? mun.color : T.muted }]}
                        numberOfLines={2}
                      >
                        {got ? mun.nombre : '· · ·'}
                      </Text>
                      {got && (
                        <View style={[s.stampRegionTag, { backgroundColor: mun.color + '20', borderColor: mun.color + '50' }]}>
                          <Text style={[s.stampRegionTagText, { color: mun.color }]}>✓</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Municipality details for obtained stamps */}
              {obtained.length > 0 && (
                <View style={s.detailSection}>
                  <Text style={s.detailTitle}>MUNICIPIOS VISITADOS</Text>
                  {obtained.map(mun => (
                    <View key={mun.id} style={[s.detailRow, { borderLeftColor: mun.color }]}>
                      <Text style={s.detailEmoji}>{mun.emoji}</Text>
                      <View style={s.detailInfo}>
                        <Text style={[s.detailName, { color: mun.color }]}>{mun.nombre}</Text>
                        <Text style={s.detailRegion}>Región {mun.region} · Municipio cafetero del Tolima</Text>
                      </View>
                      <View style={[s.detailSeal, { borderColor: mun.color }]}>
                        <Text style={[s.detailSealText, { color: mun.color }]}>✓</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </PassportPage>
          );
        })()}

        {/* ── PAGE 4: PREMIOS ── */}
        {activePage === 4 && (
          <PassportPage title="NIVELES Y PREMIOS">
            <View style={s.premiosIntro}>
              <Text style={s.premiosIntroText}>
                Acumula puntos comprando en los stands de la feria. Cada $1.000 COP = 1 punto.
              </Text>
            </View>
            {NIVELES.map((niv, idx) => {
              const unlocked = nivelActual ? NIVELES.indexOf(nivelActual) >= idx : false;
              const isCurrent = nivelActual?.id === niv.id;
              return (
                <View
                  key={niv.id}
                  style={[
                    s.nivelCard,
                    unlocked && { borderColor: niv.color, backgroundColor: niv.color + '08' },
                    isCurrent && s.nivelCardCurrent,
                  ]}
                >
                  {isCurrent && <View style={[s.nivelCurrentBadge, { backgroundColor: niv.color }]}><Text style={s.nivelCurrentBadgeText}>TU NIVEL ACTUAL</Text></View>}
                  <View style={s.nivelTop}>
                    <View style={[s.nivelIcon, { backgroundColor: unlocked ? niv.color : T.border }]}>
                      <Text style={s.nivelEmoji}>{unlocked ? niv.emoji : '🔒'}</Text>
                    </View>
                    <View style={s.nivelInfo}>
                      <Text style={[s.nivelName, { color: unlocked ? niv.color : T.muted }]}>{niv.nombre}</Text>
                      <Text style={s.nivelRange}>{niv.minPuntos} – {niv.maxPuntos > 9000 ? '601+' : niv.maxPuntos} puntos</Text>
                    </View>
                    {unlocked && <Text style={[s.nivelCheck, { color: niv.color }]}>✓</Text>}
                  </View>
                  <View style={s.nivelBenefs}>
                    {niv.beneficios.map((b, i) => (
                      <View key={i} style={s.nivelBenef}>
                        <Text style={[s.nivelBenefDot, { color: unlocked ? niv.color : T.muted }]}>•</Text>
                        <Text style={[s.nivelBenefText, !unlocked && { color: T.muted }]}>{b}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}

            <View style={s.pointsExplain}>
              <Text style={s.pointsExplainTitle}>💡 ¿Cómo ganar puntos?</Text>
              {[
                '🛍️ Compra en cualquier stand de los 38 municipios',
                '📸 Muestra tu QR al vendedor para que escanee tu pasaporte',
                '⭐ Por cada $1.000 COP en compras recibes 1 punto',
                '✨ Happy Hour: puntos dobles en horarios especiales',
                '🗺️ Bonus: completa una región para un sello especial',
              ].map((t, i) => (
                <View key={i} style={s.pointsRow}>
                  <Text style={s.pointsRowText}>{t}</Text>
                </View>
              ))}
            </View>
          </PassportPage>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

export default PasaporteScreen;

// ── Stamp inner styles ──
const ss = StyleSheet.create({
  stampEmpty:    { borderRadius: 10, borderWidth: 1.5, borderColor: T.border, borderStyle: 'dashed', backgroundColor: T.parchment },
  stampQ:        { color: T.muted, fontWeight: '900', opacity: 0.4 },
  stampLines:    { position: 'absolute', bottom: 6, left: 6, right: 6, gap: 3 },
  stampLine:     { height: 1, backgroundColor: T.border },
  stampObtained: { borderRadius: 10, borderWidth: 2, overflow: 'hidden', position: 'relative' },
  stampInnerRing:{ position: 'absolute', top: 6, left: 6, right: 6, bottom: 6, borderRadius: 6, borderWidth: 1 },
  stampEmoji:    { zIndex: 1 },
  stampInk:      { position: 'absolute', bottom: 5, right: 5, width: 6, height: 6, borderRadius: 3 },
});

// ── Page styles ──
const pg = StyleSheet.create({
  page:       { backgroundColor: T.parchment, borderRadius: 16, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: T.parchDark, shadowColor: T.dark, shadowOffset: { width: 2, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
  pageInner:  { padding: 20, paddingLeft: 28 },
  pageHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: T.border },
  headerLine: { flex: 1, height: 1, backgroundColor: T.gold + '60' },
  pageTitle:  { fontSize: 10, fontWeight: '900', color: T.gold, letterSpacing: 2.5, textTransform: 'uppercase' },
  pageBinding:{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 8, backgroundColor: T.leather, opacity: 0.7 },
});

// ── Main screen styles ──
const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: T.bg },
  topBar:       { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: T.parchDark },
  backBtn:      { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 4 },
  backIcon:     { fontSize: 28, color: T.leather, lineHeight: 32, fontWeight: '300' },
  backText:     { fontSize: 15, color: T.leather, fontWeight: '600' },
  topTitle:     { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '900', color: T.dark },
  stampCount:   { flexDirection: 'row', alignItems: 'baseline', gap: 1 },
  stampCountNum:{ fontSize: 20, fontWeight: '900', color: T.gold },
  stampCountOf: { fontSize: 13, color: T.muted },
  tabsScroll:   { backgroundColor: T.parchment, borderBottomWidth: 1, borderBottomColor: T.parchDark },
  tabsContent:  { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  tab:          { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: T.card, borderWidth: 1, borderColor: T.border },
  tabActive:    { backgroundColor: T.leather, borderColor: T.leather },
  tabText:      { fontSize: 12, fontWeight: '700', color: T.muted },
  tabTextActive:{ color: '#FFF' },
  scroll:       { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },

  // Cover
  coverWrap:    { position: 'relative', marginBottom: 16 },
  cover:        { borderRadius: 16, padding: 28, alignItems: 'center', minHeight: 280, justifyContent: 'center', overflow: 'hidden', shadowColor: T.dark, shadowOffset: { width: 4, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  embossHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6, width: '80%' },
  embossLine:   { flex: 1, height: 0.5, backgroundColor: 'rgba(255,255,255,0.4)' },
  embossCountry:{ fontSize: 8, fontWeight: '900', color: 'rgba(255,255,255,0.7)', letterSpacing: 2.5 },
  embossTitle:  { fontSize: 26, fontWeight: '900', color: T.goldPale, letterSpacing: 3, textAlign: 'center', marginBottom: 4 },
  embossSubtitle:{ fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textAlign: 'center', marginBottom: 2 },
  embossCity:   { fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: 3, textAlign: 'center', marginBottom: 20 },
  seal:         { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  sealEmoji:    { fontSize: 36, zIndex: 1 },
  sealRing:     { position: 'absolute', top: 6, left: 6, right: 6, bottom: 6, borderRadius: 34, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  sealRing2:    { position: 'absolute', top: 14, left: 14, right: 14, bottom: 14, borderRadius: 26, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  levelBadge:   { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center' },
  levelBadgeEmoji: { fontSize: 18 },
  levelBadgeName: { fontSize: 10, fontWeight: '900', color: T.dark, letterSpacing: 1 },
  spine:        { position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, backgroundColor: T.leatherDark, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },

  // ID Section
  idSection:    { flexDirection: 'row', gap: 14, marginBottom: 18 },
  idAvatar:     { width: 70, height: 90, borderRadius: 10, backgroundColor: T.leather, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: T.gold + '60' },
  idAvatarText: { fontSize: 32, fontWeight: '900', color: T.goldPale },
  idData:       { flex: 1 },
  idLabel:      { fontSize: 8, fontWeight: '900', color: T.gold, letterSpacing: 2, marginBottom: 2, marginTop: 6 },
  idValue:      { fontSize: 12, fontWeight: '800', color: T.ink, letterSpacing: 0.5 },

  // QR
  qrSection:    { flexDirection: 'row', gap: 14, marginBottom: 18, alignItems: 'center' },
  qrBox:        { width: 80, height: 80, backgroundColor: '#FFF', borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: T.border, padding: 6 },
  qrPattern:    { fontSize: 8.5, color: T.ink, fontWeight: '900', lineHeight: 13, letterSpacing: 0.5, fontFamily: 'monospace' },
  qrInfo:       { flex: 1 },
  qrIdLabel:    { fontSize: 7, fontWeight: '900', color: T.gold, letterSpacing: 2, marginBottom: 4 },
  qrId:         { fontSize: 18, fontWeight: '900', color: T.ink, letterSpacing: 2, marginBottom: 4 },
  qrInstruction:{ fontSize: 10, color: T.muted, lineHeight: 14 },
  qrDot:        { width: 8, height: 8, borderRadius: 4, marginTop: 6 },

  // Progress
  progressSection: { marginBottom: 18 },
  ptsRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: T.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: T.border },
  ptsBox:       { flex: 1, alignItems: 'center' },
  ptsNum:       { fontSize: 24, fontWeight: '900', color: T.gold },
  ptsLabel:     { fontSize: 8, color: T.muted, letterSpacing: 1.5, marginTop: 2 },
  ptsDiv:       { width: 1, height: 32, backgroundColor: T.border },
  progWrap:     {},
  progBg:       { height: 8, backgroundColor: T.parchDark, borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  progFill:     { height: '100%', borderRadius: 4 },
  progLabel:    { fontSize: 10, color: T.muted, textAlign: 'center' },

  // Mini album
  miniAlbum:    { marginTop: 4 },
  miniAlbumTitle: { fontSize: 8, fontWeight: '900', color: T.gold, letterSpacing: 2, marginBottom: 10 },
  miniGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  miniCell:     { width: (width - 96) / 10, height: (width - 96) / 10, borderRadius: 3, borderWidth: 1, borderColor: T.border, backgroundColor: T.card, alignItems: 'center', justifyContent: 'center' },
  miniCellText: { fontSize: 9 },

  // Info note
  infoNote:     { backgroundColor: T.goldPale, borderRadius: 12, padding: 14, flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 16, borderWidth: 1, borderColor: T.gold + '40' },
  infoNoteIcon: { fontSize: 18 },
  infoNoteText: { flex: 1, fontSize: 12, color: T.body, lineHeight: 18 },

  // Stamps grid
  stampsGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', marginBottom: 20 },
  stampCell:    { width: (width - 80) / 4 - 2, alignItems: 'center' },
  stampName:    { fontSize: 9, fontWeight: '700', textAlign: 'center', marginTop: 4, lineHeight: 12 },
  stampRegionTag:{ marginTop: 2, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1, borderWidth: 1 },
  stampRegionTagText: { fontSize: 8, fontWeight: '900' },

  // Region progress
  regionProg:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  regionProgBg: { flex: 1, height: 8, backgroundColor: T.parchDark, borderRadius: 4, overflow: 'hidden' },
  regionProgFill: { height: '100%', backgroundColor: T.gold, borderRadius: 4 },
  regionProgPct:  { fontSize: 14, fontWeight: '900', color: T.gold, width: 36, textAlign: 'right' },
  regionComplete: { backgroundColor: T.goldPale, borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: T.gold + '60' },
  regionCompleteText: { fontSize: 13, fontWeight: '900', color: T.gold },

  // Detail section
  detailSection: { marginTop: 8 },
  detailTitle:   { fontSize: 9, fontWeight: '900', color: T.muted, letterSpacing: 2, marginBottom: 10 },
  detailRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: T.card, borderRadius: 12, marginBottom: 8, borderLeftWidth: 4, borderWidth: 1, borderColor: T.border },
  detailEmoji:   { fontSize: 22 },
  detailInfo:    { flex: 1 },
  detailName:    { fontSize: 14, fontWeight: '800' },
  detailRegion:  { fontSize: 10, color: T.muted, marginTop: 2 },
  detailSeal:    { width: 32, height: 32, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  detailSealText:{ fontSize: 14, fontWeight: '900' },

  // Premios
  premiosIntro:  { backgroundColor: T.goldPale, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: T.gold + '50' },
  premiosIntroText: { fontSize: 12, color: T.body, lineHeight: 18 },
  nivelCard:     { borderRadius: 16, borderWidth: 1.5, borderColor: T.border, padding: 16, marginBottom: 12, backgroundColor: T.card },
  nivelCardCurrent: { shadowColor: T.gold, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  nivelCurrentBadge: { position: 'absolute', top: -1, right: 12, borderRadius: 0, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  nivelCurrentBadgeText: { fontSize: 8, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  nivelTop:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  nivelIcon:     { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  nivelEmoji:    { fontSize: 22 },
  nivelInfo:     { flex: 1 },
  nivelName:     { fontSize: 16, fontWeight: '900' },
  nivelRange:    { fontSize: 11, color: T.muted, marginTop: 2 },
  nivelCheck:    { fontSize: 22, fontWeight: '900' },
  nivelBenefs:   { gap: 6, paddingLeft: 4 },
  nivelBenef:    { flexDirection: 'row', gap: 6 },
  nivelBenefDot: { fontSize: 12, lineHeight: 18 },
  nivelBenefText:{ fontSize: 12, color: T.body, lineHeight: 18 },
  pointsExplain: { backgroundColor: T.card, borderRadius: 16, padding: 16, marginTop: 8, borderWidth: 1, borderColor: T.border },
  pointsExplainTitle: { fontSize: 13, fontWeight: '900', color: T.dark, marginBottom: 12 },
  pointsRow:     { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: T.border },
  pointsRowText: { fontSize: 12, color: T.body, lineHeight: 18 },
});
