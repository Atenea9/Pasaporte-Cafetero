import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { useNav } from '../context/NavContext';
import { NIVELES, PREMIOS, getNivelActual } from '../data/mockData';

const C = {
  bg:        '#1A0F00',
  card:      '#2C1A00',
  card2:     '#3D2400',
  gold:      '#C8860A',
  goldLight: '#E8A830',
  green:     '#2E5016',
  text:      '#F5EDD8',
  muted:     '#A89070',
  border:    '#C8860A30',
  podio1:    '#C8860A',
  podio2:    '#909098',
  podio3:    '#8B5A2B',
};

const { width: SW } = Dimensions.get('window');

const RANKING_MOCK = [
  { cedula: '1001', nombre: 'María Fernanda Ríos',  municipio: 'Planadas',     puntos: 980, sellos: 24, nivel: 'Embajador Cafetero' },
  { cedula: '1002', nombre: 'Jorge Hernández',       municipio: 'Ibagué',       puntos: 870, sellos: 20, nivel: 'Embajador Cafetero' },
  { cedula: '1003', nombre: 'Lucía Castaño',         municipio: 'Fresno',       puntos: 760, sellos: 18, nivel: 'Embajador Cafetero' },
  { cedula: '1004', nombre: 'Andrés Felipe Mora',    municipio: 'Líbano',       puntos: 640, sellos: 15, nivel: 'Embajador Cafetero' },
  { cedula: '1005', nombre: 'Catalina Vargas',       municipio: 'Chaparral',    puntos: 580, sellos: 14, nivel: 'Embajador Cafetero' },
  { cedula: '1006', nombre: 'Diego Salcedo',         municipio: 'Ataco',        puntos: 490, sellos: 12, nivel: 'Conocedor' },
  { cedula: '1007', nombre: 'Valentina Ospina',      municipio: 'Alpujarra',    puntos: 420, sellos: 10, nivel: 'Conocedor' },
  { cedula: '1008', nombre: 'Sebastián Trujillo',    municipio: 'Murillo',      puntos: 370, sellos: 9,  nivel: 'Conocedor' },
  { cedula: '1009', nombre: 'Paola Jiménez',         municipio: 'Cajamarca',    puntos: 310, sellos: 8,  nivel: 'Conocedor' },
  { cedula: '1010', nombre: 'Ricardo Peña',          municipio: 'Roncesvalles', puntos: 280, sellos: 7,  nivel: 'Conocedor' },
  { cedula: '1011', nombre: 'Natalia Gómez',         municipio: 'Rovira',       puntos: 230, sellos: 6,  nivel: 'Degustador' },
  { cedula: '1012', nombre: 'Camilo Ríos',           municipio: 'Herveo',       puntos: 190, sellos: 5,  nivel: 'Degustador' },
  { cedula: '1013', nombre: 'Sara Londoño',          municipio: 'Villahermosa', puntos: 150, sellos: 4,  nivel: 'Degustador' },
  { cedula: '1014', nombre: 'Miguel Ángel Torres',   municipio: 'Herrera',      puntos: 120, sellos: 3,  nivel: 'Degustador' },
  { cedula: '1015', nombre: 'Isabella Cruz',         municipio: 'Ortega',       puntos: 90,  sellos: 2,  nivel: 'Visitante' },
];

const IconoTrofeo = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"
      fill={color}
    />
  </Svg>
);

const IconoMedalla = ({ pos }: { pos: number }) => {
  const color = pos === 1 ? C.podio1 : pos === 2 ? C.podio2 : C.podio3;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" fill={color + '33'} />
      <Circle cx="12" cy="12" r="8"  fill={color + '55'} />
      <Circle cx="12" cy="12" r="6"  fill={color} />
      <Path d="M12 7l1.39 2.82L16.5 10.27l-2.25 2.19.53 3.09L12 14.02l-2.78 1.53.53-3.09-2.25-2.19 3.11-.45z" fill="white" opacity="0.9" />
    </Svg>
  );
};

const Podio: React.FC<{ top3: typeof RANKING_MOCK }> = ({ top3 }) => {
  const scaleAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    Animated.stagger(120, scaleAnims.map(a =>
      Animated.spring(a, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true })
    )).start();
  }, []);

  const alturas = [110, 80, 60];
  const orden   = [1, 0, 2];

  return (
    <View style={styles.podioWrap}>
      {orden.map((dataIdx, visualIdx) => {
        const p   = top3[dataIdx];
        if (!p) return null;
        const pos = dataIdx + 1;
        const alt = alturas[dataIdx];
        const col = pos === 1 ? C.podio1 : pos === 2 ? C.podio2 : C.podio3;

        return (
          <Animated.View key={p.cedula} style={[styles.podioCol, { transform: [{ scale: scaleAnims[visualIdx] }] }]}>
            <View style={[styles.podioAvatar, { borderColor: col }]}>
              <Text style={styles.podioAvatarTxt}>{p.nombre.split(' ').map(w => w[0]).slice(0, 2).join('')}</Text>
              <View style={[styles.podioPosBadge, { backgroundColor: col }]}>
                <Text style={styles.podioPos}>{pos}</Text>
              </View>
            </View>
            <Text style={[styles.podioNombre, { color: pos === 1 ? C.goldLight : C.text }]} numberOfLines={1}>
              {p.nombre.split(' ')[0]}
            </Text>
            <Text style={styles.podioPuntos}>{p.puntos} pts</Text>
            <View style={[styles.podioBloque, { height: alt, backgroundColor: col + '33', borderColor: col + '66' }]}>
              <IconoTrofeo color={col} size={alt > 90 ? 28 : 20} />
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
};

interface FilaProps {
  pos: number;
  item: { cedula: string; nombre: string; municipio: string; puntos: number; sellos: number; nivel: string };
  esTuyo: boolean;
  index: number;
}

const FilaRanking: React.FC<FilaProps> = ({ pos, item, esTuyo, index }) => {
  const translateY = useRef(new Animated.Value(30)).current;
  const opacity    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 300, delay: index * 40, useNativeDriver: true }),
      Animated.timing(opacity,    { toValue: 1, duration: 300, delay: index * 40, useNativeDriver: true }),
    ]).start();
  }, []);

  const nivelColor = NIVELES.find(n => n.nombre === item.nivel)?.color ?? C.muted;

  return (
    <Animated.View style={{ transform: [{ translateY }], opacity }}>
      <View style={[styles.fila, esTuyo && styles.filaDestacada]}>
        <View style={styles.filaPosWrap}>
          {pos <= 3
            ? <IconoMedalla pos={pos} />
            : <Text style={[styles.filaPos, { color: esTuyo ? C.goldLight : C.muted }]}>{pos}</Text>
          }
        </View>
        <View style={[styles.filaAvatar, esTuyo && { borderColor: C.gold }]}>
          <Text style={styles.filaAvatarTxt}>{item.nombre.split(' ').map(w => w[0]).slice(0, 2).join('')}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.filaNombre, esTuyo && { color: C.goldLight }]} numberOfLines={1}>
            {item.nombre}{esTuyo ? ' (Tú)' : ''}
          </Text>
          <View style={styles.filaMetaRow}>
            <View style={[styles.nivelPill, { backgroundColor: nivelColor + '22' }]}>
              <Text style={[styles.nivelPillTxt, { color: nivelColor }]}>{item.nivel}</Text>
            </View>
            <Text style={styles.filaSellos}>📍 {item.sellos} sellos</Text>
          </View>
        </View>
        <View style={styles.filaPuntosWrap}>
          <Text style={[styles.filaPuntos, esTuyo && { color: C.goldLight }]}>{item.puntos}</Text>
          <Text style={styles.filaPuntosLabel}>pts</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const TarjetaPremio: React.FC<{ premio: typeof PREMIOS[0]; puntosUsuario: number; index: number }> = ({
  premio, puntosUsuario, index,
}) => {
  const pct         = Math.min((puntosUsuario / premio.umbralPuntos) * 100, 100);
  const desbloqueado = puntosUsuario >= premio.umbralPuntos;
  const faltan      = Math.max(premio.umbralPuntos - puntosUsuario, 0);
  const widthAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, { toValue: pct, duration: 800, delay: index * 150, useNativeDriver: false }).start();
  }, [pct]);

  return (
    <View style={[styles.premioCard, desbloqueado && styles.premioCardOk]}>
      <View style={styles.premioHeader}>
        <Text style={styles.premioIcono}>{premio.icono}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.premioNombre, { color: desbloqueado ? C.goldLight : C.text }]}>{premio.nombre}</Text>
          <Text style={styles.premioUmbral}>{premio.umbralPuntos} puntos requeridos</Text>
        </View>
        {desbloqueado
          ? <View style={styles.premioOkBadge}><Text style={styles.premioOkTxt}>✓ LISTO</Text></View>
          : <Text style={styles.premioFaltan}>Faltan {faltan} pts</Text>
        }
      </View>
      <View style={styles.premioBarraFondo}>
        <Animated.View style={[styles.premioBarraRelleno, {
          width: widthAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
          backgroundColor: desbloqueado ? C.green : C.gold,
        }]} />
      </View>
      <Text style={styles.premioPct}>{Math.round(pct)}% completado</Text>
    </View>
  );
};

const RankingScreen: React.FC = () => {
  const { state } = useApp();
  const { navigate, goBack, canGoBack } = useNav();
  const { usuario } = state;
  const [tab, setTab] = useState<'ranking' | 'premios'>('ranking');

  if (!usuario) return null;

  const puntos = usuario.puntos;

  const usuarioFila = {
    cedula:    usuario.cedula,
    nombre:    usuario.nombre,
    municipio: usuario.municipio,
    puntos,
    sellos:    usuario.sellos.length,
    nivel:     getNivelActual(puntos).nombre,
  };

  const rankingCompleto = [...RANKING_MOCK.filter(r => r.cedula !== usuario.cedula), usuarioFila]
    .sort((a, b) => b.puntos - a.puntos);

  const posUsuario    = rankingCompleto.findIndex(r => r.cedula === usuario.cedula) + 1;
  const top3          = rankingCompleto.slice(0, 3);
  const nivelActual   = getNivelActual(puntos);
  const totalJugadores = rankingCompleto.length;
  const pctSuperior   = Math.round(((totalJugadores - posUsuario) / totalJugadores) * 100);

  const ptosParaSubir = posUsuario > 1
    ? (rankingCompleto[posUsuario - 2]?.puntos ?? 0) - puntos
    : 0;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 32) + 12 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {canGoBack && (
            <TouchableOpacity onPress={goBack} style={styles.btnVolver}>
              <Text style={styles.btnVolverTxt}>‹</Text>
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.headerLabel}>TABLA DE POSICIONES</Text>
            <Text style={styles.headerTitulo}>Ranking Cafetero</Text>
          </View>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgePos}>#{posUsuario}</Text>
          <Text style={styles.headerBadgeLbl}>Tu posición</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {(['ranking', 'premios'] as const).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActiva]} onPress={() => setTab(t)}>
            <Text style={[styles.tabTxt, tab === t && styles.tabTxtActiva]}>
              {t === 'ranking' ? '🏆  RANKING' : '🎁  PREMIOS'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {tab === 'ranking' && (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statVal}>#{posUsuario}</Text>
                <Text style={styles.statLbl}>POSICIÓN</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statVal}>{puntos}</Text>
                <Text style={styles.statLbl}>PUNTOS</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statVal}>{pctSuperior}%</Text>
                <Text style={styles.statLbl}>SUPERADO</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.seccionTitulo}>🥇 TOP 3 — PODIO</Text>
              <Podio top3={top3 as any} />
            </View>

            <View style={styles.card}>
              <Text style={styles.seccionTitulo}>CLASIFICACIÓN GENERAL</Text>
              <Text style={styles.seccionSub}>{totalJugadores} participantes registrados</Text>
              {rankingCompleto.map((item, i) => (
                <FilaRanking
                  key={item.cedula}
                  pos={i + 1}
                  item={item as any}
                  esTuyo={item.cedula === usuario.cedula}
                  index={i}
                />
              ))}
            </View>

            <View style={styles.bannerMotiv}>
              <Text style={styles.bannerMotivEmoji}>☕</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerMotivTitulo}>
                  {posUsuario <= 3 ? '¡Estás en el podio!' : posUsuario <= 10 ? '¡Vas muy bien!' : '¡Sigue acumulando puntos!'}
                </Text>
                <Text style={styles.bannerMotivDesc}>
                  {posUsuario <= 3
                    ? 'Mantén tu posición y gana premios exclusivos al finalizar la feria.'
                    : `Solo ${ptosParaSubir} puntos te separan de la posición #${posUsuario - 1}.`}
                </Text>
              </View>
            </View>
          </>
        )}

        {tab === 'premios' && (
          <>
            <View style={styles.premiosIntro}>
              <Text style={styles.premiosIntroTitulo}>Tus Recompensas</Text>
              <Text style={styles.premiosIntroDesc}>
                Acumula puntos visitando stands y redime premios exclusivos de la feria.
                Los premios se entregan en la carpa principal.
              </Text>
            </View>

            <View style={styles.puntosCard}>
              <Text style={styles.puntosCardLabel}>PUNTOS ACTUALES</Text>
              <Text style={styles.puntosCardVal}>{puntos}</Text>
              <View style={styles.puntosCardNivel}>
                <Text style={{ fontSize: 18 }}>{nivelActual.emoji}</Text>
                <Text style={[styles.puntosCardNivelTxt, { color: nivelActual.color }]}>{nivelActual.nombre}</Text>
              </View>
            </View>

            {[...PREMIOS].sort((a, b) => a.umbralPuntos - b.umbralPuntos).map((p, i) => (
              <TarjetaPremio key={p.id} premio={p} puntosUsuario={puntos} index={i} />
            ))}

            <View style={styles.card}>
              <Text style={styles.seccionTitulo}>¿CÓMO GANAR PUNTOS?</Text>
              {[
                { emoji: '🛒', titulo: 'Compra en un stand',  desc: 'Cada $1.000 COP = 1 punto' },
                { emoji: '📍', titulo: 'Sello de municipio',  desc: 'Primera visita = 10 puntos extra' },
                { emoji: '⚡', titulo: 'Happy Hour',          desc: '2× puntos en horario especial' },
                { emoji: '🏅', titulo: 'Colección completa',  desc: 'Los 38 municipios = 200 puntos bonus' },
              ].map((c, i) => (
                <View key={i} style={styles.comoFila}>
                  <Text style={styles.comoEmoji}>{c.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.comoTitulo}>{c.titulo}</Text>
                    <Text style={styles.comoDesc}>{c.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.seccionTitulo}>NIVELES DE MEMBRESÍA</Text>
              {NIVELES.map((n, i) => {
                const alcanzado = puntos >= n.minPuntos;
                const esActual  = getNivelActual(puntos).nombre === n.nombre;
                return (
                  <View key={i} style={[styles.nivelFila, esActual && styles.nivelFilaActual]}>
                    <Text style={{ fontSize: 20 }}>{n.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.nivelNombre, { color: alcanzado ? n.color : C.muted }]}>
                        {n.nombre}{esActual ? <Text style={{ color: C.gold }}> ← Tú</Text> : null}
                      </Text>
                      <Text style={styles.nivelMin}>{n.minPuntos} puntos mínimos</Text>
                    </View>
                    <Text style={{ color: alcanzado ? '#7ED348' : C.muted, fontSize: 18 }}>
                      {alcanzado ? '✓' : '○'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default RankingScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  headerLabel:    { color: C.gold,  fontSize: 10, letterSpacing: 3, fontWeight: '700' },
  headerTitulo:   { color: C.text,  fontSize: 20, fontWeight: '800', letterSpacing: 0.5 },
  btnVolver:      { paddingRight: 4, paddingVertical: 4 },
  btnVolverTxt:   { color: C.gold, fontSize: 28, fontWeight: '300', lineHeight: 30 },
  headerBadge:    { alignItems: 'center', backgroundColor: C.card2, borderWidth: 1, borderColor: C.border, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 8 },
  headerBadgePos: { color: C.goldLight, fontSize: 24, fontWeight: '900', lineHeight: 26 },
  headerBadgeLbl: { color: C.muted,     fontSize: 10, letterSpacing: 1 },

  tabs:        { flexDirection: 'row', marginHorizontal: 16, marginTop: 12, backgroundColor: C.card, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: C.border },
  tab:         { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActiva:   { backgroundColor: C.gold },
  tabTxt:      { color: C.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  tabTxtActiva:{ color: C.bg },

  scroll: { padding: 16, gap: 14 },

  card:         { backgroundColor: C.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: C.border, gap: 12 },
  seccionTitulo:{ color: C.gold,  fontSize: 11, fontWeight: '700', letterSpacing: 2.5 },
  seccionSub:   { color: C.muted, fontSize: 12, marginTop: -8 },

  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.border, gap: 4 },
  statVal:  { color: C.goldLight, fontSize: 22, fontWeight: '800' },
  statLbl:  { color: C.muted,     fontSize: 9,  letterSpacing: 2, fontWeight: '700' },

  podioWrap:    { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 8, paddingTop: 16, paddingBottom: 4 },
  podioCol:     { alignItems: 'center', flex: 1, gap: 4 },
  podioAvatar:  { width: 52, height: 52, borderRadius: 26, backgroundColor: C.card2, borderWidth: 2, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  podioAvatarTxt:{ color: C.text, fontSize: 16, fontWeight: '800' },
  podioPosBadge: { position: 'absolute', bottom: -6, right: -6, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  podioPos:     { color: C.bg, fontSize: 11, fontWeight: '900' },
  podioNombre:  { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  podioPuntos:  { color: C.muted, fontSize: 11 },
  podioBloque:  { width: '100%', borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 8 },

  fila:          { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 12, borderWidth: 1, borderColor: 'transparent', marginBottom: 4 },
  filaDestacada: { backgroundColor: C.gold + '15', borderColor: C.gold + '40' },
  filaPosWrap:   { width: 28, alignItems: 'center' },
  filaPos:       { fontSize: 14, fontWeight: '700' },
  filaAvatar:    { width: 38, height: 38, borderRadius: 19, backgroundColor: C.card2, borderWidth: 1.5, borderColor: C.muted + '60', alignItems: 'center', justifyContent: 'center' },
  filaAvatarTxt: { color: C.text, fontSize: 13, fontWeight: '700' },
  filaNombre:    { color: C.text, fontSize: 13, fontWeight: '600' },
  filaMetaRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  nivelPill:     { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  nivelPillTxt:  { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  filaSellos:    { color: C.muted, fontSize: 10 },
  filaPuntosWrap:{ alignItems: 'flex-end' },
  filaPuntos:    { color: C.text, fontSize: 16, fontWeight: '800' },
  filaPuntosLabel:{ color: C.muted, fontSize: 10 },

  bannerMotiv:       { flexDirection: 'row', gap: 14, backgroundColor: C.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: C.gold + '40', alignItems: 'center' },
  bannerMotivEmoji:  { fontSize: 32 },
  bannerMotivTitulo: { color: C.goldLight, fontSize: 15, fontWeight: '800', marginBottom: 4 },
  bannerMotivDesc:   { color: C.muted,     fontSize: 12, lineHeight: 18 },

  premiosIntro:       { gap: 6 },
  premiosIntroTitulo: { color: C.text, fontSize: 22, fontWeight: '800' },
  premiosIntroDesc:   { color: C.muted, fontSize: 13, lineHeight: 20 },

  puntosCard:        { backgroundColor: C.card, borderRadius: 16, padding: 20, borderWidth: 1.5, borderColor: C.gold + '50', alignItems: 'center', gap: 6 },
  puntosCardLabel:   { color: C.gold,     fontSize: 10, letterSpacing: 3, fontWeight: '700' },
  puntosCardVal:     { color: C.goldLight, fontSize: 52, fontWeight: '900', lineHeight: 56 },
  puntosCardNivel:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  puntosCardNivelTxt:{ fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },

  premioCard:      { backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, gap: 10 },
  premioCardOk:    { borderColor: C.green + '80', backgroundColor: C.green + '0A' },
  premioHeader:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  premioIcono:     { fontSize: 32 },
  premioNombre:    { fontSize: 14, fontWeight: '700' },
  premioUmbral:    { color: C.muted, fontSize: 11, marginTop: 2 },
  premioOkBadge:   { backgroundColor: C.green + '33', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  premioOkTxt:     { color: '#7ED348', fontSize: 11, fontWeight: '700' },
  premioFaltan:    { color: C.muted, fontSize: 11, textAlign: 'right' },
  premioBarraFondo:{ height: 8, backgroundColor: C.card2, borderRadius: 4, overflow: 'hidden' },
  premioBarraRelleno: { height: '100%', borderRadius: 4 },
  premioPct:       { color: C.muted, fontSize: 11, textAlign: 'right', marginTop: -4 },

  comoFila:  { flexDirection: 'row', gap: 14, alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  comoEmoji: { fontSize: 22, width: 32, textAlign: 'center' },
  comoTitulo:{ color: C.text, fontSize: 14, fontWeight: '600' },
  comoDesc:  { color: C.muted, fontSize: 12, marginTop: 2 },

  nivelFila:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: C.card2, borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
  nivelFilaActual: { borderColor: C.gold + '60', backgroundColor: C.gold + '10' },
  nivelNombre:     { fontSize: 14, fontWeight: '700' },
  nivelMin:        { color: C.muted, fontSize: 11, marginTop: 2 },
});
