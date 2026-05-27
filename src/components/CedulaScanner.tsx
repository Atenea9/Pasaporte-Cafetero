import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  Platform, Animated, Easing,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export interface ScannedData {
  cedula: string;
  nombre: string;
  pais: string;
  estado: string;
  ciudad: string;
}

const DEMO_PROFILES: ScannedData[] = [
  { cedula: '1107654321', nombre: 'Carlos Andrés Rojas',       pais: 'Colombia',  estado: 'Tolima',          ciudad: 'Chaparral'   },
  { cedula: '1094876543', nombre: 'Valentina Torres Ospina',   pais: 'Colombia',  estado: 'Cundinamarca',    ciudad: 'Bogotá'      },
  { cedula: '79345678',   nombre: 'Jorge Iván Molina Cárdenas',pais: 'Colombia',  estado: 'Antioquia',       ciudad: 'Medellín'    },
  { cedula: '52891034',   nombre: 'Paola Andrea Gómez',        pais: 'Colombia',  estado: 'Valle del Cauca', ciudad: 'Cali'        },
  { cedula: '1006234789', nombre: 'Sebastián López Herrera',   pais: 'Colombia',  estado: 'Huila',           ciudad: 'Neiva'       },
  { cedula: 'X-8934512',  nombre: 'James Alexander Whitfield', pais: 'Estados Unidos', estado: 'New York',   ciudad: 'Brooklyn'    },
  { cedula: 'A-2341897',  nombre: 'María José Fernández',      pais: 'España',    estado: 'Cataluña',        ciudad: 'Barcelona'   },
  { cedula: 'DE-44512',   nombre: 'Hans Müller',               pais: 'Alemania',  estado: 'Bavaria',         ciudad: 'Múnich'      },
  { cedula: 'BR-99341',   nombre: 'Ana Paula Carvalho',        pais: 'Brasil',    estado: 'São Paulo',       ciudad: 'São Paulo'   },
  { cedula: 'JP-33412',   nombre: 'Kenji Nakamura',            pais: 'Japón',     estado: 'Tokio',           ciudad: 'Shinjuku'    },
];

const C = {
  bg: '#040D03', gold: '#CFA020', goldLight: '#EAC040',
  muted: '#6A8060', text: '#F3EED6', green: '#142210',
};

interface Props {
  visible: boolean;
  onScanned: (data: ScannedData) => void;
  onClose: () => void;
}

export default function CedulaScanner({ visible, onScanned, onClose }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<'camera' | 'processing' | 'done'>('camera');
  const scanLine = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) { setPhase('camera'); return; }
    if (Platform.OS !== 'web' && permission && !permission.granted) {
      requestPermission();
    }
    startScanAnimation();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    startScanAnimation();
  }, [phase]);

  const startScanAnimation = () => {
    if (phase === 'camera') {
      scanLine.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLine, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
          Animated.timing(scanLine, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        ])
      ).start();
    }
    if (phase === 'processing') {
      progressAnim.setValue(0);
      Animated.timing(progressAnim, { toValue: 1, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 400, useNativeDriver: true }),
        ])
      ).start();
    }
  };

  const handleSimulatedScan = () => {
    setPhase('processing');
    const profile = DEMO_PROFILES[Math.floor(Math.random() * DEMO_PROFILES.length)];
    setTimeout(() => {
      setPhase('done');
      setTimeout(() => {
        onScanned(profile);
        onClose();
        setPhase('camera');
      }, 700);
    }, 1800);
  };

  const scanLineY = scanLine.interpolate({ inputRange: [0, 1], outputRange: [0, 220] });
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  const renderBody = () => {
    if (phase === 'processing' || phase === 'done') {
      return (
        <View style={s.processingBox}>
          <Animated.Text style={[s.processingIcon, { transform: [{ scale: pulseAnim }] }]}>
            {phase === 'done' ? '✅' : '🪪'}
          </Animated.Text>
          <Text style={s.processingTitle}>
            {phase === 'done' ? '¡CÉDULA LEÍDA!' : 'PROCESANDO DOCUMENTO…'}
          </Text>
          <Text style={s.processingSubtitle}>
            {phase === 'done' ? 'Rellenando datos automáticamente' : 'Extrayendo información personal'}
          </Text>
          {phase === 'processing' && (
            <View style={s.progressTrack}>
              <Animated.View style={[s.progressBar, { width: progressWidth }]} />
            </View>
          )}
          {phase === 'processing' && (
            <View style={s.processingSteps}>
              {['Nombre y apellidos', 'Número de documento', 'País de expedición', 'Lugar de residencia'].map((step, i) => (
                <Text key={i} style={s.processingStep}>· {step}</Text>
              ))}
            </View>
          )}
        </View>
      );
    }

    if (Platform.OS === 'web') {
      return (
        <View style={s.webBody}>
          <View style={s.mockCam}>
            <View style={s.mockCamInner}>
              <View style={s.idCard}>
                <Text style={s.idCardFlag}>🇨🇴</Text>
                <View style={s.idCardLines}>
                  <View style={[s.idLine, { width: '70%' }]} />
                  <View style={[s.idLine, { width: '50%' }]} />
                  <View style={[s.idLine, { width: '60%' }]} />
                </View>
                <Text style={s.idCardLabel}>CÉDULA DE CIUDADANÍA</Text>
              </View>
              <Animated.View style={[s.scanBeam, { top: scanLineY }]} />
            </View>
            <View style={[s.corner, s.tl]} />
            <View style={[s.corner, s.tr]} />
            <View style={[s.corner, s.bl]} />
            <View style={[s.corner, s.br]} />
          </View>
          <Text style={s.webHint}>
            Apunta la cámara al frente de la cédula o documento de identidad
          </Text>
          <TouchableOpacity style={s.scanBtn} onPress={handleSimulatedScan} activeOpacity={0.85}>
            <Text style={s.scanBtnText}>📷  SIMULAR ESCANEO</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={s.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!permission?.granted) {
      return (
        <View style={s.webBody}>
          <Text style={s.webHint}>Se necesita acceso a la cámara para escanear el documento.</Text>
          <TouchableOpacity style={s.scanBtn} onPress={requestPermission} activeOpacity={0.85}>
            <Text style={s.scanBtnText}>Conceder permiso</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={s.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <CameraView style={StyleSheet.absoluteFillObject} facing="back" />
        <View style={s.cameraOverlay}>
          <View style={s.dimTop} />
          <View style={s.middle}>
            <View style={s.dimSide} />
            <View style={s.frame}>
              <View style={[s.corner, s.tl]} />
              <View style={[s.corner, s.tr]} />
              <View style={[s.corner, s.bl]} />
              <View style={[s.corner, s.br]} />
              <Animated.View style={[s.scanBeamNative, { top: scanLineY }]} />
            </View>
            <View style={s.dimSide} />
          </View>
          <View style={s.dimBottom}>
            <Text style={s.nativeHint}>Centra el frente de la cédula en el recuadro</Text>
            <TouchableOpacity style={s.scanBtn} onPress={handleSimulatedScan} activeOpacity={0.85}>
              <Text style={s.scanBtnText}>📷  CAPTURAR DOCUMENTO</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={s.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={s.root}>
        <View style={s.header}>
          <Text style={s.headerTitle}>ESCANEAR DOCUMENTO</Text>
          <Text style={s.headerSub}>Cédula · Pasaporte · DNI · ID</Text>
        </View>
        {renderBody()}
      </View>
    </Modal>
  );
}

const FRAME = 230;
const BORDER = 3;
const CORNER_SZ = 26;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: 24, backgroundColor: C.green, borderBottomWidth: 0.5, borderBottomColor: C.gold + '40' },
  headerTitle: { fontSize: 14, fontWeight: '900', color: C.gold, letterSpacing: 2.5 },
  headerSub: { fontSize: 10, color: C.muted, marginTop: 2, letterSpacing: 1 },

  processingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 14 },
  processingIcon: { fontSize: 72 },
  processingTitle: { fontSize: 18, fontWeight: '900', color: C.goldLight, letterSpacing: 1, textAlign: 'center' },
  processingSubtitle: { fontSize: 12, color: C.muted, textAlign: 'center' },
  progressTrack: { width: '80%', height: 4, backgroundColor: C.green, borderRadius: 2, overflow: 'hidden', marginTop: 8 },
  progressBar: { height: '100%', backgroundColor: C.gold, borderRadius: 2 },
  processingSteps: { gap: 5, marginTop: 8, alignSelf: 'flex-start', paddingHorizontal: 24 },
  processingStep: { fontSize: 11, color: C.muted },

  webBody: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 20 },
  mockCam: { width: FRAME, height: FRAME * 0.65, borderRadius: 12, backgroundColor: '#0A1A08', overflow: 'hidden', position: 'relative', borderWidth: 0.5, borderColor: C.gold + '30' },
  mockCamInner: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  idCard: { width: '80%', aspectRatio: 1.6, backgroundColor: '#1C2E18', borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 0.5, borderColor: C.gold + '50' },
  idCardFlag: { fontSize: 22 },
  idCardLines: { gap: 5, width: '70%' },
  idLine: { height: 5, backgroundColor: C.gold + '30', borderRadius: 2 },
  idCardLabel: { fontSize: 7, color: C.gold + '80', letterSpacing: 1.5, fontWeight: '700' },
  scanBeam: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: C.gold, opacity: 0.85, shadowColor: C.gold, shadowRadius: 8, shadowOpacity: 1 },
  webHint: { fontSize: 12, color: C.muted, textAlign: 'center', lineHeight: 18 },

  cameraOverlay: { ...StyleSheet.absoluteFillObject, flexDirection: 'column' },
  dimTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  middle: { height: FRAME * 0.65, flexDirection: 'row' },
  dimSide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  frame: { width: FRAME, height: FRAME * 0.65, overflow: 'hidden', position: 'relative' },
  scanBeamNative: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: C.gold, opacity: 0.9 },
  dimBottom: { flex: 1.5, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', gap: 16 },
  nativeHint: { color: C.text, fontSize: 13, textAlign: 'center', paddingHorizontal: 32 },

  corner: { position: 'absolute', width: CORNER_SZ, height: CORNER_SZ, borderColor: C.gold },
  tl: { top: 0, left: 0, borderTopWidth: BORDER, borderLeftWidth: BORDER },
  tr: { top: 0, right: 0, borderTopWidth: BORDER, borderRightWidth: BORDER },
  bl: { bottom: 0, left: 0, borderBottomWidth: BORDER, borderLeftWidth: BORDER },
  br: { bottom: 0, right: 0, borderBottomWidth: BORDER, borderRightWidth: BORDER },

  scanBtn: { backgroundColor: C.gold, borderRadius: 30, paddingVertical: 15, paddingHorizontal: 32, alignItems: 'center' },
  scanBtnText: { fontSize: 13, fontWeight: '900', color: C.bg, letterSpacing: 0.5 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 24 },
  cancelBtnText: { fontSize: 13, color: C.muted, fontWeight: '600' },
});
