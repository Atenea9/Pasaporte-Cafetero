import CopyrightFooter from '../../components/CopyrightFooter';
import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, LayoutAnimation, Platform, UIManager,
  Dimensions, SafeAreaView, StatusBar, Image,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';
import {
  MUNICIPIOS, NIVELES, getNivelActual, getNivelSiguiente, getMunicipiosPorRegion
} from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import type { VisitanteNavProp } from '../../navigation/types';
import { useTranslation } from 'react-i18next';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

const SUBREGIONES: Record<string, { nombre: string; municipioIds: string[] }[]> = {
  Norte: [
    {
      nombre: '⛰️ Norte',
      municipioIds: ['armero', 'falan', 'fresno', 'herveo', 'mariquita', 'palocabildo'],
    },
    {
      nombre: '🌋 Nevados',
      municipioIds: ['casabianca', 'lerida', 'libano', 'murillo', 'santa_isabel', 'villahermosa'],
    },
  ],
  Centro: [
    {
      nombre: '🏙️ Centro (Ibagué)',
      municipioIds: ['alvarado', 'anzoategui', 'ibague', 'venadillo'],
    },
  ],
  Sur: [
    {
      nombre: '🌄 Sur',
      municipioIds: ['ataco', 'coyaima', 'natagaima', 'planadas', 'rioblanco', 'roncesvalles', 'san_antonio', 'cajamarca', 'rovira', 'san_luis', 'valle_san_juan'],
    },
    {
      nombre: '🌿 Suroriente',
      municipioIds: ['alpujarra', 'cunday', 'dolores', 'icononzo', 'melgar', 'prado', 'purificacion', 'suarez', 'villarrica'],
    },
  ],
};

const TOTAL_SELLOS = Object.values(SUBREGIONES).flat().reduce((acc, s) => acc + s.municipioIds.length, 0);

function StampShape({ mun, size = 66, obtained }: { mun: typeof MUNICIPIOS[0]; size?: number; obtained: boolean }) {
  const baseStyle = {
    width: size, height: size, alignItems: 'center' as const, justifyContent: 'center' as const, padding: 4,
  };
  if (!obtained) {
    return (
      <View style={[baseStyle, ss.stampEmpty]}>
        <Text style={[ss.stampQ, { fontSize: size * 0.32 }]}>?</Text>
        <View style={ss.stampLines}><View style={ss.stampLine} /><View style={ss.stampLine} /></View>
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

function SubregionAccordion({
  subregion, municipios, obtainedStamps,
}: {
  subregion: { nombre: string; municipioIds: string[] };
  municipios: typeof MUNICIPIOS;
  obtainedStamps: string[];
}) {
  const [open, setOpen] = useState(true);
  const muns = subregion.municipioIds
    .map(id => municipios.find(m => m.id === id))
    .filter(Boolean) as typeof MUNICIPIOS;
  const obtained = muns.filter(m => obtainedStamps.includes(m.id));

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(v => !v);
  };

  return (
    <View style={acc.container}>
      <TouchableOpacity style={acc.header} onPress={toggle} activeOpacity={0.75}>
        <View style={acc.headerLeft}>
          <Text style={acc.nombre}>{subregion.nombre}</Text>
          <View style={[acc.badge, { backgroundColor: obtained.length === muns.length ? T.gold + '20' : T.parchDark }]}>
            <Text style={[acc.badgeText, { color: obtained.length === muns.length ? T.gold : T.muted }]}>
              {obtained.length}/{muns.length}
            </Text>
          </View>
        </View>
        <Text style={[acc.chevron, open && acc.chevronOpen]}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {open && (
        <View style={acc.body}>
          <View style={acc.grid}>
            {muns.map(mun => {
              const got = obtainedStamps.includes(mun.id);
              return (
                <View key={mun.id} style={acc.stampCell}>
                  <StampShape mun={mun} size={60} obtained={got} />
                  <Text style={[acc.stampName, { color: got ? mun.color : T.muted }]} numberOfLines={2}>
                    {got ? mun.nombre : '· · ·'}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

export const PasaporteScreen = () => {
  const nav = useNavigation<VisitanteNavProp>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { state, dispatch } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const photoInputRef = useRef<any>(null);

  const handleChangePhoto = () => {
    if (Platform.OS === 'web' && photoInputRef.current) {
      photoInputRef.current.click();
    }
  };

  const handlePhotoFile = (e: any) => {
    const file: File = e.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) dispatch({ type: 'UPDATE_FOTO', payload: dataUrl });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

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

  const formatearFecha = (fecha?: string): string => {
    if (!fecha) return 'No registrada';
    const partes = fecha.split('-');
    if (partes.length !== 3) return fecha;
    const [año, mes, día] = partes;
    return `${día}/${mes}/${año}`;
  };

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

      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Text style={s.backIcon}>‹</Text>
          <Text style={s.backText}>Inicio</Text>
        </TouchableOpacity>
        <Text style={s.topTitle}>Pasaporte Cafetero</Text>
        <View style={s.stampCount}>
          <Text style={s.stampCountNum}>{obtainedStamps.length}</Text>
          <Text style={s.stampCountOf}>/{TOTAL_SELLOS}</Text>
        </View>
      </View>

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

        {activePage === 0 && (
          <View>
            <View style={s.coverWrap}>
              <LinearGradient colors={['#0D0600', '#2A1006', '#4A1E0A', '#6B3218']} style={s.cover}>
                {/* Header emboss */}
                <View style={s.embossHeader}>
                  <View style={s.embossLine} />
                  <View style={s.embossCountryRow}>
                    <Image
                      source={require('../../../assets/colombia-escudo.png')}
                      style={s.escudoImg}
                      resizeMode="contain"
                      tintColor="rgba(255,255,255,0.8)"
                    />
                    <Text style={s.embossCountry}>REPÚBLICA DE COLOMBIA</Text>
                  </View>
                  <View style={s.embossLine} />
                </View>
                <Text style={s.embossTitle}>PASAPORTE CAFETERO</Text>

                {/* Central gold emblem with logo */}
                <View style={s.seal}>
                  <View style={s.sealRing2} />
                  <View style={s.sealRing} />
                  <View style={s.sealInner}>
                    <Image
                      source={require('../../../assets/logo-feria-icon.png')}
                      style={s.sealLogo}
                      resizeMode="contain"
                    />
                  </View>
                </View>

                {/* Gold plaque */}
                <View style={s.goldPlaque}>
                  <Text style={s.goldPlaqueMain}>Feria Internacional{'\n'}de Café</Text>
                  <View style={s.goldPlaqueDivider} />
                  <Text style={s.goldPlaqueCity}>TOLIMA CORAZÓN</Text>
                  <Text style={s.goldPlaqueSub}>CAFETERO DE COLOMBIA</Text>
                  <Text style={s.goldPlaqueYear}>Chaparral · 2026</Text>
                </View>

                {/* Level badge */}
                {nivelActual && (
                  <View style={[s.levelBadge, { backgroundColor: nivelActual.color }]}>
                    <Text style={s.levelBadgeEmoji}>{nivelActual.emoji}</Text>
                    <Text style={s.levelBadgeName}>{nivelActual.nombre}</Text>
                  </View>
                )}
              </LinearGradient>
              <View style={s.spine} />
            </View>

            <PassportPage title="IDENTIFICACIÓN DEL PORTADOR">
              {/* Hidden file input for web photo change */}
              {Platform.OS === 'web' && (
                /* @ts-ignore */
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhotoFile}
                />
              )}
              {/* ── Photo + data row ── */}
              <View style={s.idSection}>
                <View style={s.idPhotoCol}>
                  <TouchableOpacity style={s.idAvatar} onPress={handleChangePhoto} activeOpacity={0.85}>
                    {state.usuario?.fotoPerfil ? (
                      <Image source={{ uri: state.usuario.fotoPerfil }} style={s.idAvatarImg} />
                    ) : (
                      <LinearGradient colors={[T.leatherDark, T.leather]} style={s.idAvatarGrad}>
                        <Text style={s.idAvatarText}>{nombre.charAt(0).toUpperCase()}</Text>
                      </LinearGradient>
                    )}
                    {/* Gold initial overlay */}
                    <View style={s.idInitialBadge}>
                      <Text style={s.idInitialText}>{nombre.charAt(0).toUpperCase()}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleChangePhoto} style={s.changePhotoBtn} activeOpacity={0.7}>
                    <Text style={s.changePhotoBtnText}>✏️ Cambiar foto</Text>
                  </TouchableOpacity>
                </View>
                <View style={s.idData}>
                  <Text style={s.idLabel}>DOCUMENTO</Text>
                  <Text style={s.idValue}>{state.usuario?.cedula || user?.uid?.slice(-8).toUpperCase() || '—'}</Text>
                  <Text style={s.idLabel}>FECHA DE NACIMIENTO</Text>
                  <Text style={s.idValue}>{formatearFecha(state.usuario?.fechaNacimiento)}</Text>
                  <Text style={s.idLabel}>ORIGEN</Text>
                  <Text style={s.idValue}>{[state.usuario?.ciudad, state.usuario?.pais].filter(Boolean).join(' · ') || '—'}</Text>
                  <Text style={s.idLabel}>NOMBRE COMPLETO</Text>
                  <Text style={s.idValue}>{nombre.toUpperCase()}</Text>
                </View>
              </View>

              {/* ── QR + passport ID ── */}
              <View style={s.qrSection}>
                <View style={s.qrBox}>
                  <QRCode
                    value={`CF26-${(state.usuario?.cedula || user?.uid?.slice(-8) || '00000000').toUpperCase()}`}
                    size={82}
                    color={T.ink}
                    backgroundColor="transparent"
                  />
                </View>
                <View style={s.qrInfo}>
                  <Text style={s.qrIdLabel}>ID ÚNICO DE PASAPORTE</Text>
                  <Text style={s.qrId}>{(user?.uid?.slice(-8) || 'CF26-0000').toUpperCase()}</Text>
                  <Text style={s.qrInstruction}>Muestra este código al vendedor al realizar una compra para obtener tu sello</Text>
                  <View style={[s.qrDot, { backgroundColor: nivelActual?.color || T.muted }]} />
                </View>
              </View>

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
                    <Text style={s.ptsNum}>{TOTAL_SELLOS - obtainedStamps.length}</Text>
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

              <View style={s.miniAlbum}>
                <Text style={s.miniAlbumTitle}>PROGRESO DEL ÁLBUM — {obtainedStamps.length} de {TOTAL_SELLOS} sellos</Text>
                <View style={s.miniGrid}>
                  {MUNICIPIOS.map((mun) => {
                    const got = obtainedStamps.includes(mun.id);
                    return (
                      <View key={mun.id} style={[s.miniCell, got && { backgroundColor: mun.color, borderColor: mun.color }]}>
                        {got && <Text style={s.miniCellText}>{mun.emoji}</Text>}
                      </View>
                    );
                  })}
                </View>
              </View>
            </PassportPage>

            <View style={s.infoNote}>
              <Text style={s.infoNoteIcon}>ℹ️</Text>
              <Text style={s.infoNoteText}>Cada compra en los stands de los {TOTAL_SELLOS} municipios cafeteros del Tolima te otorga un sello único. Colecciónalos todos para completar el álbum.</Text>
            </View>
          </View>
        )}

        {[1, 2, 3].includes(activePage) && (() => {
          const regionKey = (['Norte', 'Centro', 'Sur'] as const)[activePage - 1];
          const muns = porRegion[regionKey] ?? [];
          const obtained = muns.filter(m => obtainedStamps.includes(m.id));
          const pct = Math.round((obtained.length / muns.length) * 100);
          const subregiones = SUBREGIONES[regionKey] ?? [];

          return (
            <PassportPage title={`REGIÓN ${regionKey.toUpperCase()} — ${obtained.length}/${muns.length} SELLOS`}>
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

              <Text style={s.subregionHint}>Toca cada subregión para expandir o colapsar sus municipios</Text>

              {subregiones.map((sub, i) => (
                <SubregionAccordion
                  key={i}
                  subregion={sub}
                  municipios={MUNICIPIOS}
                  obtainedStamps={obtainedStamps}
                />
              ))}

              {obtained.length > 0 && (
                <View style={s.detailSection}>
                  <Text style={s.detailTitle}>MUNICIPIOS VISITADOS EN {regionKey.toUpperCase()}</Text>
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
                <View key={niv.id} style={[s.nivelCard, unlocked && { borderColor: niv.color, backgroundColor: niv.color + '08' }, isCurrent && s.nivelCardCurrent]}>
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
                `🛍️ Compra en cualquier stand de los ${TOTAL_SELLOS} municipios`,
                '📸 Muestra tu QR al vendedor para que escanee tu pasaporte',
                '⭐ Por cada $1.000 COP en compras recibes 1 punto',
                '✨ Happy Hour: puntos dobles en horarios especiales',
                '🗺️ Bonus: completa una subregión para un sello especial',
              ].map((t, i) => (
                <View key={i} style={s.pointsRow}>
                  <Text style={s.pointsRowText}>{t}</Text>
                </View>
              ))}
            </View>
          </PassportPage>
        )}

        <CopyrightFooter />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PasaporteScreen;

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

const acc = StyleSheet.create({
  container:  { marginBottom: 12, borderRadius: 14, borderWidth: 1, borderColor: T.border, overflow: 'hidden', backgroundColor: T.card },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: T.parchment },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  nombre:     { fontSize: 13, fontWeight: '900', color: T.dark, flex: 1 },
  badge:      { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:  { fontSize: 11, fontWeight: '800' },
  chevron:    { fontSize: 11, color: T.muted, fontWeight: '700' },
  chevronOpen:{ color: T.gold },
  body:       { padding: 12, paddingTop: 10 },
  grid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stampCell:  { alignItems: 'center', width: (width - 100) / 4 },
  stampName:  { fontSize: 9, fontWeight: '700', textAlign: 'center', marginTop: 4, letterSpacing: 0.3 },
});

const pg = StyleSheet.create({
  page:       { backgroundColor: T.parchment, borderRadius: 16, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: T.parchDark, shadowColor: T.dark, shadowOffset: { width: 2, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
  pageInner:  { padding: 20, paddingLeft: 28 },
  pageHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: T.border },
  headerLine: { flex: 1, height: 1, backgroundColor: T.gold + '60' },
  pageTitle:  { fontSize: 10, fontWeight: '900', color: T.gold, letterSpacing: 2.5, textTransform: 'uppercase' },
  pageBinding:{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 8, backgroundColor: T.leather, opacity: 0.7 },
});

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
  tabsScroll:   { backgroundColor: T.parchment, borderBottomWidth: 1, borderBottomColor: T.parchDark, minHeight: 52, flexShrink: 0 },
  tabsContent:  { paddingHorizontal: 12, paddingVertical: 8, gap: 6, alignItems: 'center' },
  tab:          { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: T.card, borderWidth: 1, borderColor: T.border },
  tabActive:    { backgroundColor: T.leather, borderColor: T.leather },
  tabText:      { fontSize: 12, fontWeight: '700', color: T.muted },
  tabTextActive:{ color: '#FFF' },
  scroll:       { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  coverWrap:    { position: 'relative', marginBottom: 16 },
  cover:        { borderRadius: 16, padding: 28, alignItems: 'center', minHeight: 280, justifyContent: 'center', overflow: 'hidden', shadowColor: T.dark, shadowOffset: { width: 4, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  embossHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6, width: '80%' },
  embossLine:   { flex: 1, height: 0.5, backgroundColor: 'rgba(255,255,255,0.4)' },
  embossCountryRow:{ flexDirection: 'row', alignItems: 'center', gap: 6 },
  escudoImg:    { width: 18, height: 18 },
  embossCountry:{ fontSize: 8, fontWeight: '900', color: 'rgba(255,255,255,0.7)', letterSpacing: 2.5 },
  embossTitle:  { fontSize: 26, fontWeight: '900', color: T.goldPale, letterSpacing: 3, textAlign: 'center', marginBottom: 4 },
  embossSubtitle:{ fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textAlign: 'center', marginBottom: 2 },
  embossCity:   { fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: 3, textAlign: 'center', marginBottom: 20 },
  seal:         { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,215,100,0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  sealEmoji:    { fontSize: 36, zIndex: 1 },
  sealRing:     { position: 'absolute', top: 4, left: 4, right: 4, bottom: 4, borderRadius: 46, borderWidth: 1.5, borderColor: 'rgba(212,165,32,0.5)' },
  sealRing2:    { position: 'absolute', top: 12, left: 12, right: 12, bottom: 12, borderRadius: 38, borderWidth: 1, borderColor: 'rgba(212,165,32,0.25)' },
  sealInner:    { width: 60, height: 60, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  sealLogo:     { width: 52, height: 52, tintColor: T.goldPale },
  goldPlaque:   { backgroundColor: 'rgba(212,165,32,0.12)', borderWidth: 1, borderColor: 'rgba(212,165,32,0.4)', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center', marginBottom: 16 },
  goldPlaqueMain:{ fontSize: 14, fontWeight: '900', color: T.goldPale, textAlign: 'center', letterSpacing: 0.5, lineHeight: 20 },
  goldPlaqueDivider:{ width: 40, height: 1, backgroundColor: 'rgba(212,165,32,0.5)', marginVertical: 6 },
  goldPlaqueCity:{ fontSize: 9, fontWeight: '900', color: T.goldPale, letterSpacing: 2.5, textAlign: 'center' },
  goldPlaqueSub: { fontSize: 8, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textAlign: 'center', marginTop: 2 },
  goldPlaqueYear:{ fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5, marginTop: 6 },
  levelBadge:   { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center' },
  levelBadgeEmoji: { fontSize: 18 },
  levelBadgeName: { fontSize: 10, fontWeight: '900', color: T.dark, letterSpacing: 1 },
  spine:        { position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, backgroundColor: T.leatherDark, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
  idSection:    { flexDirection: 'row', gap: 14, marginBottom: 18 },
  idPhotoCol:   { alignItems: 'center', gap: 8 },
  idAvatar:          { width: 100, height: 130, borderRadius: 10, backgroundColor: T.leather, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: T.gold + '80', overflow: 'hidden', position: 'relative' },
  idAvatarGrad:      { width: 100, height: 130, alignItems: 'center', justifyContent: 'center' },
  idAvatarImg:       { width: 100, height: 130 },
  idAvatarText:      { fontSize: 42, fontWeight: '900', color: T.goldPale },
  idAvatarEditBadge: { position: 'absolute', bottom: 4, right: 4, backgroundColor: T.gold, borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  idInitialBadge:    { position: 'absolute', top: 6, left: 6, width: 24, height: 24, borderRadius: 4, backgroundColor: T.gold, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  idInitialText:     { fontSize: 13, fontWeight: '900', color: '#FFF' },
  changePhotoBtn:    { backgroundColor: T.parchment, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: T.border },
  changePhotoBtnText:{ fontSize: 9, color: T.body, fontWeight: '700' },
  idData:       { flex: 1 },
  idLabel:      { fontSize: 8, fontWeight: '900', color: T.gold, letterSpacing: 2, marginBottom: 2, marginTop: 6 },
  idValue:      { fontSize: 12, fontWeight: '800', color: T.ink, letterSpacing: 0.5 },
  qrSection:    { flexDirection: 'row', gap: 14, marginBottom: 18, alignItems: 'center' },
  qrBox:        { width: 96, height: 96, backgroundColor: '#FFF', borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: T.border, padding: 6 },
  qrPattern:    { fontSize: 8.5, color: T.ink, fontWeight: '900', lineHeight: 13, letterSpacing: 0.5, fontFamily: 'monospace' },
  qrInfo:       { flex: 1 },
  qrIdLabel:    { fontSize: 7, fontWeight: '900', color: T.gold, letterSpacing: 2, marginBottom: 4 },
  qrId:         { fontSize: 18, fontWeight: '900', color: T.ink, letterSpacing: 2, marginBottom: 4 },
  qrInstruction:{ fontSize: 10, color: T.muted, lineHeight: 14 },
  qrDot:        { width: 8, height: 8, borderRadius: 4, marginTop: 8 },
  progressSection: { marginBottom: 18 },
  ptsRow:       { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 14 },
  ptsBox:       { alignItems: 'center' },
  ptsNum:       { fontSize: 28, fontWeight: '900', color: T.gold },
  ptsLabel:     { fontSize: 8, fontWeight: '900', color: T.muted, letterSpacing: 2, marginTop: 2 },
  ptsDiv:       { width: 1, backgroundColor: T.border, alignSelf: 'stretch' },
  progWrap:     { gap: 6 },
  progBg:       { height: 8, backgroundColor: T.parchDark, borderRadius: 4, overflow: 'hidden' },
  progFill:     { height: '100%', borderRadius: 4 },
  progLabel:    { fontSize: 11, color: T.muted, textAlign: 'center' },
  miniAlbum:    { marginTop: 4 },
  miniAlbumTitle:{ fontSize: 9, fontWeight: '900', color: T.gold, letterSpacing: 2, marginBottom: 10 },
  miniGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  miniCell:     { width: 18, height: 18, borderRadius: 4, backgroundColor: T.parchDark, borderWidth: 1, borderColor: T.border, alignItems: 'center', justifyContent: 'center' },
  miniCellText: { fontSize: 9 },
  infoNote:     { flexDirection: 'row', gap: 8, backgroundColor: T.parchment, borderRadius: 12, padding: 14, marginTop: 4, borderWidth: 1, borderColor: T.border },
  infoNoteIcon: { fontSize: 16 },
  infoNoteText: { flex: 1, fontSize: 11, color: T.body, lineHeight: 16 },
  regionProg:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  regionProgBg: { flex: 1, height: 8, backgroundColor: T.parchDark, borderRadius: 4, overflow: 'hidden' },
  regionProgFill:{ height: '100%', backgroundColor: T.gold, borderRadius: 4 },
  regionProgPct:{ fontSize: 13, fontWeight: '900', color: T.gold, width: 38, textAlign: 'right' },
  regionComplete:{ backgroundColor: T.goldPale, borderRadius: 10, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: T.gold + '50', alignItems: 'center' },
  regionCompleteText: { fontSize: 13, fontWeight: '900', color: T.gold },
  subregionHint:{ fontSize: 10, color: T.muted, textAlign: 'center', marginBottom: 12, fontStyle: 'italic' },
  detailSection:{ marginTop: 12 },
  detailTitle:  { fontSize: 9, fontWeight: '900', color: T.gold, letterSpacing: 2, marginBottom: 8 },
  detailRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8, borderLeftWidth: 3, paddingLeft: 10, paddingVertical: 6 },
  detailEmoji:  { fontSize: 20 },
  detailInfo:   { flex: 1 },
  detailName:   { fontSize: 13, fontWeight: '800' },
  detailRegion: { fontSize: 10, color: T.muted, marginTop: 1 },
  detailSeal:   { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  detailSealText:{ fontSize: 13, fontWeight: '900' },
  premiosIntro: { backgroundColor: T.goldPale, borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: T.gold + '40' },
  premiosIntroText: { fontSize: 12, color: T.body, lineHeight: 18, textAlign: 'center' },
  nivelCard:    { borderRadius: 14, borderWidth: 1, borderColor: T.border, padding: 14, marginBottom: 12, backgroundColor: T.card },
  nivelCardCurrent: { shadowColor: T.gold, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  nivelCurrentBadge: { position: 'absolute', top: -1, right: 12, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  nivelCurrentBadgeText: { fontSize: 8, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  nivelTop:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  nivelIcon:    { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  nivelEmoji:   { fontSize: 22 },
  nivelInfo:    { flex: 1 },
  nivelName:    { fontSize: 15, fontWeight: '900' },
  nivelRange:   { fontSize: 11, color: T.muted, marginTop: 2 },
  nivelCheck:   { fontSize: 20, fontWeight: '900' },
  nivelBenefs:  { gap: 4 },
  nivelBenef:   { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  nivelBenefDot:{ fontSize: 13, fontWeight: '900', lineHeight: 18 },
  nivelBenefText:{ fontSize: 12, color: T.body, flex: 1, lineHeight: 18 },
  pointsExplain:{ backgroundColor: T.parchment, borderRadius: 14, padding: 14, marginTop: 8, borderWidth: 1, borderColor: T.border },
  pointsExplainTitle: { fontSize: 13, fontWeight: '900', color: T.gold, marginBottom: 10 },
  pointsRow:    { paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: T.border },
  pointsRowText:{ fontSize: 12, color: T.body, lineHeight: 18 },
});
