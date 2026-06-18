import React, { useState, useCallback, useRef, useEffect } from 'react';
import { SafeAreaView, StatusBar, Animated, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../context/AppContext';
import { mockDbService } from '../../services/mockDb.service';
import { getNivelActual, getNivelSiguiente } from '../../data/mockData';
import type { VisitanteNavProp } from '../../navigation/types';
import CopyrightFooter from '../../components/CopyrightFooter';
import {
  T, CoffeePlantBg, FeriaHeroBanner, FeriaHappyHour, FeriaStatsStrip,
  FeriaLevelCard, FeriaQRCard, FeriaPassportCard, FeriaPrizeRow,
  FeriaTopStands, FeriaTileGrid, FeriaTurismo, FeriaFeriasAnteriores,
  FeriaNiveles, FeriaLogoutBtn,
} from '../../components/FeriaHomeSections';

const TILES = [
  { label: 'MAPA',      img: require('../../../assets/tile-jungle.jpg'),      screen: 'MapaFeria' },
  { label: 'AGENDA',    img: require('../../../assets/tile-toucan.jpg'),       screen: 'Agenda' },
  { label: 'ALIADOS',   img: require('../../../assets/tile-barranquero.jpg'), screen: 'Auspiciadores' },
  { label: 'RANKING',   img: require('../../../assets/tile-ocelot.jpg'),      screen: 'Ranking' },
];

const PROGRAM_TILES = [
  { label: 'EXPOSITORES',     img: require('../../../assets/tile-tapir.jpg'),   screen: 'Expositores' },
  { label: 'CATACIÓN',        img: require('../../../assets/tile-redbird.jpg'), screen: 'Catacion' },
  { label: 'PREMIACIONES',    img: require('../../../assets/tile-bear.jpg'),    screen: 'Premiaciones' },
  { label: 'AGENDA ACADÉMICA',img: require('../../../assets/tile-deer.jpg'),    screen: 'AgendaAcademica' },
];

export const HomeScreen = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { state } = useApp();
  const nav = useNavigation<VisitanteNavProp>();
  const [globalStats, setGlobalStats] = useState({ visitorCount: 1420, activeStands: 45, happyHour: false });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulsAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulsAnim, { toValue: 1.015, duration: 2800, useNativeDriver: true }),
      Animated.timing(pulsAnim, { toValue: 1.0,   duration: 2800, useNativeDriver: true }),
    ])).start();
  }, []);

  useFocusEffect(useCallback(() => {
    let alive = true;
    mockDbService.getHomeStats().then(d => { if (alive) setGlobalStats(d); });
    return () => { alive = false; };
  }, []));

  const puntos      = state.usuario?.puntos    ?? 0;
  const stamps      = state.usuario?.sellos    ?? [];
  const stampsCount = stamps.length;
  const nivelActual = getNivelActual(puntos);
  const nivelSig    = getNivelSiguiente(puntos);
  const progressPct = nivelActual && nivelSig
    ? Math.min(((puntos - nivelActual.minPuntos) / (nivelSig.minPuntos - nivelActual.minPuntos)) * 100, 100)
    : nivelActual ? 100 : 0;

  const displayName = state.usuario?.nombre?.split(' ')[0] || user?.name?.split(' ')[0] || 'Cafetero';
  const passportId  = `CF26-${(state.usuario?.cedula || user?.uid?.slice(-8) || '00000000').toUpperCase()}`;
  const topStands   = [...(state.stands ?? [])].sort((a: any, b: any) => (b.ventas ?? 0) - (a.ventas ?? 0));

  const visitorCount     = (state.stands ?? []).reduce((s: number, st: any) => s + (st.ventas ?? 0), 0);
  const activeStandsCount = (state.stands ?? []).filter((s: any) => s.activo !== false).length;

  const STAT_ITEMS = [
    { icon: '👥', val: visitorCount,       lbl: t('home.visitors_label', 'VISITANTES') },
    { icon: '🏪', val: activeStandsCount,  lbl: t('home.stands_label',   'STANDS ACTIVOS') },
    { icon: '🪙', val: puntos,             lbl: t('home.pts_label',       'PUNTOS') },
    { icon: '✅', val: stampsCount,        lbl: t('home.stamps_label',    'SELLOS') },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg, ...(Platform.OS === 'web' ? { overflow: 'hidden' } as any : {}) }}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <CoffeePlantBg />
      <Animated.ScrollView style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 18, paddingTop: 14, paddingBottom: 44 }}>

        <FeriaHeroBanner
          displayName={displayName}
          passportId={passportId}
          fotoPerfil={state.usuario?.fotoPerfil}
          onProfilePress={() => nav.navigate('Perfil' as any)}
          onLogout={logout}
        />

        <FeriaHappyHour visible={globalStats.happyHour} />
        <FeriaStatsStrip items={STAT_ITEMS} />
        <FeriaLevelCard puntos={puntos} nivelActual={nivelActual} nivelSig={nivelSig} progressPct={progressPct} pulsAnim={pulsAnim} />
        <FeriaQRCard passportId={passportId} displayName={displayName} />
        <FeriaPassportCard stampsCount={stampsCount} onPress={() => nav.navigate('Pasaporte')} />
        <FeriaPrizeRow nivelActual={nivelActual} nivelSig={nivelSig} />
        <FeriaTopStands stands={topStands} />

        <FeriaTileGrid tiles={TILES} onNavigate={(s) => nav.navigate(s as any)} />
        <FeriaTurismo />
        <FeriaTileGrid tiles={PROGRAM_TILES} onNavigate={(s) => nav.navigate(s as any)} />
        <FeriaFeriasAnteriores onNavigate={(s, p) => nav.navigate(s as any, p)} />
        <FeriaNiveles nivelActual={nivelActual} />
        <FeriaLogoutBtn onLogout={logout} />
        <CopyrightFooter />

      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
