import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Share,
  Alert,
  Platform,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Svg, { Circle, Path } from 'react-native-svg';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useApp } from '../context/AppContext';
import { useNav } from '../context/NavContext';
import { PREMIOS } from '../data/mockData';

// ─── Paleta ────────────────────────────────────────────────────────────────────
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
};

const { width: SW } = Dimensions.get('window');

// ─── NIVELES adaptados (minPuntos, emoji, beneficios) ─────────────────────────
const NIVELES_EXT = [
  {
    nombre: 'Visitante',
    minPuntos: 0,
    color: '#888',
    emoji: '🪴',
    beneficios: ['Acceso a todos los stands', 'Colecciona sellos de municipios'],
  },
  {
    nombre: 'Degustador',
    minPuntos: 100,
    color: '#6B4226',
    emoji: '☕',
    beneficios: ['Descuento 5% en stands participantes', 'Acceso a catas guiadas'],
  },
  {
    nombre: 'Conocedor',
    minPuntos: 250,
    color: '#2E7D32',
    emoji: '🌿',
    beneficios: ['Descuento 10% en stands', 'Invitación a evento exclusivo', 'Doble puntos en Happy Hour'],
  },
  {
    nombre: 'Embajador Cafetero',
    minPuntos: 500,
    color: '#F57F17',
    emoji: '🏆',
    beneficios: ['Descuento 20% en todos los stands', 'Kit cafetero de regalo', 'Cata privada con expertos', 'Acceso VIP a conciertos'],
  },
];

// ─── Municipios de la feria ────────────────────────────────────────────────────
const MUNICIPIOS_FERIA = [
  'Ibagué', 'Planadas', 'Rio Blanco', 'Casabianca',
  'Herrera', 'Alpujarra', 'Ataco', 'Chaparral',
];

// ─── Iconos SVG inline ────────────────────────────────────────────────────────
const SELLO_ICONOS = [
  <Path key="cafe"   d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="#C8860A" />,
  <Path key="musica" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" fill="#C8860A" />,
  <Path key="fogon"  d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5 0.67z" fill="#C8860A" />,
];

// ─── Componente Sello ─────────────────────────────────────────────────────────
interface SelloProps {
  municipio: string;
  obtenido: boolean;
  index: number;
}

const SelloItem: React.FC<SelloProps> = ({ municipio, obtenido, index }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPress = () => {
    if (!obtenido) return;
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.15, useNativeDriver: false }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: false }),
    ]).start();
  };

  const abrev = municipio.slice(0, 3).toUpperCase();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={obtenido ? 0.8 : 1}>
      <Animated.View style={[styles.selloWrap, { transform: [{ scale }] }]}>
        <View style={[styles.selloCiruclo, obtenido ? styles.selloObtenido : styles.selloPendiente]}>
          {!obtenido && <View style={styles.selloBordePunteado} />}
          <Svg width={28} height={28} viewBox="0 0 24 24">
            {obtenido
              ? SELLO_ICONOS[index % 3]
              : <Circle cx="12" cy="12" r="8" fill="#A89070" opacity={0.3} />}
          </Svg>
          {obtenido && (
            <View style={styles.selloEstrella}>
              <Text style={{ fontSize: 8 }}>★</Text>
            </View>
          )}
        </View>
        <Text style={[styles.selloTexto, { color: obtenido ? C.goldLight : C.muted }]} numberOfLines={1}>
          {abrev}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── Barra de progreso ────────────────────────────────────────────────────────
const BarraProgreso: React.FC<{ actual: number; total: number; label: string }> = ({ actual, total, label }) => {
  const pct = total > 0 ? Math.min((actual / total) * 100, 100) : 0;
  return (
    <View style={styles.barraWrap}>
      <View style={styles.barraHeader}>
        <Text style={styles.barraLabel}>{label}</Text>
        <Text style={styles.barraPct}>{actual}/{total}</Text>
      </View>
      <View style={styles.barraFondo}>
        <View style={[styles.barraRelleno, { width: `${pct}%` }]} />
        {[25, 50, 75].map(m => (
          <View key={m} style={[styles.barraMarca, { left: `${m}%` as any }]} />
        ))}
      </View>
    </View>
  );
};

// ─── Pantalla principal ───────────────────────────────────────────────────────
const PasaporteScreen: React.FC = () => {
  const { state } = useApp();
  const { goBack, canGoBack } = useNav();
  const { usuario } = state;
  const [tabActiva, setTabActiva] = useState<'qr' | 'sellos' | 'historial'>('qr');

  if (!usuario) return null;

  // Nivel actual y siguiente (usando minPuntos)
  const nivelActual = [...NIVELES_EXT].reverse().find(n => usuario.puntos >= n.minPuntos) ?? NIVELES_EXT[0];
  const nivelSig    = NIVELES_EXT.find(n => n.minPuntos > usuario.puntos);
  const puntosBase  = nivelActual.minPuntos;
  const puntosTop   = nivelSig?.minPuntos ?? nivelActual.minPuntos + 1;
  const pctNivel    = Math.min(((usuario.puntos - puntosBase) / (puntosTop - puntosBase)) * 100, 100);

  // sellos es string[] con nombres de municipios
  const sellosSet = new Set(usuario.sellos);

  // Transacciones ordenadas desc
  const transacciones = [...(state.transacciones ?? [])].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
  );

  const onCompartir = async () => {
    try {
      await Share.share({
        title: 'Mi Pasaporte Cafetero',
        message:
          `☕ ¡Soy ${usuario.nombre} en la Feria Internacional de Café del Tolima!\n` +
          `🏅 Nivel: ${nivelActual.nombre}\n` +
          `⭐ Puntos: ${usuario.puntos}\n` +
          `📍 Sellos: ${usuario.sellos.length}/${MUNICIPIOS_FERIA.length} municipios\n\n` +
          `#FeriaCaféTolima #PasaporteCafetero`,
      });
    } catch {
      Alert.alert('Error', 'No se pudo compartir');
    }
  };

  const qrPayload = JSON.stringify({
    cedula:    usuario.cedula,
    nombre:    usuario.nombre,
    nivel:     usuario.nivel,
    puntos:    usuario.puntos,
    municipio: usuario.municipio,
  });

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {canGoBack && (
            <TouchableOpacity onPress={goBack} style={styles.btnVolver}>
              <Text style={styles.btnVolverTxt}>‹</Text>
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.headerLabel}>MI PASAPORTE</Text>
            <Text style={styles.headerNombre} numberOfLines={1}>{usuario.nombre}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.btnCompartir} onPress={onCompartir}>
          <Svg width={18} height={18} viewBox="0 0 24 24">
            <Path
              d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"
              fill={C.gold}
            />
          </Svg>
          <Text style={styles.btnCompartirTxt}>COMPARTIR</Text>
        </TouchableOpacity>
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabs}>
        {(['qr', 'sellos', 'historial'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tabActiva === t && styles.tabActiva]}
            onPress={() => setTabActiva(t)}
          >
            <Text style={[styles.tabTxt, tabActiva === t && styles.tabTxtActiva]}>
              {t === 'qr' ? 'QR' : t === 'sellos' ? 'SELLOS' : 'HISTORIAL'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ════════ TAB QR ════════ */}
        {tabActiva === 'qr' && (
          <>
            {/* Tarjeta pasaporte */}
            <View style={styles.cardPasaporte}>
              <View style={styles.esquinaTL} />
              <View style={styles.esquinaTR} />
              <View style={styles.esquinaBL} />
              <View style={styles.esquinaBR} />

              <Text style={styles.pasapTitulo}>FERIA INTERNACIONAL</Text>
              <Text style={styles.pasapSubtitulo}>CAFÉ DEL TOLIMA · 2026</Text>
              <View style={styles.separador} />

              <View style={styles.qrWrap}>
                <QRCode
                  value={qrPayload}
                  size={180}
                  color={C.text}
                  backgroundColor={C.card}
                />
              </View>

              <View style={styles.separador} />

              <Text style={styles.pasapNombre}>{usuario.nombre.toUpperCase()}</Text>
              <Text style={styles.pasapCedula}>C.C. {usuario.cedula}</Text>
              <Text style={styles.pasapMunicipio}>{usuario.municipio} · {usuario.departamento}</Text>

              <View style={[styles.nivelBadge, { backgroundColor: nivelActual.color + '22' }]}>
                <Text style={styles.nivelEmoji}>{nivelActual.emoji}</Text>
                <Text style={[styles.nivelTxt, { color: nivelActual.color }]}>
                  {nivelActual.nombre.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Progreso de nivel */}
            <View style={styles.card}>
              <Text style={styles.seccionTitulo}>PROGRESO DE NIVEL</Text>
              <BarraProgreso
                actual={usuario.puntos - puntosBase}
                total={puntosTop - puntosBase}
                label={nivelSig ? `→ ${nivelSig.nombre}` : '¡Nivel máximo!'}
              />
              <View style={styles.nivelFila}>
                <Text style={styles.nivelInfo}>
                  {nivelActual.nombre}{'  '}
                  <Text style={{ color: C.gold }}>{usuario.puntos} pts</Text>
                </Text>
                {nivelSig && (
                  <Text style={styles.nivelInfo}>{nivelSig.nombre} ({nivelSig.minPuntos} pts)</Text>
                )}
              </View>
              <View style={styles.beneficiosList}>
                {nivelActual.beneficios.map((b, i) => (
                  <View key={i} style={styles.beneficioItem}>
                    <Text style={styles.beneficioBullet}>✦</Text>
                    <Text style={styles.beneficioTxt}>{b}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Premios disponibles */}
            <View style={styles.card}>
              <Text style={styles.seccionTitulo}>PREMIOS DISPONIBLES</Text>
              {PREMIOS.map(p => {
                const desbloqueado = usuario.puntos >= p.umbralPuntos;
                return (
                  <View key={p.id} style={styles.premioFila}>
                    <Text style={styles.premioEmoji}>{p.icono}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.premioNombre, { color: desbloqueado ? C.text : C.muted }]}>
                        {p.nombre}
                      </Text>
                      <Text style={styles.premioDesc}>{p.umbralPuntos} puntos requeridos</Text>
                    </View>
                    <View style={[styles.premioBadge, { backgroundColor: desbloqueado ? C.green + '44' : C.card2 }]}>
                      <Text style={[styles.premioBadgeTxt, { color: desbloqueado ? '#7ED348' : C.muted }]}>
                        {desbloqueado ? '✓ LISTO' : `${p.umbralPuntos} pts`}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* ════════ TAB SELLOS ════════ */}
        {tabActiva === 'sellos' && (
          <>
            <View style={styles.card}>
              <Text style={styles.seccionTitulo}>ÁLBUM DE SELLOS</Text>
              <Text style={styles.selloResumen}>
                <Text style={{ color: C.goldLight, fontSize: 28, fontWeight: '700' }}>
                  {usuario.sellos.length}
                </Text>
                <Text style={{ color: C.muted, fontSize: 16 }}>
                  {'  '}/{MUNICIPIOS_FERIA.length} municipios visitados
                </Text>
              </Text>
              <BarraProgreso
                actual={usuario.sellos.length}
                total={MUNICIPIOS_FERIA.length}
                label="Colección completa"
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.seccionTitulo}>MUNICIPIOS CAFETEROS</Text>
              <View style={styles.sellosGrid}>
                {MUNICIPIOS_FERIA.map((m, i) => (
                  <SelloItem
                    key={m}
                    municipio={m}
                    obtenido={sellosSet.has(m)}
                    index={i}
                  />
                ))}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.seccionTitulo}>LOGROS</Text>
              {[
                { icon: '☕', titulo: 'Primer sorbo',       desc: 'Visita tu primer stand',        ok: usuario.sellos.length >= 1 },
                { icon: '🗺️', titulo: 'Explorador',         desc: 'Visita 4 municipios',            ok: usuario.sellos.length >= 4 },
                { icon: '🏆', titulo: 'Pasaporte completo', desc: 'Visita todos los municipios',    ok: usuario.sellos.length >= 8 },
                { icon: '💰', titulo: 'Gran comprador',     desc: 'Acumula 5.000 puntos',           ok: usuario.puntos >= 5000 },
              ].map((l, i) => (
                <View key={i} style={[styles.logroFila, l.ok && styles.logroOk]}>
                  <Text style={styles.logroIcono}>{l.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.logroTitulo, { color: l.ok ? C.goldLight : C.muted }]}>{l.titulo}</Text>
                    <Text style={styles.logroDesc}>{l.desc}</Text>
                  </View>
                  <Text style={{ color: l.ok ? '#7ED348' : C.muted, fontSize: 18 }}>
                    {l.ok ? '✓' : '○'}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ════════ TAB HISTORIAL ════════ */}
        {tabActiva === 'historial' && (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statVal}>{transacciones.length}</Text>
                <Text style={styles.statLbl}>COMPRAS</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statVal}>
                  ${(transacciones.reduce((s, t) => s + ((t as any).monto ?? 0), 0) / 1000).toFixed(0)}K
                </Text>
                <Text style={styles.statLbl}>GASTADO</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statVal}>{usuario.puntos}</Text>
                <Text style={styles.statLbl}>PUNTOS</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.seccionTitulo}>COMPRAS RECIENTES</Text>
              {transacciones.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyIcon}>🧾</Text>
                  <Text style={styles.emptyTxt}>Aún no tienes compras registradas</Text>
                  <Text style={styles.emptyDesc}>
                    Visita un stand y presenta tu QR para acumular puntos
                  </Text>
                </View>
              ) : (
                transacciones.map((t, i) => (
                  <View key={i} style={styles.txFila}>
                    <View style={styles.txIconWrap}>
                      <Text style={{ fontSize: 20 }}>☕</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.txStand} numberOfLines={1}>
                        {(t as any).standNombre ?? t.descripcion ?? 'Stand desconocido'}
                      </Text>
                      <Text style={styles.txMunicipio}>{(t as any).municipio ?? t.municipioId ?? '—'}</Text>
                      <Text style={styles.txFecha}>
                        {format(new Date(t.fecha), "d 'de' MMMM · HH:mm", { locale: es })}
                      </Text>
                    </View>
                    <View style={styles.txRight}>
                      <Text style={styles.txMonto}>
                        +{((t as any).monto ?? 0).toLocaleString('es-CO')}
                      </Text>
                      <Text style={styles.txMontoLabel}>COP</Text>
                      <View style={styles.txPtsBadge}>
                        <Text style={styles.txPts}>+{t.puntos ?? 0} pts</Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>

            <Text style={styles.notaPie}>
              Los puntos se acreditan al instante tras cada compra registrada por el vendedor.
            </Text>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerLabel:  { color: C.gold, fontSize: 10, letterSpacing: 3, fontWeight: '700' },
  headerNombre: { color: C.text, fontSize: 18, fontWeight: '700', letterSpacing: 0.5, maxWidth: SW * 0.45 },
  btnVolver:    { paddingRight: 4, paddingVertical: 4 },
  btnVolverTxt: { color: C.gold, fontSize: 28, fontWeight: '300', lineHeight: 30 },
  btnCompartir: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.card2, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
  },
  btnCompartirTxt: { color: C.gold, fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  tabs: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 12,
    backgroundColor: C.card, borderRadius: 12, padding: 4,
    borderWidth: 1, borderColor: C.border,
  },
  tab:         { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActiva:   { backgroundColor: C.gold },
  tabTxt:      { color: C.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
  tabTxtActiva:{ color: C.bg },

  scroll: { padding: 16, gap: 14 },

  card: {
    backgroundColor: C.card, borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: C.border, gap: 12,
  },
  seccionTitulo: { color: C.gold, fontSize: 11, fontWeight: '700', letterSpacing: 2.5, marginBottom: 2 },

  cardPasaporte: {
    backgroundColor: C.card, borderRadius: 20, padding: 24,
    borderWidth: 1.5, borderColor: C.gold + '60',
    alignItems: 'center', gap: 12, overflow: 'hidden',
  },
  esquinaTL: { position: 'absolute', top: 10, left: 10,   width: 20, height: 20, borderTopWidth: 2, borderLeftWidth: 2,    borderColor: C.gold },
  esquinaTR: { position: 'absolute', top: 10, right: 10,  width: 20, height: 20, borderTopWidth: 2, borderRightWidth: 2,   borderColor: C.gold },
  esquinaBL: { position: 'absolute', bottom: 10, left: 10, width: 20, height: 20, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: C.gold },
  esquinaBR: { position: 'absolute', bottom: 10, right: 10,width: 20, height: 20, borderBottomWidth: 2, borderRightWidth: 2,borderColor: C.gold },

  pasapTitulo:   { color: C.goldLight, fontSize: 13, fontWeight: '800', letterSpacing: 3 },
  pasapSubtitulo:{ color: C.muted, fontSize: 10, letterSpacing: 2, marginTop: -8 },
  separador:     { width: '80%', height: 1, backgroundColor: C.gold + '40' },
  qrWrap:        { padding: 16, backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border },
  pasapNombre:   { color: C.text, fontSize: 18, fontWeight: '800', letterSpacing: 1.5, textAlign: 'center' },
  pasapCedula:   { color: C.muted, fontSize: 12, letterSpacing: 2, marginTop: -6 },
  pasapMunicipio:{ color: C.gold, fontSize: 12, fontWeight: '600', letterSpacing: 1, marginTop: -4 },
  nivelBadge:    { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: C.border },
  nivelEmoji:    { fontSize: 18 },
  nivelTxt:      { fontSize: 13, fontWeight: '800', letterSpacing: 2 },

  barraWrap:   { gap: 8 },
  barraHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  barraLabel:  { color: C.muted, fontSize: 12 },
  barraPct:    { color: C.gold, fontSize: 12, fontWeight: '700' },
  barraFondo:  { height: 10, backgroundColor: C.card2, borderRadius: 6, overflow: 'hidden' },
  barraRelleno:{ height: '100%', backgroundColor: C.gold, borderRadius: 6 },
  barraMarca:  { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: C.bg + '80' },
  nivelFila:   { flexDirection: 'row', justifyContent: 'space-between', marginTop: -4 },
  nivelInfo:   { color: C.muted, fontSize: 11 },
  beneficiosList: { gap: 6, marginTop: 4 },
  beneficioItem:  { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  beneficioBullet:{ color: C.gold, fontSize: 10, marginTop: 2 },
  beneficioTxt:   { color: C.text, fontSize: 13, flex: 1 },

  premioFila:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  premioEmoji:    { fontSize: 24, width: 36, textAlign: 'center' },
  premioNombre:   { fontSize: 14, fontWeight: '600', letterSpacing: 0.3 },
  premioDesc:     { color: C.muted, fontSize: 11, marginTop: 2 },
  premioBadge:    { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  premioBadgeTxt: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  selloResumen: { textAlign: 'center', lineHeight: 36 },
  sellosGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', paddingTop: 4 },
  selloWrap:    { alignItems: 'center', width: (SW - 80) / 4 },
  selloCiruclo: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  selloObtenido:{ backgroundColor: C.card2, borderWidth: 2, borderColor: C.gold },
  selloPendiente:{ backgroundColor: C.card2, borderWidth: 1.5, borderColor: C.muted + '40' },
  selloBordePunteado: { position: 'absolute', top: -2, left: -2, right: -2, bottom: -2, borderRadius: 34, borderWidth: 1, borderColor: C.muted + '20' },
  selloEstrella:{ position: 'absolute', top: -4, right: -4, backgroundColor: C.gold, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  selloTexto:   { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginTop: 6 },

  logroFila:   { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: C.card2, borderRadius: 12, borderWidth: 1, borderColor: C.border },
  logroOk:     { borderColor: C.gold + '60', backgroundColor: C.gold + '10' },
  logroIcono:  { fontSize: 22 },
  logroTitulo: { fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  logroDesc:   { color: C.muted, fontSize: 11, marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.border, gap: 4 },
  statVal:  { color: C.goldLight, fontSize: 22, fontWeight: '800' },
  statLbl:  { color: C.muted, fontSize: 9, letterSpacing: 2, fontWeight: '700' },

  emptyWrap: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyTxt:  { color: C.text, fontSize: 15, fontWeight: '600' },
  emptyDesc: { color: C.muted, fontSize: 13, textAlign: 'center', lineHeight: 20 },

  txFila:       { flexDirection: 'row', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border, alignItems: 'flex-start' },
  txIconWrap:   { width: 40, height: 40, backgroundColor: C.card2, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  txStand:      { color: C.text, fontSize: 14, fontWeight: '600' },
  txMunicipio:  { color: C.gold, fontSize: 11, marginTop: 1 },
  txFecha:      { color: C.muted, fontSize: 11, marginTop: 2 },
  txRight:      { alignItems: 'flex-end', gap: 4 },
  txMonto:      { color: C.goldLight, fontSize: 15, fontWeight: '800' },
  txMontoLabel: { color: C.muted, fontSize: 9, letterSpacing: 1, marginTop: -4 },
  txPtsBadge:   { backgroundColor: C.green + '44', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  txPts:        { color: '#7ED348', fontSize: 11, fontWeight: '700' },

  notaPie: { color: C.muted, fontSize: 11, textAlign: 'center', lineHeight: 16, paddingHorizontal: 8 },
});

export default PasaporteScreen;
