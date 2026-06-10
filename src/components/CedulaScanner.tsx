/**
 * CedulaScanner — Real OCR document scanner
 * Web:    getUserMedia camera + crop-to-card + Tesseract.js / Gemini OCR
 * Native: expo-camera capture + Tesseract.js OCR
 *
 * Parses: Colombian cédulas (APELLIDOS/NOMBRES layout),
 *         international passports (MRZ format).
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  Platform, Animated, Easing, TextInput, ScrollView,
  LayoutChangeEvent,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Tesseract from 'tesseract.js';

// ── Constants ────────────────────────────────────────────────────────────────

// ID card (CR80) aspect ratio: 85.6 × 54 mm → ~1.585:1
const FRAME_W   = 280;
const FRAME_H   = Math.round(FRAME_W / 1.585); // ≈ 177
const BOX_H     = 310;
const CORNER_SZ = 28;
const BORDER    = 3;

// ── Types ────────────────────────────────────────────────────────────────────

export interface ScannedData {
  cedula: string;
  nombre: string;
  pais:   string;
  estado: string;
  ciudad: string;
}

type Phase = 'idle' | 'camera' | 'capture' | 'processing' | 'confirm' | 'done' | 'error';

interface Props {
  visible:   boolean;
  onScanned: (data: ScannedData) => void;
  onClose:   () => void;
}

// ── OCR helpers ──────────────────────────────────────────────────────────────

const MRZ_CODES: Record<string, string> = {
  COL:'Colombia', USA:'Estados Unidos', ESP:'España', DEU:'Alemania',
  BRA:'Brasil',   MEX:'México',        FRA:'Francia', ITA:'Italia',
  JPN:'Japón',    GBR:'Reino Unido',   CAN:'Canadá',  ARG:'Argentina',
  CHL:'Chile',    PER:'Perú',          VEN:'Venezuela',ECU:'Ecuador',
  BOL:'Bolivia',  PRY:'Paraguay',      URY:'Uruguay',  PAN:'Panamá',
  CRI:'Costa Rica',
};

const COUNTRY_KW: [string, string][] = [
  ['REPÚBLICA DE COLOMBIA','Colombia'],['COLOMBIE','Colombia'],['COLOMBIA','Colombia'],
  ['ESPAÑA','España'],['SPAIN','España'],
  ['ALEMANIA','Alemania'],['GERMANY','Alemania'],['BUNDESREPUBLIK','Alemania'],
  ['BRASIL','Brasil'],['BRAZIL','Brasil'],
  ['ESTADOS UNIDOS','Estados Unidos'],['UNITED STATES','Estados Unidos'],
  ['MÉXICO','México'],['MEXICO','México'],
  ['FRANCE','Francia'],['ITALIA','Italia'],['ITALY','Italia'],['JAPÓN','Japón'],
];

function parseOCRText(raw: string): Partial<ScannedData> {
  const text  = raw.toUpperCase();
  const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 1);
  const up    = lines.map(l => l.toUpperCase());
  const res: Partial<ScannedData> = {};

  // ── Document number: 6-12 digit run ─────────────────────────────────────
  const nuipM = text.match(/NUIP\s*:?\s*([\d.]{6,15})/i);
  if (nuipM) {
    res.cedula = nuipM[1].replace(/\./g, '');
  } else {
    const dotNum = text.match(/\b(\d{1,3}(?:\.\d{3}){2,3})\b/);
    if (dotNum) res.cedula = dotNum[1].replace(/\./g, '');
  }
  if (!res.cedula) {
    const docM = text.match(/\b(\d{6,12})\b/);
    if (docM) res.cedula = docM[1];
  }

  // ── Name: APELLIDOS / NOMBRES labels (Colombian cédula) ─────────────────
  const aIdx = up.findIndex(l => /APELLIDOS?/.test(l));
  const nIdx = up.findIndex(l => /^NOMBRES?$/.test(l));
  if (aIdx >= 0 && lines[aIdx + 1]) {
    const ape  = lines[aIdx + 1].trim();
    const nom  = nIdx >= 0 && lines[nIdx + 1] ? lines[nIdx + 1].trim() : '';
    const full = nom ? `${nom} ${ape}` : ape;
    if (full.length > 3) res.nombre = full;
  }

  // ── MRZ parsing (Passport type P or ID card TD1/TD3) ────────────────────
  const mrzRaw = lines.filter(l => /^[A-Z0-9<\s]{28,}$/.test(l));
  const mrz    = mrzRaw.map(l => l.replace(/\s/g, ''));
  if (mrz.length >= 2) {
    const m1 = mrz[0];
    const m2 = mrz[1];
    if (m1.startsWith('P<') && m1.length >= 44) {
      const cc        = m1.slice(2, 5);
      const namePt    = m1.slice(5).split('<<');
      const lastName  = namePt[0]?.replace(/<+/g, ' ').trim();
      const firstName = namePt.slice(1).join(' ').replace(/<+/g, ' ').trim();
      if (firstName && lastName && !res.nombre) res.nombre = `${firstName} ${lastName}`;
      if (MRZ_CODES[cc]) res.pais = MRZ_CODES[cc];
      if (m2.length >= 9 && !res.cedula) res.cedula = m2.slice(0, 9).replace(/<+/g, '');
    } else if (m1.length >= 30) {
      const nameLine = mrz.find(l => l.includes('<<'));
      if (nameLine && !res.nombre) {
        const parts     = nameLine.split('<<');
        const lastName  = parts[0]?.replace(/<+/g, ' ').trim();
        const firstName = parts[1]?.replace(/<+/g, ' ').trim();
        if (firstName && lastName) res.nombre = `${firstName} ${lastName}`;
      }
      if (!res.cedula) {
        const numM = m1.match(/\d{7,9}/);
        if (numM) res.cedula = numM[0];
      }
    }
  }

  // ── Country from text ────────────────────────────────────────────────────
  if (!res.pais) {
    for (const [kw, country] of COUNTRY_KW) {
      if (text.includes(kw)) { res.pais = country; break; }
    }
    if (!res.pais) res.pais = 'Colombia';
  }

  return res;
}

// ── Colors ───────────────────────────────────────────────────────────────────

const C = {
  bg:        '#040D03',
  gold:      '#CFA020',
  goldLight: '#EAC040',
  muted:     '#6A8060',
  text:      '#F3EED6',
  green:     '#142210',
  darkGreen: '#0A1508',
  input:     '#1A2C18',
  border:    '#2A4020',
  red:       '#C0392B',
  success:   '#2ECC71',
  dim:       'rgba(0,0,0,0.68)',
};

// ── Main component ───────────────────────────────────────────────────────────

export default function CedulaScanner({ visible, onScanned, onClose }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [phase,       setPhase]         = useState<Phase>('idle');
  const [progress,    setProgress]      = useState(0);
  const [ocrLog,      setOcrLog]        = useState('Iniciando motor OCR…');
  const [cameraError, setCameraError]   = useState(false);
  const [previewUrl,  setPreviewUrl]    = useState<string | null>(null);
  const [uploadFile,  setUploadFile]    = useState<File | null>(null);
  const [boxWidth,    setBoxWidth]      = useState(340);

  const [fc, setFc] = useState<ScannedData>({
    cedula: '', nombre: '', pais: 'Colombia', estado: '', ciudad: '',
  });

  const scanLine     = useRef(new Animated.Value(0)).current;
  const pulseAnim    = useRef(new Animated.Value(1)).current;
  const cornerPulse  = useRef(new Animated.Value(1)).current;

  const webVideoRef  = useRef<HTMLVideoElement  | null>(null);
  const webCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement  | null>(null);
  const streamRef    = useRef<MediaStream      | null>(null);

  // Scan-line animation
  useEffect(() => {
    if (phase === 'camera' || phase === 'idle') {
      scanLine.setValue(0);
      Animated.loop(Animated.sequence([
        Animated.timing(scanLine, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(scanLine, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])).start();
    }
  }, [phase]);

  // Corner-bracket pulse
  useEffect(() => {
    if (phase === 'camera' || phase === 'idle') {
      Animated.loop(Animated.sequence([
        Animated.timing(cornerPulse, { toValue: 1.04, duration: 700, useNativeDriver: true }),
        Animated.timing(cornerPulse, { toValue: 1,    duration: 700, useNativeDriver: true }),
      ])).start();
    }
  }, [phase]);

  // Pulse for processing
  useEffect(() => {
    if (phase === 'processing') {
      pulseAnim.setValue(1);
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 400, useNativeDriver: true }),
      ])).start();
    }
  }, [phase]);

  // Camera lifecycle on web
  useEffect(() => {
    if (!visible) {
      stopWebCamera();
      setPhase('idle');
      setPreviewUrl(null);
      setUploadFile(null);
      setCameraError(false);
      setProgress(0);
      return;
    }
    if (Platform.OS === 'web' && visible) startWebCamera();
  }, [visible]);

  // Native permission
  useEffect(() => {
    if (Platform.OS !== 'web' && permission && !permission.granted && visible) {
      requestPermission();
    }
  }, [visible, permission]);

  // ── Web camera ─────────────────────────────────────────────────────────────
  const startWebCamera = async () => {
    setCameraError(false);
    try {
      const stream = await (navigator.mediaDevices as any).getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      // Retry assigning the stream until the video element is mounted in the DOM
      let attempts = 0;
      const tryAssign = () => {
        if (webVideoRef.current) {
          (webVideoRef.current as any).srcObject = stream;
          (webVideoRef.current as any).play().catch(() => {});
        } else if (attempts++ < 40) {
          setTimeout(tryAssign, 50);
        }
      };
      tryAssign();
      setPhase('camera');
    } catch {
      setCameraError(true);
      setPhase('idle');
    }
  };

  const stopWebCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  // ── Capture & crop to card area ────────────────────────────────────────────
  const captureAndOCR = async () => {
    if (!webVideoRef.current || !webCanvasRef.current) return;
    const video  = webVideoRef.current as any;
    const canvas = webCanvasRef.current as any;

    const vW = video.videoWidth  || 1280;
    const vH = video.videoHeight || 720;

    // The cameraBox renders at boxWidth × BOX_H on screen.
    // The video uses objectFit:cover → we compute the cover scale and offset.
    const scaleX = boxWidth / vW;
    const scaleY = BOX_H   / vH;
    const scale  = Math.max(scaleX, scaleY); // cover scale

    // Amount of video "hidden" on each side (in video-pixel space)
    const rendW = vW * scale;
    const rendH = vH * scale;
    const hidX  = (rendW - boxWidth) / 2 / scale; // video px hidden left
    const hidY  = (rendH - BOX_H)   / 2 / scale;  // video px hidden top

    // Card frame center position in box-pixel space
    const frameLeft = (boxWidth - FRAME_W) / 2;
    const frameTop  = (BOX_H   - FRAME_H) / 2;

    // Convert box-px to video-px
    const cropX = hidX + frameLeft  / scale;
    const cropY = hidY + frameTop   / scale;
    const cropW = FRAME_W / scale;
    const cropH = FRAME_H / scale;

    // Crop to card area at 3× resolution — NO filters here.
    // scanDocument → preprocessImage applies binarization + contrast exactly once.
    const OUT_SCALE = 3;
    canvas.width  = Math.round(cropW * OUT_SCALE);
    canvas.height = Math.round(cropH * OUT_SCALE);
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled  = true;
    ctx.imageSmoothingQuality  = 'high';
    ctx.drawImage(
      video,
      cropX, cropY, cropW, cropH,
      0, 0, canvas.width, canvas.height,
    );

    // Show a preview of what was captured (JPEG for display only — not sent to OCR)
    const previewDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPreviewUrl(previewDataUrl);

    stopWebCamera();
    await runOCR(canvas);
  };

  // ── OCR on uploaded file ───────────────────────────────────────────────────
  const handleFileChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    setUploadFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // ── Run Tesseract ──────────────────────────────────────────────────────────
  const runOCR = async (source: HTMLCanvasElement | File) => {
    setPhase('processing');
    setProgress(0);
    try {
      const { data: { text } } = await Tesseract.recognize(
        source as any,
        'spa+eng',
        {
          logger: (m: any) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
              setOcrLog('Leyendo documento…');
            } else if (m.status === 'loading tesseract core') {
              setOcrLog('Cargando motor OCR…');
            } else if (m.status === 'initializing tesseract') {
              setOcrLog('Iniciando Tesseract…');
            } else if (m.status === 'loading language traineddata') {
              setOcrLog('Descargando modelos de idioma…');
            }
          },
        } as any,
      );

      const parsed = parseOCRText(text);
      setFc({
        cedula: parsed.cedula ?? '',
        nombre: parsed.nombre ?? '',
        pais:   parsed.pais   ?? 'Colombia',
        estado: parsed.estado ?? '',
        ciudad: parsed.ciudad ?? '',
      });
      setPhase('confirm');
    } catch {
      setPhase('error');
    }
  };

  // ── Confirm ───────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    setPhase('done');
    setTimeout(() => {
      onScanned(fc);
      onClose();
      setPhase('idle');
    }, 600);
  };

  // ── Interpolations ────────────────────────────────────────────────────────
  const scanLineY = scanLine.interpolate({
    inputRange: [0, 1],
    outputRange: [0, FRAME_H - 2],
  });

  // ── Render ────────────────────────────────────────────────────────────────
  const renderBody = () => {

    if (phase === 'processing') {
      return (
        <View style={s.centeredBox}>
          <Animated.Text style={[s.bigIcon, { transform: [{ scale: pulseAnim }] }]}>
            🪪
          </Animated.Text>
          <Text style={s.procTitle}>ANALIZANDO DOCUMENTO</Text>
          <Text style={s.procSub}>{ocrLog}</Text>
          <View style={s.progressTrack}>
            <View style={[s.progressBar, { width: `${progress}%` as any }]} />
          </View>
          <Text style={s.progressPct}>{progress}%</Text>
          <View style={s.stepList}>
            {['Detección de texto', 'Extracción de nombre', 'Número de documento', 'País de expedición'].map((step, i) => (
              <View key={i} style={s.stepRow}>
                <Text style={[s.stepDot, progress > i * 25 && { color: C.success }]}>
                  {progress > i * 25 ? '✓' : '·'}
                </Text>
                <Text style={s.stepTxt}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }

    if (phase === 'done') {
      return (
        <View style={s.centeredBox}>
          <Text style={s.bigIcon}>✅</Text>
          <Text style={s.procTitle}>¡DATOS EXTRAÍDOS!</Text>
          <Text style={s.procSub}>Rellenando formulario…</Text>
        </View>
      );
    }

    if (phase === 'error') {
      return (
        <View style={s.centeredBox}>
          <Text style={s.bigIcon}>⚠️</Text>
          <Text style={s.procTitle}>NO SE PUDO LEER</Text>
          <Text style={s.procSub}>
            Asegúrate de que la cédula quede completamente dentro del recuadro y con buena iluminación.{'\n'}
            También puedes subir una foto directamente.
          </Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => {
            setPreviewUrl(null);
            setUploadFile(null);
            startWebCamera();
          }}>
            <Text style={s.retryBtnTxt}>🔄 INTENTAR DE NUEVO</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
            <Text style={s.cancelBtnTxt}>Ingresar manualmente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (phase === 'confirm') {
      return (
        <ScrollView contentContainerStyle={s.confirmBox} keyboardShouldPersistTaps="handled">
          <View style={s.confirmHeader}>
            <Text style={s.confirmIcon}>✅</Text>
            <View>
              <Text style={s.confirmTitle}>DATOS EXTRAÍDOS</Text>
              <Text style={s.confirmSub}>Revisa y corrige si es necesario</Text>
            </View>
          </View>
          {([
            { key: 'cedula', label: 'NÚMERO DE DOCUMENTO', placeholder: 'Ej: 1107654321', kbType: 'numeric' },
            { key: 'nombre', label: 'NOMBRE COMPLETO',      placeholder: 'Nombre y apellidos', kbType: 'default' },
            { key: 'pais',   label: 'PAÍS',                 placeholder: 'Colombia',           kbType: 'default' },
            { key: 'estado', label: 'DEPARTAMENTO / ESTADO',placeholder: 'Tolima',             kbType: 'default' },
            { key: 'ciudad', label: 'CIUDAD',               placeholder: 'Chaparral',          kbType: 'default' },
          ] as const).map(f => (
            <View key={f.key} style={s.fieldWrap}>
              <Text style={s.fieldLabel}>{f.label}</Text>
              <TextInput
                style={[s.fieldInput, !fc[f.key] && s.fieldInputEmpty]}
                value={fc[f.key]}
                onChangeText={v => setFc(prev => ({ ...prev, [f.key]: v }))}
                placeholder={f.placeholder}
                placeholderTextColor={C.muted}
                keyboardType={f.kbType === 'numeric' ? 'numeric' : 'default'}
              />
              {!fc[f.key] && (
                <Text style={s.fieldWarning}>⚠ No detectado — ingresa manualmente</Text>
              )}
            </View>
          ))}
          <TouchableOpacity style={s.confirmBtn} onPress={handleConfirm}>
            <Text style={s.confirmBtnTxt}>✓  CONFIRMAR DATOS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.rescanBtn} onPress={() => {
            setPreviewUrl(null);
            setUploadFile(null);
            startWebCamera();
          }}>
            <Text style={s.rescanBtnTxt}>🔄 Volver a escanear</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }

    // ── Web: camera + upload ─────────────────────────────────────────────────
    if (Platform.OS === 'web') {
      return (
        <ScrollView contentContainerStyle={s.webBody} keyboardShouldPersistTaps="handled">

          {/* @ts-ignore */}
          <canvas ref={webCanvasRef} style={{ display: 'none' }} />
          {/* @ts-ignore */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={handleFileChange as any}
          />

          {/* ── Camera box with silhouette guide ─────────────────────────── */}
          <View
            style={s.cameraBox}
            onLayout={(e: LayoutChangeEvent) => setBoxWidth(e.nativeEvent.layout.width)}
          >
            {/* Live camera feed */}
            {/* @ts-ignore */}
            <video
              ref={webVideoRef}
              playsInline
              autoPlay
              muted
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: (!cameraError && !previewUrl) ? 'block' : 'none',
              } as any}
            />

            {/* Uploaded / captured image preview */}
            {previewUrl && (
              /* @ts-ignore */
              <img
                src={previewUrl}
                style={{
                  position: 'absolute',
                  top: 0, left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                } as any}
              />
            )}

            {/* Camera unavailable */}
            {cameraError && !previewUrl && (
              <View style={s.camErrorBox}>
                <Text style={s.camErrorIcon}>📷</Text>
                <Text style={s.camErrorTxt}>Cámara no disponible</Text>
              </View>
            )}

            {/* ── Card silhouette guide (only while live camera is showing) ── */}
            {!previewUrl && !cameraError && (
              <View style={StyleSheet.absoluteFillObject} pointerEvents="none">

                {/* Top dim */}
                <View style={s.guideTop} />

                {/* Middle row: side dims + card frame */}
                <View style={s.guideMiddle}>
                  <View style={s.guideSide} />

                  {/* Card frame — clear window */}
                  <Animated.View style={[s.cardFrame, { transform: [{ scale: cornerPulse }] }]}>

                    {/* Interior layout hint */}
                    <View style={s.cardInterior} pointerEvents="none">
                      {/* Photo zone (left ~33%) */}
                      <View style={s.photoZone}>
                        <Text style={s.photoIcon}>👤</Text>
                        <Text style={s.photoLabel}>FOTO</Text>
                      </View>
                      {/* Text-fields zone (right ~67%) */}
                      <View style={s.fieldsZone}>
                        <View style={s.fieldLineWide} />
                        <View style={s.fieldLineNarrow} />
                        <View style={s.fieldSpacer} />
                        <View style={s.fieldLineMed} />
                        <View style={s.fieldLineShort} />
                        <View style={s.fieldSpacer} />
                        <View style={s.fieldLineWide} />
                      </View>
                    </View>

                    {/* Animated scan beam */}
                    <Animated.View style={[s.scanBeam, { top: scanLineY }]} />

                    {/* Corner brackets */}
                    <View style={[s.corner, s.tl]} />
                    <View style={[s.corner, s.tr]} />
                    <View style={[s.corner, s.bl]} />
                    <View style={[s.corner, s.br]} />
                  </Animated.View>

                  <View style={s.guideSide} />
                </View>

                {/* Bottom dim with instruction */}
                <View style={s.guideBottom}>
                  <Text style={s.guideArrow}>↑</Text>
                  <Text style={s.guideLabel}>Centra el frente de tu cédula en el recuadro</Text>
                </View>
              </View>
            )}
          </View>

          {/* Hint text below box */}
          <Text style={s.hint}>
            {previewUrl
              ? '✅ Imagen capturada — procesando con OCR…'
              : cameraError
                ? 'La cámara no está disponible. Sube una foto del documento.'
                : 'Mantén el documento quieto, bien iluminado y dentro del recuadro dorado'}
          </Text>

          {/* Action buttons */}
          {!previewUrl ? (
            <>
              {!cameraError && (
                <TouchableOpacity style={s.primaryBtn} onPress={captureAndOCR} activeOpacity={0.85}>
                  <Text style={s.primaryBtnTxt}>📷  CAPTURAR Y ESCANEAR</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[s.secondaryBtn, cameraError && s.primaryBtn]}
                onPress={() => (fileInputRef.current as any)?.click()}
                activeOpacity={0.85}
              >
                <Text style={[s.secondaryBtnTxt, cameraError && { color: C.bg }]}>
                  📤  {cameraError ? 'SUBIR FOTO DEL DOCUMENTO' : 'Subir foto del documento'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={s.primaryBtn}
              onPress={() => uploadFile && runOCR(uploadFile)}
              activeOpacity={0.85}
            >
              <Text style={s.primaryBtnTxt}>🔍  ANALIZAR DOCUMENTO CON OCR</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={s.cancelBtnTxt}>Cancelar — ingresar manualmente</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }

    // ── Native: expo-camera ───────────────────────────────────────────────────
    if (!permission?.granted) {
      return (
        <View style={s.centeredBox}>
          <Text style={s.bigIcon}>📷</Text>
          <Text style={s.procTitle}>PERMISO DE CÁMARA</Text>
          <Text style={s.procSub}>Necesitamos acceso a la cámara para escanear el documento.</Text>
          <TouchableOpacity style={s.primaryBtn} onPress={requestPermission}>
            <Text style={s.primaryBtnTxt}>Conceder permiso</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
            <Text style={s.cancelBtnTxt}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <CameraView style={StyleSheet.absoluteFillObject} facing="back" />

        {/* Native silhouette overlay */}
        <View style={s.nativeOverlay} pointerEvents="box-none">
          <View style={s.dimTop} />
          <View style={s.middleRow}>
            <View style={s.dimSide} />

            {/* Native card frame */}
            <View style={s.nativeFrame}>
              {/* Interior layout hint */}
              <View style={[s.cardInterior, { opacity: 0.35 }]}>
                <View style={s.photoZone}>
                  <Text style={s.photoIcon}>👤</Text>
                  <Text style={[s.photoLabel, { color: C.gold }]}>FOTO</Text>
                </View>
                <View style={s.fieldsZone}>
                  <View style={s.fieldLineWide} />
                  <View style={s.fieldLineNarrow} />
                  <View style={s.fieldSpacer} />
                  <View style={s.fieldLineMed} />
                  <View style={s.fieldLineShort} />
                </View>
              </View>
              {/* Scan beam */}
              <Animated.View style={[s.scanBeam, { top: scanLineY }]} />
              {/* Corners */}
              <View style={[s.corner, s.tl]} />
              <View style={[s.corner, s.tr]} />
              <View style={[s.corner, s.bl]} />
              <View style={[s.corner, s.br]} />
            </View>

            <View style={s.dimSide} />
          </View>
          <View style={s.dimBottom}>
            <Text style={s.guideArrow}>↑</Text>
            <Text style={s.nativeHint}>Centra el frente de tu cédula en el recuadro dorado</Text>
            <TouchableOpacity style={s.primaryBtn} onPress={() => setPhase('processing')} activeOpacity={0.85}>
              <Text style={s.primaryBtnTxt}>📷  CAPTURAR DOCUMENTO</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={s.cancelBtnTxt}>Cancelar</Text>
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
          <View>
            <Text style={s.headerTitle}>ESCANEAR DOCUMENTO</Text>
            <Text style={s.headerSub}>Cédula · Pasaporte · DNI — OCR automático</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <Text style={s.closeBtnTxt}>✕</Text>
          </TouchableOpacity>
        </View>
        {renderBody()}
      </View>
    </Modal>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  header: {
    paddingTop: 52, paddingBottom: 14, paddingHorizontal: 24,
    backgroundColor: C.green,
    borderBottomWidth: 0.5, borderBottomColor: C.gold + '40',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 13, fontWeight: '900', color: C.gold, letterSpacing: 2.5 },
  headerSub:   { fontSize: 9,  color: C.muted, marginTop: 2, letterSpacing: 1 },
  closeBtn:    { padding: 8 },
  closeBtnTxt: { fontSize: 18, color: C.muted, fontWeight: '700' },

  // Processing / done / error
  centeredBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 14 },
  bigIcon:     { fontSize: 72 },
  procTitle:   { fontSize: 17, fontWeight: '900', color: C.goldLight, letterSpacing: 1, textAlign: 'center' },
  procSub:     { fontSize: 12, color: C.muted, textAlign: 'center', lineHeight: 18 },
  progressTrack: { width: '80%', height: 5, backgroundColor: C.green, borderRadius: 3, overflow: 'hidden', marginTop: 8 },
  progressBar:   { height: '100%', backgroundColor: C.gold, borderRadius: 3 },
  progressPct:   { fontSize: 13, fontWeight: '700', color: C.gold },
  stepList:      { gap: 6, alignSelf: 'stretch', paddingHorizontal: 24, marginTop: 6 },
  stepRow:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepDot:       { fontSize: 14, color: C.muted, fontWeight: '900', width: 16 },
  stepTxt:       { fontSize: 11, color: C.muted },

  // Confirm
  confirmBox:    { padding: 20, paddingBottom: 40, gap: 14 },
  confirmHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  confirmIcon:   { fontSize: 36 },
  confirmTitle:  { fontSize: 14, fontWeight: '900', color: C.goldLight, letterSpacing: 1.5 },
  confirmSub:    { fontSize: 11, color: C.muted, marginTop: 2 },
  fieldWrap:     { gap: 4 },
  fieldLabel:    { fontSize: 9, fontWeight: '900', color: C.gold, letterSpacing: 1.5 },
  fieldInput:    { backgroundColor: C.input, borderRadius: 10, padding: 13, fontSize: 14, color: C.text, borderWidth: 1, borderColor: C.border },
  fieldInputEmpty: { borderColor: '#8B4513', borderStyle: 'dashed' as any },
  fieldWarning:    { fontSize: 9, color: '#E8A020', letterSpacing: 0.5 },
  confirmBtn:    { backgroundColor: C.gold, borderRadius: 30, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  confirmBtnTxt: { fontSize: 14, fontWeight: '900', color: C.bg, letterSpacing: 1 },
  rescanBtn:     { alignItems: 'center', paddingVertical: 12 },
  rescanBtnTxt:  { fontSize: 13, color: C.muted, fontWeight: '600' },

  // Web body
  webBody: { paddingHorizontal: 20, paddingVertical: 20, alignItems: 'center', gap: 16 },

  // Camera box
  cameraBox: {
    width: '100%', height: BOX_H,
    borderRadius: 16, overflow: 'hidden',
    backgroundColor: C.darkGreen,
    borderWidth: 1, borderColor: C.gold + '30',
    position: 'relative',
  },

  camErrorBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  camErrorIcon:{ fontSize: 36 },
  camErrorTxt: { fontSize: 12, color: C.muted },

  // ── 4-panel silhouette ─────────────────────────────────────────────────────
  guideTop: {
    backgroundColor: C.dim,
    height: (BOX_H - FRAME_H) / 2,
  },
  guideMiddle: {
    flexDirection: 'row',
    height: FRAME_H,
  },
  guideSide: {
    flex: 1,
    backgroundColor: C.dim,
  },
  guideBottom: {
    flex: 1,
    backgroundColor: C.dim,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 6,
    gap: 2,
  },
  guideArrow: {
    fontSize: 14,
    color: C.gold,
    fontWeight: '900',
  },
  guideLabel: {
    fontSize: 10,
    color: C.text,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
    opacity: 0.9,
  },

  // Card frame (the clear window)
  cardFrame: {
    width: FRAME_W,
    height: FRAME_H,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 6,
  },

  // Interior card layout hint
  cardInterior: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    padding: 8,
    gap: 6,
    opacity: 0.22,
  },
  photoZone: {
    width: '32%',
    borderWidth: 1,
    borderColor: C.gold,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    backgroundColor: C.gold + '10',
  },
  photoIcon:  { fontSize: 22, opacity: 0.7 },
  photoLabel: { fontSize: 7, color: C.text, fontWeight: '700', letterSpacing: 1 },

  fieldsZone: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  fieldLineWide:   { height: 3, backgroundColor: C.gold, borderRadius: 2, width: '90%', opacity: 0.7 },
  fieldLineNarrow: { height: 3, backgroundColor: C.gold, borderRadius: 2, width: '55%', opacity: 0.7 },
  fieldLineMed:    { height: 3, backgroundColor: C.gold, borderRadius: 2, width: '75%', opacity: 0.7 },
  fieldLineShort:  { height: 3, backgroundColor: C.gold, borderRadius: 2, width: '40%', opacity: 0.7 },
  fieldSpacer:     { height: 4 },

  // Scan beam
  scanBeam: {
    position: 'absolute', left: 0, right: 0, height: 2,
    backgroundColor: C.gold, opacity: 0.9,
    shadowColor: C.gold, shadowRadius: 10, shadowOpacity: 1,
  },

  // Corner brackets
  corner: { position: 'absolute', width: CORNER_SZ, height: CORNER_SZ, borderColor: C.gold },
  tl:     { top: 0, left: 0,  borderTopWidth: BORDER,    borderLeftWidth: BORDER  },
  tr:     { top: 0, right: 0, borderTopWidth: BORDER,    borderRightWidth: BORDER },
  bl:     { bottom: 0, left: 0,  borderBottomWidth: BORDER, borderLeftWidth: BORDER  },
  br:     { bottom: 0, right: 0, borderBottomWidth: BORDER, borderRightWidth: BORDER },

  hint: { fontSize: 11, color: C.muted, textAlign: 'center', lineHeight: 17 },

  primaryBtn:    { backgroundColor: C.gold, borderRadius: 30, paddingVertical: 15, paddingHorizontal: 28, alignItems: 'center', alignSelf: 'stretch' },
  primaryBtnTxt: { fontSize: 13, fontWeight: '900', color: C.bg, letterSpacing: 0.5 },
  secondaryBtn:  { borderRadius: 30, paddingVertical: 13, paddingHorizontal: 28, alignItems: 'center', alignSelf: 'stretch', borderWidth: 1, borderColor: C.gold + '60' },
  secondaryBtnTxt:{ fontSize: 13, fontWeight: '700', color: C.gold },
  cancelBtn:     { paddingVertical: 10 },
  cancelBtnTxt:  { fontSize: 12, color: C.muted, fontWeight: '600', textAlign: 'center' },
  retryBtn:      { backgroundColor: C.green, borderRadius: 30, paddingVertical: 14, paddingHorizontal: 28, alignItems: 'center', borderWidth: 1, borderColor: C.gold + '50' },
  retryBtnTxt:   { fontSize: 13, fontWeight: '900', color: C.gold, letterSpacing: 0.5 },

  // Native overlay
  nativeOverlay: { ...StyleSheet.absoluteFillObject, flexDirection: 'column' },
  dimTop:        { flex: 1,   backgroundColor: C.dim },
  middleRow:     { height: FRAME_H, flexDirection: 'row' },
  dimSide:       { flex: 1,   backgroundColor: C.dim },
  nativeFrame:   { width: FRAME_W, height: FRAME_H, overflow: 'hidden', position: 'relative' },
  dimBottom:     { flex: 1.5, backgroundColor: C.dim, alignItems: 'center', justifyContent: 'center', gap: 12 },
  nativeHint:    { color: C.text, fontSize: 12, textAlign: 'center', paddingHorizontal: 32 },
});
