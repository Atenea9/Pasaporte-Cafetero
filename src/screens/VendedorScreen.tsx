import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { useNav } from '../context/NavContext';
import { STANDS, getMunicipio } from '../data/mockData';

const C = {
  bg:        '#1A0F00',
  card:      '#2C1A00',
  card2:     '#3D2400',
  gold:      '#C8860A',
  goldLight: '#E8A830',
  green:     '#2E5016',
  text:      '#F5EDD8',
  muted:     '#A89070',
  danger:    '#8B2000',
  success:   '#2E7016',
};

interface TransaccionLocal {
  id: string;
  cedulaCliente: string;
  nombreCliente: string;
  monto: number;
  puntos: number;
  selloOtorgado: boolean;
  hora: string;
  fecha: string;
}

const TRANS_MOCK: TransaccionLocal[] = [
  { id: 'T001', cedulaCliente: '1234567890', nombreCliente: 'María Rodríguez', monto: 85000, puntos: 85, selloOtorgado: true,  hora: '10:32', fecha: 'Hoy' },
  { id: 'T002', cedulaCliente: '9876543210', nombreCliente: 'Carlos Pérez',    monto: 45000, puntos: 45, selloOtorgado: false, hora: '11:15', fecha: 'Hoy' },
  { id: 'T003', cedulaCliente: '5551234567', nombreCliente: 'Luisa Gómez',     monto: 120000,puntos: 120,selloOtorgado: true,  hora: '09:48', fecha: 'Hoy' },
];

const CLIENTES_MOCK: Record<string, { nombre: string; nivel: string; puntos: number }> = {
  '1234567890':  { nombre: 'María Rodríguez',      nivel: 'Conocedor',        puntos: 320 },
  '9876543210':  { nombre: 'Carlos Pérez',          nivel: 'Degustador',       puntos: 150 },
  '5551234567':  { nombre: 'Luisa Gómez',           nivel: 'Embajador Cafetero', puntos: 870 },
  '1110987654':  { nombre: 'Andrés Torres',          nivel: 'Visitante',        puntos: 40  },
  '1107654321':  { nombre: 'Carlos Andrés Rojas',   nivel: 'Conocedor',        puntos: 320 },
};

function PinScreen({ onSuccess }: { onSuccess: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const { goBack } = useNav();

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === '2025') {
          onSuccess();
        } else {
          setError(true);
          shake();
          setTimeout(() => setPin(''), 700);
        }
      }, 200);
    }
  };

  const handleDel = () => setPin(p => p.slice(0, -1));
  const digits = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  return (
    <View style={styles.pinContainer}>
      <TouchableOpacity style={styles.pinBackBtn} onPress={goBack}>
        <Text style={styles.pinBackText}>‹ Volver</Text>
      </TouchableOpacity>
      <View style={styles.pinHeader}>
        <Text style={styles.pinLogo}>☕</Text>
        <Text style={styles.pinTitle}>ACCESO VENDEDOR</Text>
        <Text style={styles.pinSub}>Ingresa tu PIN de stand</Text>
      </View>
      <Animated.View style={[styles.pinDotsRow, { transform: [{ translateX: shakeAnim }] }]}>
        {[0,1,2,3].map(i => (
          <View key={i} style={[styles.pinDot, i < pin.length && styles.pinDotFilled, error && styles.pinDotError]} />
        ))}
      </Animated.View>
      {error && <Text style={styles.pinError}>PIN incorrecto. Intenta de nuevo.</Text>}
      <View style={styles.pinGrid}>
        {digits.map((d, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.pinKey, d === '' && { opacity: 0 }]}
            onPress={() => d === '⌫' ? handleDel() : d && handleDigit(d)}
            disabled={d === ''}
          >
            <Text style={styles.pinKeyText}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.pinHint}>PIN de demostración: 2025</Text>
    </View>
  );
}

function ScannerModal({ visible, onClose, onScan }: { visible: boolean; onClose: () => void; onScan: (cedula: string) => void }) {
  const scanAnim  = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) return;
    const scan = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim,  { toValue: 1,    duration: 1800, useNativeDriver: false }),
        Animated.timing(scanAnim,  { toValue: 0,    duration: 1800, useNativeDriver: false }),
      ])
    );
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 900,  useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 900,  useNativeDriver: true }),
      ])
    );
    scan.start(); pulse.start();
    return () => { scan.stop(); pulse.stop(); };
  }, [visible]);

  const scanY = scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 200] });

  const CLIENTES_DEMO = [
    { cedula: '1107654321', nombre: 'Carlos A. Rojas (Tú)' },
    { cedula: '1234567890', nombre: 'María Rodríguez' },
    { cedula: '9876543210', nombre: 'Carlos Pérez' },
    { cedula: '5551234567', nombre: 'Luisa Gómez' },
    { cedula: '1110987654', nombre: 'Andrés Torres' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>ESCANEAR QR DEL CLIENTE</Text>
            <TouchableOpacity onPress={onClose} style={styles.scannerCloseBtn}>
              <Text style={styles.scannerCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Animated.View style={[styles.scannerViewfinder, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.scannerCornerTL} />
            <View style={styles.scannerCornerTR} />
            <View style={styles.scannerCornerBL} />
            <View style={styles.scannerCornerBR} />
            <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanY }] }]} />
            <Text style={styles.scannerQRIcon}>⬛</Text>
          </Animated.View>

          <Text style={styles.scannerInstructions}>
            Apunta la cámara al QR del Pasaporte del visitante
          </Text>

          <Text style={styles.scannerDemoLabel}>— Simular escaneo de cliente —</Text>
          <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
            {CLIENTES_DEMO.map(c => (
              <TouchableOpacity key={c.cedula} style={styles.scannerDemoBtn} onPress={() => onScan(c.cedula)}>
                <Text style={styles.scannerDemoBtnIcon}>📱</Text>
                <View>
                  <Text style={styles.scannerDemoBtnName}>{c.nombre}</Text>
                  <Text style={styles.scannerDemoBtnCed}>CC {c.cedula}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function RegistroModal({ visible, cedula, standMunicipio, onClose, onConfirm }: {
  visible: boolean;
  cedula: string;
  standMunicipio: string;
  onClose: () => void;
  onConfirm: (monto: number) => void;
}) {
  const [monto, setMonto] = useState('');
  const [loading, setLoading] = useState(false);

  const cliente = CLIENTES_MOCK[cedula] ?? { nombre: 'Visitante', nivel: 'Visitante', puntos: 0 };
  const montoNum     = parseInt(monto.replace(/\D/g, ''), 10) || 0;
  const puntosGanados = Math.floor(montoNum / 1000);
  const selloOtorgado = montoNum >= 50000;

  const formatCOP = (n: number) => n > 0 ? `$${n.toLocaleString('es-CO')}` : '$0';

  const handleConfirm = async () => {
    if (montoNum < 1000) {
      Alert.alert('Monto inválido', 'Ingresa un monto mayor a $1.000');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    onConfirm(montoNum);
    setMonto('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.regContainer}>
          <View style={styles.regClientHeader}>
            <View style={styles.regAvatar}>
              <Text style={styles.regAvatarText}>{(cliente.nombre[0] ?? 'V').toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.regClientName}>{cliente.nombre}</Text>
              <Text style={styles.regClientCed}>CC {cedula}</Text>
              <View style={styles.regNivelBadge}>
                <Text style={styles.regNivelText}>☕ {cliente.nivel}</Text>
              </View>
            </View>
            <View style={styles.regPuntosBox}>
              <Text style={styles.regPuntosNum}>{cliente.puntos}</Text>
              <Text style={styles.regPuntosLabel}>puntos</Text>
            </View>
          </View>

          <Text style={styles.regFieldLabel}>VALOR DE LA COMPRA</Text>
          <View style={styles.regInputRow}>
            <Text style={styles.regCurrencySymbol}>$</Text>
            <TextInput
              style={styles.regInput}
              value={monto}
              onChangeText={v => setMonto(v.replace(/\D/g, ''))}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={C.muted}
              maxLength={9}
            />
            <Text style={styles.regCOPLabel}>COP</Text>
          </View>

          <View style={styles.regPreviewCard}>
            <Text style={styles.regPreviewTitle}>BENEFICIOS QUE RECIBIRÁ</Text>
            <View style={styles.regPreviewRow}>
              <Text style={styles.regPreviewIcon}>⭐</Text>
              <Text style={styles.regPreviewLabel}>Puntos ganados</Text>
              <Text style={[styles.regPreviewVal, { color: C.goldLight }]}>+{puntosGanados} pts</Text>
            </View>
            <View style={styles.regPreviewRow}>
              <Text style={styles.regPreviewIcon}>🔵</Text>
              <Text style={styles.regPreviewLabel}>Sello — {standMunicipio}</Text>
              <Text style={[styles.regPreviewVal, { color: selloOtorgado ? '#4CAF50' : C.muted }]}>
                {selloOtorgado ? '✓ SÍ' : `Falta ${formatCOP(50000 - montoNum)}`}
              </Text>
            </View>
            <View style={styles.regPreviewRow}>
              <Text style={styles.regPreviewIcon}>💰</Text>
              <Text style={styles.regPreviewLabel}>Total compra</Text>
              <Text style={[styles.regPreviewVal, { color: C.text }]}>{formatCOP(montoNum)}</Text>
            </View>
          </View>

          {selloOtorgado && (
            <View style={styles.selloBanner}>
              <Text style={styles.selloBannerText}>🎉 ¡Se otorgará sello de {standMunicipio}!</Text>
            </View>
          )}

          <View style={styles.regActions}>
            <TouchableOpacity style={styles.regCancelBtn} onPress={onClose}>
              <Text style={styles.regCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.regConfirmBtn, loading && { opacity: 0.7 }]}
              onPress={handleConfirm}
              disabled={loading}
            >
              <Text style={styles.regConfirmText}>{loading ? 'Registrando...' : 'Confirmar compra'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SuccessModal({ visible, data, onClose }: {
  visible: boolean;
  data: { nombre: string; monto: number; puntos: number; sello: boolean; municipio: string } | null;
  onClose: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  if (!data) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.successBox, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>¡COMPRA REGISTRADA!</Text>
          <Text style={styles.successCliente}>{data.nombre}</Text>
          <View style={styles.successStats}>
            <View style={styles.successStat}>
              <Text style={styles.successStatNum}>${data.monto.toLocaleString('es-CO')}</Text>
              <Text style={styles.successStatLabel}>Compra</Text>
            </View>
            <View style={styles.successStatDivider} />
            <View style={styles.successStat}>
              <Text style={[styles.successStatNum, { color: C.goldLight }]}>+{data.puntos}</Text>
              <Text style={styles.successStatLabel}>Puntos</Text>
            </View>
            {data.sello && (
              <>
                <View style={styles.successStatDivider} />
                <View style={styles.successStat}>
                  <Text style={styles.successStatNum}>🔵</Text>
                  <Text style={styles.successStatLabel}>{data.municipio}</Text>
                </View>
              </>
            )}
          </View>
          <TouchableOpacity style={styles.successBtn} onPress={onClose}>
            <Text style={styles.successBtnText}>Nueva venta</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default function VendedorScreen() {
  const { state, dispatch } = useApp();
  const { navigate } = useNav();
  const [autenticado, setAutenticado]         = useState(false);
  const [standId, setStandId]                 = useState<string | null>(null);
  const [scannerVisible, setScannerVisible]   = useState(false);
  const [cedulaEscaneada, setCedulaEscaneada] = useState<string | null>(null);
  const [registroVisible, setRegistroVisible] = useState(false);
  const [successData, setSuccessData]         = useState<{
    nombre: string; monto: number; puntos: number; sello: boolean; municipio: string;
  } | null>(null);
  const [successVisible, setSuccessVisible]   = useState(false);
  const [transacciones, setTransacciones]     = useState<TransaccionLocal[]>(TRANS_MOCK);

  const ventasTurno = transacciones.filter(t => t.fecha === 'Hoy').length;
  const totalTurno  = transacciones.filter(t => t.fecha === 'Hoy').reduce((s, t) => s + t.monto, 0);
  const sellosTurno = transacciones.filter(t => t.fecha === 'Hoy' && t.selloOtorgado).length;

  const stand = standId ? STANDS.find(s => s.id === standId) : null;
  const standMunNombre = stand ? (getMunicipio(stand.municipioId)?.nombre ?? stand.municipioId) : '';

  if (!autenticado) return <PinScreen onSuccess={() => setAutenticado(true)} />;

  if (!standId) {
    return (
      <View style={styles.container}>
        <View style={[styles.standSelectHeader, { paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 40) + 12 }]}>
          <TouchableOpacity style={styles.pinBackBtn} onPress={() => navigate('home')}>
            <Text style={styles.pinBackText}>‹ Volver al inicio</Text>
          </TouchableOpacity>
          <Text style={styles.standSelectLogo}>☕</Text>
          <Text style={styles.standSelectTitle}>SELECCIONA TU STAND</Text>
          <Text style={styles.standSelectSub}>Elige el stand que vas a operar hoy</Text>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 12 }}>
          {STANDS.map(s => {
            const mun = getMunicipio(s.municipioId);
            return (
              <TouchableOpacity key={s.id} style={styles.standCard} onPress={() => setStandId(s.id)}>
                <View style={styles.standCardLeft}>
                  <Text style={styles.standCardNum}>#{s.id.replace('s', '')}</Text>
                  <View>
                    <Text style={styles.standCardName}>{s.nombre}</Text>
                    <Text style={styles.standCardMun}>{mun?.emoji} {mun?.nombre ?? s.municipioId}</Text>
                  </View>
                </View>
                <Text style={styles.standCardArrow}>›</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  const handleScan = (cedula: string) => {
    setScannerVisible(false);
    setCedulaEscaneada(cedula);
    setTimeout(() => setRegistroVisible(true), 300);
  };

  const handleConfirmarCompra = (monto: number) => {
    if (!cedulaEscaneada || !stand) return;
    const clienteInfo = CLIENTES_MOCK[cedulaEscaneada] ?? { nombre: 'Visitante', nivel: 'Visitante', puntos: 0 };
    const puntos = Math.floor(monto / 1000);
    const sello  = monto >= 50000;

    const nueva: TransaccionLocal = {
      id: `T${Date.now()}`,
      cedulaCliente: cedulaEscaneada,
      nombreCliente: clienteInfo.nombre,
      monto, puntos, selloOtorgado: sello,
      hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      fecha: 'Hoy',
    };
    setTransacciones(prev => [nueva, ...prev]);

    if (cedulaEscaneada === state.usuario?.cedula) {
      dispatch({ type: 'SUMAR_PUNTOS', payload: puntos });
      if (sello) {
        dispatch({ type: 'ACUNAR_SELLO', payload: standMunNombre });
      }
      dispatch({
        type: 'AGREGAR_TRANSACCION',
        payload: {
          id:            nueva.id,
          tipo:          'compra_stand',
          standId:       stand.id,
          standNombre:   stand.nombre,
          municipioId:   stand.municipioId,
          puntos,
          monto,
          selloOtorgado: sello,
          fecha:         new Date().toISOString(),
          descripcion:   `Compra en ${stand.nombre} — ${standMunNombre}`,
        },
      });
    }

    setRegistroVisible(false);
    setSuccessData({ nombre: clienteInfo.nombre, monto, puntos, sello, municipio: standMunNombre });
    setSuccessVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 32) + 12 }]}>
        <TouchableOpacity onPress={() => setStandId(null)} style={styles.headerBack}>
          <Text style={styles.headerBackText}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerRole}>MODO VENDEDOR</Text>
          <Text style={styles.headerStand}>{stand?.nombre ?? 'Stand'}</Text>
        </View>
        <View style={styles.headerMunBadge}>
          <Text style={styles.headerMunText}>{standMunNombre}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { flex: 1.4 }]}>
            <Text style={styles.statNum}>${totalTurno.toLocaleString('es-CO')}</Text>
            <Text style={styles.statLabel}>VENTAS HOY</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{ventasTurno}</Text>
            <Text style={styles.statLabel}>CLIENTES</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#4CAF50' }]}>{sellosTurno}</Text>
            <Text style={styles.statLabel}>SELLOS</Text>
          </View>
        </View>

        <View style={styles.scanSection}>
          <TouchableOpacity style={styles.scanBtn} onPress={() => setScannerVisible(true)} activeOpacity={0.85}>
            <Text style={styles.scanBtnIcon}>📷</Text>
            <Text style={styles.scanBtnTitle}>ESCANEAR QR DEL CLIENTE</Text>
            <Text style={styles.scanBtnSub}>Toca para abrir la cámara</Text>
          </TouchableOpacity>
        </View>

        {stand && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MI STAND</Text>
            <View style={styles.standInfoCard}>
              <View style={styles.standInfoRow}>
                <Text style={styles.standInfoIcon}>📍</Text>
                <Text style={styles.standInfoText}>Pabellón principal · Stand {stand.id.replace('s','#')}</Text>
              </View>
              <View style={styles.standInfoRow}>
                <Text style={styles.standInfoIcon}>☕</Text>
                <Text style={styles.standInfoText}>{stand.productos.join(' · ')}</Text>
              </View>
              <View style={styles.standInfoRow}>
                <Text style={styles.standInfoIcon}>💰</Text>
                <Text style={styles.standInfoText}>Sello desde $50.000 · 1 pto por cada $1.000</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>HISTORIAL DEL TURNO</Text>
            <Text style={styles.sectionCount}>{transacciones.length} registros</Text>
          </View>
          {transacciones.map(t => (
            <View key={t.id} style={styles.transCard}>
              <View style={styles.transAvatarBox}>
                <Text style={styles.transAvatarText}>{t.nombreCliente[0]?.toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.transNombre}>{t.nombreCliente}</Text>
                <Text style={styles.transCed}>CC {t.cedulaCliente}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.transMonto}>${t.monto.toLocaleString('es-CO')}</Text>
                <View style={styles.transMetaRow}>
                  <Text style={styles.transHora}>{t.hora}</Text>
                  {t.selloOtorgado && (
                    <View style={styles.transSelloBadge}>
                      <Text style={styles.transSelloText}>🔵 SELLO</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.transPuntos, { color: C.goldLight }]}>+{t.puntos} pts</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <ScannerModal visible={scannerVisible} onClose={() => setScannerVisible(false)} onScan={handleScan} />
      {cedulaEscaneada && (
        <RegistroModal
          visible={registroVisible}
          cedula={cedulaEscaneada}
          standMunicipio={standMunNombre}
          onClose={() => setRegistroVisible(false)}
          onConfirm={handleConfirmarCompra}
        />
      )}
      <SuccessModal visible={successVisible} data={successData} onClose={() => setSuccessVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  pinContainer: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  pinBackBtn:   { position: 'absolute', top: Platform.OS === 'ios' ? 56 : 40, left: 20 },
  pinBackText:  { color: C.gold, fontSize: 14, fontWeight: '600' },
  pinHeader:    { alignItems: 'center', marginBottom: 40 },
  pinLogo:      { fontSize: 52, marginBottom: 12 },
  pinTitle:     { color: C.gold, fontSize: 20, fontWeight: '800', letterSpacing: 4, textAlign: 'center' },
  pinSub:       { color: C.muted, fontSize: 13, marginTop: 6, letterSpacing: 1 },
  pinDotsRow:   { flexDirection: 'row', gap: 16, marginBottom: 12 },
  pinDot:       { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: C.gold + '80', backgroundColor: 'transparent' },
  pinDotFilled: { backgroundColor: C.gold, borderColor: C.gold },
  pinDotError:  { borderColor: '#FF4444', backgroundColor: '#FF4444' },
  pinError:     { color: '#FF6666', fontSize: 12, marginBottom: 8, letterSpacing: 0.5 },
  pinGrid:      { flexDirection: 'row', flexWrap: 'wrap', width: 240, gap: 12, marginTop: 16, justifyContent: 'center' },
  pinKey:       { width: 64, height: 64, borderRadius: 32, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.gold + '30' },
  pinKeyText:   { color: C.text, fontSize: 22, fontWeight: '600' },
  pinHint:      { color: C.muted, fontSize: 11, marginTop: 28, letterSpacing: 0.5 },

  standSelectHeader: { alignItems: 'center', paddingBottom: 24, paddingHorizontal: 20 },
  standSelectLogo:   { fontSize: 42, marginBottom: 10, marginTop: 8 },
  standSelectTitle:  { color: C.gold, fontSize: 18, fontWeight: '800', letterSpacing: 3 },
  standSelectSub:    { color: C.muted, fontSize: 13, marginTop: 6 },

  standCard:     { backgroundColor: C.card, borderRadius: 14, padding: 18, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.gold + '25', marginBottom: 10 },
  standCardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  standCardNum:  { color: C.gold, fontSize: 18, fontWeight: '800', width: 36 },
  standCardName: { color: C.text, fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  standCardMun:  { color: C.muted, fontSize: 12, marginTop: 2 },
  standCardArrow:{ color: C.gold, fontSize: 28, fontWeight: '300' },

  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.gold + '20', backgroundColor: C.card },
  headerBack:    { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  headerBackText:{ color: C.gold, fontSize: 28, lineHeight: 30 },
  headerRole:    { color: C.gold, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  headerStand:   { color: C.text, fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  headerMunBadge:{ backgroundColor: C.gold + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: C.gold + '40' },
  headerMunText: { color: C.goldLight, fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  statsRow:  { flexDirection: 'row', margin: 16, gap: 10 },
  statBox:   { flex: 1, backgroundColor: C.card, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.gold + '20' },
  statNum:   { color: C.gold, fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  statLabel: { color: C.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1.5, marginTop: 3, textAlign: 'center' },

  scanSection: { paddingHorizontal: 16, marginBottom: 20 },
  scanBtn:     { backgroundColor: C.gold, borderRadius: 18, paddingVertical: 24, alignItems: 'center', shadowColor: C.gold, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10 },
  scanBtnIcon: { fontSize: 36, marginBottom: 6 },
  scanBtnTitle:{ color: '#1A0F00', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  scanBtnSub:  { color: '#1A0F00AA', fontSize: 12, marginTop: 4 },

  section:          { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle:     { color: C.gold, fontSize: 10, fontWeight: '800', letterSpacing: 2.5, marginBottom: 12 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionCount:     { color: C.muted, fontSize: 11 },

  standInfoCard: { backgroundColor: C.card, borderRadius: 14, padding: 16, gap: 12, borderWidth: 1, borderColor: C.gold + '20' },
  standInfoRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  standInfoIcon: { fontSize: 18, width: 28, textAlign: 'center' },
  standInfoText: { color: C.muted, fontSize: 13, flex: 1, lineHeight: 18 },

  transCard:       { backgroundColor: C.card, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8, borderWidth: 1, borderColor: C.gold + '18' },
  transAvatarBox:  { width: 40, height: 40, borderRadius: 20, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: C.gold + '40' },
  transAvatarText: { color: C.gold, fontSize: 16, fontWeight: '800' },
  transNombre:     { color: C.text, fontSize: 13, fontWeight: '700' },
  transCed:        { color: C.muted, fontSize: 11, marginTop: 1 },
  transMonto:      { color: C.text, fontSize: 14, fontWeight: '800' },
  transMetaRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  transHora:       { color: C.muted, fontSize: 10 },
  transSelloBadge: { backgroundColor: '#1E3A1E', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  transSelloText:  { color: '#4CAF50', fontSize: 9, fontWeight: '700' },
  transPuntos:     { fontSize: 11, fontWeight: '700', marginTop: 2 },

  modalOverlay: { flex: 1, backgroundColor: '#00000085', justifyContent: 'flex-end' },

  scannerContainer:    { backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, borderTopWidth: 1, borderColor: C.gold + '30' },
  scannerHeader:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  scannerTitle:        { color: C.gold, fontSize: 13, fontWeight: '800', letterSpacing: 2.5 },
  scannerCloseBtn:     { width: 30, height: 30, borderRadius: 15, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center' },
  scannerCloseText:    { color: C.muted, fontSize: 14 },
  scannerViewfinder:   { width: 200, height: 200, alignSelf: 'center', marginBottom: 16, position: 'relative', backgroundColor: '#000000A0', borderRadius: 8, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  scanLine:            { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: C.gold, shadowColor: C.gold, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 6 },
  scannerCornerTL:     { position: 'absolute', top: 8,    left: 8,   width: 24, height: 24, borderTopWidth: 3,    borderLeftWidth: 3,  borderColor: C.gold },
  scannerCornerTR:     { position: 'absolute', top: 8,    right: 8,  width: 24, height: 24, borderTopWidth: 3,    borderRightWidth: 3, borderColor: C.gold },
  scannerCornerBL:     { position: 'absolute', bottom: 8, left: 8,   width: 24, height: 24, borderBottomWidth: 3, borderLeftWidth: 3,  borderColor: C.gold },
  scannerCornerBR:     { position: 'absolute', bottom: 8, right: 8,  width: 24, height: 24, borderBottomWidth: 3, borderRightWidth: 3, borderColor: C.gold },
  scannerQRIcon:       { fontSize: 80, opacity: 0.3 },
  scannerInstructions: { color: C.muted, fontSize: 12, textAlign: 'center', marginBottom: 12 },
  scannerDemoLabel:    { color: C.muted, fontSize: 11, textAlign: 'center', marginBottom: 10, letterSpacing: 1 },
  scannerDemoBtn:      { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card2, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.gold + '25' },
  scannerDemoBtnIcon:  { fontSize: 22 },
  scannerDemoBtnName:  { color: C.text, fontSize: 14, fontWeight: '600' },
  scannerDemoBtnCed:   { color: C.muted, fontSize: 11, marginTop: 2 },

  regContainer:   { backgroundColor: C.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, borderTopWidth: 1, borderColor: C.gold + '30', gap: 16 },
  regClientHeader:{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.card, borderRadius: 14, padding: 14 },
  regAvatar:      { width: 48, height: 48, borderRadius: 24, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.gold + '50' },
  regAvatarText:  { color: C.goldLight, fontSize: 20, fontWeight: '800' },
  regClientName:  { color: C.text, fontSize: 15, fontWeight: '800' },
  regClientCed:   { color: C.muted, fontSize: 11, marginTop: 2 },
  regNivelBadge:  { backgroundColor: C.gold + '20', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 4 },
  regNivelText:   { color: C.goldLight, fontSize: 11, fontWeight: '700' },
  regPuntosBox:   { alignItems: 'center' },
  regPuntosNum:   { color: C.goldLight, fontSize: 24, fontWeight: '900' },
  regPuntosLabel: { color: C.muted, fontSize: 10, letterSpacing: 1 },

  regFieldLabel:   { color: C.gold, fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: -8 },
  regInputRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 14, borderWidth: 1.5, borderColor: C.gold + '40', paddingHorizontal: 16, paddingVertical: 10 },
  regCurrencySymbol:{ color: C.goldLight, fontSize: 22, fontWeight: '700', marginRight: 6 },
  regInput:        { flex: 1, color: C.text, fontSize: 28, fontWeight: '800' },
  regCOPLabel:     { color: C.muted, fontSize: 13, fontWeight: '600' },

  regPreviewCard:  { backgroundColor: C.card, borderRadius: 14, padding: 14, gap: 10, borderWidth: 1, borderColor: C.gold + '20' },
  regPreviewTitle: { color: C.gold, fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  regPreviewRow:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  regPreviewIcon:  { fontSize: 16, width: 24, textAlign: 'center' },
  regPreviewLabel: { color: C.muted, fontSize: 13, flex: 1 },
  regPreviewVal:   { fontSize: 13, fontWeight: '700' },

  selloBanner:     { backgroundColor: '#1E3A1E', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2E6020' },
  selloBannerText: { color: '#7ED348', fontSize: 13, fontWeight: '700' },

  regActions:      { flexDirection: 'row', gap: 12, marginTop: 4 },
  regCancelBtn:    { flex: 1, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: C.muted + '40', alignItems: 'center' },
  regCancelText:   { color: C.muted, fontSize: 14, fontWeight: '600' },
  regConfirmBtn:   { flex: 2, padding: 16, borderRadius: 14, backgroundColor: C.gold, alignItems: 'center' },
  regConfirmText:  { color: '#1A0F00', fontSize: 15, fontWeight: '900', letterSpacing: 1 },

  successBox:      { backgroundColor: C.card, borderRadius: 24, padding: 28, margin: 32, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: C.gold + '40' },
  successIcon:     { fontSize: 56 },
  successTitle:    { color: C.goldLight, fontSize: 17, fontWeight: '900', letterSpacing: 2 },
  successCliente:  { color: C.text, fontSize: 15, fontWeight: '600' },
  successStats:    { flexDirection: 'row', gap: 8, alignItems: 'center', marginVertical: 8 },
  successStat:     { alignItems: 'center', minWidth: 64 },
  successStatNum:  { color: C.text, fontSize: 22, fontWeight: '900' },
  successStatLabel:{ color: C.muted, fontSize: 10, letterSpacing: 1 },
  successStatDivider: { width: 1, height: 40, backgroundColor: C.gold + '30' },
  successBtn:      { backgroundColor: C.gold, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14, marginTop: 6 },
  successBtnText:  { color: '#1A0F00', fontSize: 14, fontWeight: '900', letterSpacing: 1.5 },
});
