/**
 * DocumentScanner.tsx
 * Full-screen Modal OCR scanner for identity documents.
 * Primary engine: Gemini 2.0 Flash AI (requires EXPO_PUBLIC_GEMINI_API_KEY)
 * Fallback engine: Tesseract.js local OCR
 *
 * Web:    getUserMedia live camera → crop-to-card → OCR  (+ file-upload fallback)
 * Native: expo-camera CameraView → capture → OCR
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  ScrollView, TextInput, ActivityIndicator, Platform,
  Animated, Easing, LayoutChangeEvent,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { scanDocument, warmupOCR, DocumentScanResult, Confidence } from '../utils/documentScanner';
import { isGeminiAvailable } from '../utils/geminiOcr';

// ─── Types ────────────────────────────────────────────────────────────────────

export type { DocumentScanResult };

interface Props {
  visible:         boolean;
  onDataExtracted: (data: DocumentScanResult) => void;
  onClose:         () => void;
}

type Phase = 'idle' | 'processing' | 'result' | 'error';

// ─── ID-card frame dimensions (CR80: 85.6 × 54 mm → ratio 1.585:1) ──────────

const FRAME_W   = 290;
const FRAME_H   = Math.round(FRAME_W / 1.585); // ≈ 183
const BOX_H     = 320;
const CORNER_SZ = 28;
const BORDER    = 3;

// ─── Colours ──────────────────────────────────────────────────────────────────

const C = {
  bg:        '#040D03',
  green:     '#142210',
  darkGreen: '#0A1508',
  input:     '#1A2C18',
  border:    '#2A4020',
  gold:      '#CFA020',
  goldLight: '#EAC040',
  muted:     '#6A8060',
  text:      '#F3EED6',
  success:   '#2ECC71',
  warn:      '#E8A020',
  red:       '#C0392B',
  confHigh:  '#2ECC71',
  confMed:   '#F0B429',
  confLow:   '#E55B4D',
  dim:       'rgba(0,0,0,0.70)',
};

// ─── Confidence dot ───────────────────────────────────────────────────────────

function ConfDot({ level }: { level: Confidence }) {
  const color = level === 'high' ? C.confHigh : level === 'medium' ? C.confMed : C.confLow;
  return <View style={[dot.base, { backgroundColor: color }]} />;
}
const dot = StyleSheet.create({
  base: { width: 8, height: 8, borderRadius: 4, marginRight: 6, marginTop: 3 },
});

// ─── Editable result field ────────────────────────────────────────────────────

function ResultField({ label, value, conf, placeholder, onChange, numeric }: {
  label: string; value: string; conf: Confidence;
  placeholder: string; onChange: (v: string) => void; numeric?: boolean;
}) {
  return (
    <View style={rf.wrap}>
      <View style={rf.labelRow}>
        <ConfDot level={conf} />
        <Text style={rf.label}>{label}</Text>
      </View>
      <TextInput
        style={[rf.input, !value && rf.inputEmpty]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={C.muted}
        keyboardType={numeric ? 'numeric' : 'default'}
      />
      {!value && <Text style={rf.hint}>⚠ No detectado — ingresa manualmente</Text>}
    </View>
  );
}
const rf = StyleSheet.create({
  wrap:     { marginBottom: 14 },
  labelRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  label:    { fontSize: 9, fontWeight: '900', color: C.gold, letterSpacing: 1.5 },
  input:    { backgroundColor: C.input, borderRadius: 10, padding: 13, fontSize: 14, color: C.text, borderWidth: 1, borderColor: C.border },
  inputEmpty: { borderColor: '#8B4513', borderStyle: 'dashed' as any },
  hint:       { fontSize: 9, color: C.warn, marginTop: 3, letterSpacing: 0.3 },
});

// ─── Main component ───────────────────────────────────────────────────────────

export default function DocumentScanner({ visible, onDataExtracted, onClose }: Props) {
  // ── OCR state ────────────────────────────────────────────────────────────
  const [phase,      setPhase]     = useState<Phase>('idle');
  const [stage,      setStage]     = useState('');
  const [pct,        setPct]       = useState(0);
  const [result,     setResult]    = useState<DocumentScanResult | null>(null);
  const [secsLeft,   setSecsLeft]  = useState(10);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Editable result fields
  const [fNum,  setFNum]  = useState('');
  const [fNom,  setFNom]  = useState('');
  const [fApe,  setFApe]  = useState('');
  const [fFec,  setFec]   = useState('');
  const [fPais, setFPais] = useState('');
  const [fReg,  setFReg]  = useState('');
  const [fMun,  setFMun]  = useState('');

  // ── Camera state ──────────────────────────────────────────────────────────
  const [camError,  setCamError]  = useState(false);
  const [boxWidth,  setBoxWidth]  = useState(340);
  const [permission, requestPermission] = useCameraPermissions();

  // ── Animations ────────────────────────────────────────────────────────────
  const scanLine    = useRef(new Animated.Value(0)).current;
  const cornerPulse = useRef(new Animated.Value(1)).current;

  // ── Web refs ──────────────────────────────────────────────────────────────
  const fileInputRef   = useRef<HTMLInputElement  | null>(null);
  const webVideoRef    = useRef<HTMLVideoElement  | null>(null);
  const webCanvasRef   = useRef<HTMLCanvasElement | null>(null);
  const streamRef      = useRef<MediaStream      | null>(null);
  const nativeCamRef   = useRef<CameraView       | null>(null);

  // ── Countdown timer while processing ─────────────────────────────────────
  useEffect(() => {
    if (phase === 'processing') {
      setSecsLeft(10);
      countdownRef.current = setInterval(() => {
        setSecsLeft(s => {
          if (s <= 1) { clearInterval(countdownRef.current!); return 0; }
          return s - 1;
        });
      }, 1000);
    } else {
      if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    }
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [phase]);

  // ── Scan-line + corner animations ─────────────────────────────────────────
  useEffect(() => {
    if (phase === 'idle') {
      scanLine.setValue(0);
      Animated.loop(Animated.sequence([
        Animated.timing(scanLine, { toValue: 1, duration: 1700, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(scanLine, { toValue: 0, duration: 1700, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])).start();

      Animated.loop(Animated.sequence([
        Animated.timing(cornerPulse, { toValue: 1.05, duration: 750, useNativeDriver: true }),
        Animated.timing(cornerPulse, { toValue: 1,    duration: 750, useNativeDriver: true }),
      ])).start();
    } else {
      scanLine.stopAnimation();
      cornerPulse.stopAnimation();
    }
  }, [phase]);

  // ── Web camera lifecycle + OCR pre-warm ──────────────────────────────────
  useEffect(() => {
    if (!visible) {
      stopWebCam();
      return;
    }
    // Pre-warm Tesseract worker as soon as modal opens so language data is
    // already loaded by the time the user captures the photo
    warmupOCR();
    if (Platform.OS === 'web' && phase === 'idle') {
      startWebCam();
    }
  }, [visible, phase]);

  // ── Native permission ─────────────────────────────────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'web' && visible && permission && !permission.granted) {
      requestPermission();
    }
  }, [visible, permission]);

  const startWebCam = async () => {
    setCamError(false);
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
    } catch {
      setCamError(true);
    }
  };

  const stopWebCam = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  // ── Shared OCR runner ─────────────────────────────────────────────────────
  const runOCR = async (source: File | Blob | string) => {
    setPhase('processing');
    setPct(0);
    setStage('Procesando imagen…');
    try {
      const data = await scanDocument(source, (s, p) => { setStage(s); setPct(p); });
      const hasData = data.numero_documento || data.nombres || data.apellidos || data.pais_emision;
      if (!hasData && data._raw_text.trim().length < 20) {
        setPhase('error');
        return;
      }
      setResult(data);
      setFNum(data.numero_documento       ?? '');
      setFNom(data.nombres                ?? '');
      setFApe(data.apellidos              ?? '');
      setFec(data.fecha_nacimiento        ?? '');
      setFPais(data.pais_emision          ?? '');
      setFReg(data.region_departamento    ?? '');
      setFMun(data.municipio_ciudad       ?? '');
      setPhase('result');
    } catch {
      setPhase('error');
    }
  };

  // ── Web: capture frame cropped to card area ───────────────────────────────
  const captureWeb = async () => {
    if (!webVideoRef.current || !webCanvasRef.current) return;
    const video  = webVideoRef.current as any;
    const canvas = webCanvasRef.current as any;

    const vW = video.videoWidth  || 1280;
    const vH = video.videoHeight || 720;

    // objectFit:cover scale + offset
    const scale  = Math.max(boxWidth / vW, BOX_H / vH);
    const rendW  = vW * scale;
    const rendH  = vH * scale;
    const hidX   = (rendW - boxWidth) / 2 / scale;
    const hidY   = (rendH - BOX_H)   / 2 / scale;

    // Card frame center in box-px → video-px
    const frameLeft = (boxWidth - FRAME_W) / 2;
    const frameTop  = (BOX_H   - FRAME_H) / 2;
    const cropX = hidX + frameLeft / scale;
    const cropY = hidY + frameTop  / scale;
    const cropW = FRAME_W / scale;
    const cropH = FRAME_H / scale;

    // Crop to card area at 3× resolution — NO filters here.
    // scanDocument → preprocessImage applies binarization + contrast exactly once.
    // Use PNG (lossless) so JPEG artifacts don't corrupt text edges for Tesseract.
    canvas.width  = Math.round(cropW * 3);
    canvas.height = Math.round(cropH * 3);
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);

    stopWebCam();

    // PNG is lossless — no compression artifacts that could corrupt text edges
    canvas.toBlob(
      (blob: Blob | null) => { if (blob) runOCR(blob); else setPhase('error'); },
      'image/png',
    );
  };

  // ── Native: capture photo ─────────────────────────────────────────────────
  const captureNative = async () => {
    if (!nativeCamRef.current) return;
    try {
      const photo = await (nativeCamRef.current as any).takePictureAsync({
        quality: 0.92,
        base64:  false,
        skipProcessing: false,
      });
      if (photo?.uri) {
        const response = await fetch(photo.uri);
        const blob     = await response.blob();
        await runOCR(blob);
      } else {
        setPhase('error');
      }
    } catch {
      setPhase('error');
    }
  };

  // ── File upload ───────────────────────────────────────────────────────────
  const handleFile = async (file: File) => {
    stopWebCam();
    await runOCR(file);
  };

  // ── Confirm ───────────────────────────────────────────────────────────────
  const handleUseData = () => {
    if (!result) return;
    onDataExtracted({
      ...result,
      numero_documento:    fNum  || null,
      nombres:             fNom  || null,
      apellidos:           fApe  || null,
      fecha_nacimiento:    fFec  || null,
      pais_emision:        fPais || null,
      region_departamento: fReg  || null,
      municipio_ciudad:    fMun  || null,
    });
    handleClose();
  };

  const reset = () => {
    setPhase('idle');
    setStage(''); setPct(0); setResult(null);
    setFNum(''); setFNom(''); setFApe(''); setFec('');
    setFPais(''); setFReg(''); setFMun('');
    setCamError(false);
  };

  const handleClose = () => { stopWebCam(); reset(); onClose(); };

  // ── Interpolations ────────────────────────────────────────────────────────
  const scanLineY = scanLine.interpolate({
    inputRange: [0, 1],
    outputRange: [0, FRAME_H - 2],
  });

  // ── Card silhouette overlay (shared between web and native) ───────────────
  const renderCardOverlay = () => (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, { flexDirection: 'column' }]}
      pointerEvents="none"
    >
      {/* Top dim */}
      <View style={{ height: (BOX_H - FRAME_H) / 2, backgroundColor: C.dim }} />

      {/* Middle row */}
      <View style={{ height: FRAME_H, flexDirection: 'row' }}>
        {/* Left dim */}
        <View style={{ flex: 1, backgroundColor: C.dim }} />

        {/* Card frame window */}
        <Animated.View style={[s.cardFrame, { transform: [{ scale: cornerPulse }] }]}>
          {/* Interior layout hint */}
          <View style={s.cardInterior}>
            <View style={s.photoZone}>
              <Text style={s.photoIcon}>👤</Text>
              <Text style={s.photoLabel}>FOTO</Text>
            </View>
            <View style={s.fieldsZone}>
              <View style={s.fLineWide} />
              <View style={s.fLineNarrow} />
              <View style={{ height: 5 }} />
              <View style={s.fLineMed} />
              <View style={s.fLineShort} />
              <View style={{ height: 5 }} />
              <View style={s.fLineWide} />
            </View>
          </View>

          {/* Scan beam */}
          <Animated.View style={[s.scanBeam, { top: scanLineY }]} />

          {/* Corner brackets */}
          <View style={[s.corner, s.tl]} />
          <View style={[s.corner, s.tr]} />
          <View style={[s.corner, s.bl]} />
          <View style={[s.corner, s.br]} />
        </Animated.View>

        {/* Right dim */}
        <View style={{ flex: 1, backgroundColor: C.dim }} />
      </View>

      {/* Bottom dim with label */}
      <View style={s.guideBottom}>
        <Text style={s.guideArrow}>↑</Text>
        <Text style={s.guideLabel}>Centra el frente de tu cédula dentro del recuadro</Text>
      </View>
    </Animated.View>
  );

  // ── Render: idle ──────────────────────────────────────────────────────────
  const renderIdle = () => {
    // ── NATIVE ──────────────────────────────────────────────────────────────
    if (Platform.OS !== 'web') {
      if (!permission?.granted) {
        return (
          <View style={s.centeredBox}>
            <Text style={s.bigIcon}>📷</Text>
            <Text style={s.idleTitle}>PERMISO DE CÁMARA</Text>
            <Text style={s.idleSub}>
              Necesitamos acceso a la cámara para fotografiar y escanear tu documento.
            </Text>
            <TouchableOpacity style={s.primaryBtn} onPress={requestPermission} activeOpacity={0.85}>
              <Text style={s.primaryBtnTxt}>Conceder permiso</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.cancelBtn} onPress={handleClose} activeOpacity={0.7}>
              <Text style={s.cancelBtnTxt}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        );
      }

      return (
        <View style={{ flex: 1 }}>
          <CameraView
            ref={nativeCamRef as any}
            style={StyleSheet.absoluteFillObject}
            facing="back"
          />
          {renderCardOverlay()}
          {/* Bottom controls */}
          <View style={s.nativeControls}>
            {isGeminiAvailable() && (
              <View style={s.aiBadge}>
                <Text style={s.aiBadgeTxt}>✨ Gemini AI · Alta precisión</Text>
              </View>
            )}
            <TouchableOpacity style={s.captureRing} onPress={captureNative} activeOpacity={0.85}>
              <View style={s.captureInner} />
            </TouchableOpacity>
            <Text style={s.nativeHint}>Toca el botón para capturar</Text>
            <TouchableOpacity style={s.cancelBtn} onPress={handleClose} activeOpacity={0.7}>
              <Text style={s.cancelBtnTxt}>Cancelar — ingresar manualmente</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // ── WEB ─────────────────────────────────────────────────────────────────
    return (
      <View style={s.webWrapper}>
        {/* Hidden elements */}
        {/* @ts-ignore */}
        <canvas ref={webCanvasRef} style={{ display: 'none' }} />
        {/* @ts-ignore */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={(e: any) => { const f = e.target?.files?.[0]; if (f) handleFile(f); }}
        />

        {/* Gemini badge */}
        {isGeminiAvailable() ? (
          <View style={[s.aiBadge, { marginBottom: 8 }]}>
            <Text style={s.aiBadgeTxt}>✨ Gemini AI · Alta precisión</Text>
          </View>
        ) : (
          <View style={[s.aiBadge, s.aiBadgeFallback, { marginBottom: 8 }]}>
            <Text style={[s.aiBadgeTxt, { color: C.warn }]}>🔧 OCR local (Tesseract)</Text>
          </View>
        )}

        {/* Camera box */}
        <View
          style={s.cameraBox}
          onLayout={(e: LayoutChangeEvent) => setBoxWidth(e.nativeEvent.layout.width)}
        >
          {/* Live video feed */}
          {/* @ts-ignore */}
          <video
            ref={webVideoRef}
            playsInline autoPlay muted
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              display: !camError ? 'block' : 'none',
            } as any}
          />

          {/* Camera error fallback */}
          {camError && (
            <View style={s.camErrorBox}>
              <Text style={s.camErrorIcon}>📷</Text>
              <Text style={s.camErrorTxt}>Cámara no disponible</Text>
              <Text style={[s.camErrorTxt, { fontSize: 10, marginTop: 4 }]}>
                Usa el botón de subir foto
              </Text>
            </View>
          )}

          {/* Card silhouette overlay */}
          {!camError && renderCardOverlay()}
        </View>

        {/* Instruction */}
        <Text style={s.hint}>
          {camError
            ? 'La cámara no está disponible — sube una foto directamente'
            : 'Mantén el documento quieto y bien iluminado dentro del recuadro dorado'}
        </Text>

        {/* Capture button */}
        {!camError && (
          <TouchableOpacity style={s.primaryBtn} onPress={captureWeb} activeOpacity={0.85}>
            <Text style={s.primaryBtnTxt}>📷  CAPTURAR Y ESCANEAR</Text>
          </TouchableOpacity>
        )}

        {/* Upload fallback */}
        <TouchableOpacity
          style={camError ? s.primaryBtn : s.secondaryBtn}
          onPress={() => (fileInputRef.current as any)?.click()}
          activeOpacity={0.85}
        >
          <Text style={camError ? s.primaryBtnTxt : s.secondaryBtnTxt}>
            📤  {camError ? 'SUBIR FOTO DEL DOCUMENTO' : 'Subir foto del documento'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.cancelBtn} onPress={handleClose} activeOpacity={0.7}>
          <Text style={s.cancelBtnTxt}>Cancelar — ingresar manualmente</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ── Render: processing ────────────────────────────────────────────────────
  const renderProcessing = () => {
    const gemini = isGeminiAvailable();
    const steps = gemini
      ? [
          { label: 'Comprimiendo imagen',        threshold: 15 },
          { label: 'Enviando a Gemini AI…',      threshold: 25 },
          { label: 'Analizando con IA…',         threshold: 50 },
          { label: 'Extrayendo campos del doc…', threshold: 80 },
        ]
      : [
          { label: 'Procesando imagen',    threshold: 10 },
          { label: 'Leyendo documento…',   threshold: 25 },
          { label: 'Identificando campos', threshold: 75 },
          { label: 'Calculando confianza', threshold: 95 },
        ];

    // Countdown ring colour: green > 5 s, amber ≤ 5 s, red ≤ 2 s
    const ringColor = secsLeft > 5 ? C.success : secsLeft > 2 ? C.warn : C.red;
    const totalSecs = 10;
    const ringPct   = (secsLeft / totalSecs) * 100;

    return (
      <View style={s.centeredBox}>
        {/* Countdown ring */}
        <View style={s.ringWrap}>
          {/* Background ring */}
          <View style={[s.ringBg, { borderColor: C.border }]} />
          {/* Filled arc approximated with a coloured border (top half) */}
          <View style={[s.ringFill, { borderColor: ringColor, opacity: secsLeft === 0 ? 0.3 : 1 }]} />
          {/* Inner content */}
          <View style={s.ringInner}>
            <Text style={[s.ringNumber, { color: ringColor }]}>
              {secsLeft}
            </Text>
            <Text style={s.ringSub}>seg</Text>
          </View>
        </View>

        {gemini && (
          <View style={[s.aiBadge, { marginBottom: 10 }]}>
            <Text style={s.aiBadgeTxt}>✨ Gemini AI procesando…</Text>
          </View>
        )}
        <Text style={s.procTitle}>{stage || 'Analizando documento…'}</Text>

        {/* Progress bar */}
        <View style={s.progressTrack}>
          <View style={[s.progressBar, { width: `${pct}%` as any, backgroundColor: ringColor }]} />
        </View>
        <Text style={s.progressPct}>{pct}%</Text>

        {/* Step checklist */}
        <View style={s.stepList}>
          {steps.map((step, i) => (
            <View key={i} style={s.stepRow}>
              <Text style={[s.stepDot, pct >= step.threshold && { color: C.success }]}>
                {pct >= step.threshold ? '✓' : '·'}
              </Text>
              <Text style={[s.stepTxt, pct >= step.threshold && { color: C.text }]}>
                {step.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // ── Render: result ────────────────────────────────────────────────────────
  const renderResult = () => {
    if (!result) return null;
    const conf = result._confidence;
    return (
      <ScrollView contentContainerStyle={s.resultBox} keyboardShouldPersistTaps="handled">
        <View style={s.resultHeader}>
          <Text style={s.resultIcon}>✅</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.resultTitle}>DATOS EXTRAÍDOS</Text>
            <Text style={s.resultSub}>{result.tipo_documento}</Text>
            {result._engine === 'gemini' ? (
              <View style={[s.aiBadge, { marginTop: 4, alignSelf: 'flex-start' }]}>
                <Text style={s.aiBadgeTxt}>✨ Gemini AI</Text>
              </View>
            ) : (
              <View style={[s.aiBadge, s.aiBadgeFallback, { marginTop: 4, alignSelf: 'flex-start' }]}>
                <Text style={[s.aiBadgeTxt, { color: C.warn }]}>🔧 OCR local</Text>
              </View>
            )}
          </View>
        </View>

        <View style={s.legend}>
          <View style={s.legendItem}><ConfDot level="high"   /><Text style={s.legendTxt}>Alta</Text></View>
          <View style={s.legendItem}><ConfDot level="medium" /><Text style={s.legendTxt}>Media</Text></View>
          <View style={s.legendItem}><ConfDot level="low"    /><Text style={s.legendTxt}>Baja — verifica</Text></View>
        </View>

        <ResultField label="NÚMERO DE DOCUMENTO"         value={fNum}  conf={conf.numero_documento}    placeholder="Ej: 1107654321"   onChange={setFNum}  numeric />
        <ResultField label="NOMBRES"                     value={fNom}  conf={conf.nombres}             placeholder="Ej: CARLOS ANDRÉS" onChange={setFNom} />
        <ResultField label="APELLIDOS"                   value={fApe}  conf={conf.apellidos}           placeholder="Ej: ROJAS PÉREZ"  onChange={setFApe} />
        <ResultField label="FECHA DE NACIMIENTO (AAAA-MM-DD)" value={fFec} conf={conf.fecha_nacimiento} placeholder="Ej: 1990-03-15"  onChange={setFec} />
        <ResultField label="PAÍS DE EMISIÓN"             value={fPais} conf={conf.pais_emision}        placeholder="Ej: Colombia"     onChange={setFPais} />
        <ResultField label="DEPARTAMENTO / REGIÓN"       value={fReg}  conf={conf.region_departamento} placeholder="Ej: Tolima"       onChange={setFReg} />
        <ResultField label="CIUDAD / MUNICIPIO"          value={fMun}  conf={conf.municipio_ciudad}    placeholder="Ej: Chaparral"    onChange={setFMun} />

        <TouchableOpacity style={s.useBtn} onPress={handleUseData} activeOpacity={0.85}>
          <Text style={s.useBtnTxt}>✓  USAR ESTOS DATOS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.rescanBtn} onPress={reset} activeOpacity={0.75}>
          <Text style={s.rescanBtnTxt}>🔄 Volver a escanear</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  // ── Render: error ─────────────────────────────────────────────────────────
  const renderError = () => (
    <View style={s.centeredBox}>
      <Text style={s.bigIcon}>⚠️</Text>
      <Text style={s.procTitle}>NO SE PUDO LEER EL DOCUMENTO</Text>
      <Text style={s.procSub}>
        Asegúrate de que la cédula quede completamente dentro del recuadro dorado, bien iluminada y sin reflejos.
      </Text>
      <TouchableOpacity style={s.primaryBtn} onPress={reset} activeOpacity={0.85}>
        <Text style={s.primaryBtnTxt}>🔄  INTENTAR DE NUEVO</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.cancelBtn} onPress={handleClose} activeOpacity={0.7}>
        <Text style={s.cancelBtnTxt}>Ingresar manualmente</Text>
      </TouchableOpacity>
    </View>
  );

  // ── Root render ───────────────────────────────────────────────────────────
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose} statusBarTranslucent>
      <View style={s.root}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>ESCANEAR DOCUMENTO</Text>
            <Text style={s.headerSub}>
              {isGeminiAvailable()
                ? '✨ Gemini AI · Cédula · Pasaporte · DNI'
                : 'Cédula · Pasaporte · DNI · ID — OCR local'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={s.closeBtn}>
            <Text style={s.closeBtnTxt}>✕</Text>
          </TouchableOpacity>
        </View>

        {phase === 'idle'       && renderIdle()}
        {phase === 'processing' && renderProcessing()}
        {phase === 'result'     && renderResult()}
        {phase === 'error'      && renderError()}
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    paddingTop: 52, paddingBottom: 14, paddingHorizontal: 24,
    backgroundColor: C.green,
    borderBottomWidth: 0.5, borderBottomColor: C.gold + '40',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 13, fontWeight: '900', color: C.gold, letterSpacing: 2.5 },
  headerSub:   { fontSize: 9, color: C.muted, marginTop: 2, letterSpacing: 1 },
  closeBtn:    { padding: 8 },
  closeBtnTxt: { fontSize: 18, color: C.muted, fontWeight: '700' },

  // ── Shared centered box ──────────────────────────────────────────────────
  centeredBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 14 },
  bigIcon:     { fontSize: 72 },
  idleTitle:   { fontSize: 17, fontWeight: '900', color: C.goldLight, letterSpacing: 1, textAlign: 'center' },
  idleSub:     { fontSize: 12, color: C.muted, textAlign: 'center', lineHeight: 20 },
  procTitle:   { fontSize: 15, fontWeight: '900', color: C.goldLight, letterSpacing: 0.5, textAlign: 'center' },
  procSub:     { fontSize: 11, color: C.muted, textAlign: 'center', lineHeight: 17 },

  progressTrack: { width: '80%', height: 7, backgroundColor: C.green, borderRadius: 4, overflow: 'hidden', marginTop: 4 },
  progressBar:   { height: '100%', borderRadius: 4 },
  progressPct:   { fontSize: 13, fontWeight: '700', color: C.gold },
  stepList:      { gap: 6, alignSelf: 'stretch', paddingHorizontal: 20, marginTop: 6 },
  stepRow:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  // ── Countdown ring ──────────────────────────────────────────────────────
  ringWrap:   { width: 96, height: 96, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  ringBg:     { position: 'absolute', width: 96, height: 96, borderRadius: 48, borderWidth: 6 },
  ringFill:   { position: 'absolute', width: 96, height: 96, borderRadius: 48, borderWidth: 6, borderStyle: 'solid' as any },
  ringInner:  { alignItems: 'center', justifyContent: 'center' },
  ringNumber: { fontSize: 32, fontWeight: '900', lineHeight: 36 },
  ringSub:    { fontSize: 11, color: C.muted, fontWeight: '600', letterSpacing: 1 },
  stepDot:       { fontSize: 14, color: C.muted, fontWeight: '900', width: 16 },
  stepTxt:       { fontSize: 11, color: C.muted },

  // ── Web idle layout ──────────────────────────────────────────────────────
  webWrapper: {
    flex: 1, alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, gap: 14,
  },

  cameraBox: {
    width: '100%', height: BOX_H,
    borderRadius: 16, overflow: 'hidden',
    backgroundColor: C.darkGreen,
    borderWidth: 1, borderColor: C.gold + '25',
    position: 'relative',
  },

  camErrorBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  camErrorIcon:{ fontSize: 40 },
  camErrorTxt: { fontSize: 13, color: C.muted, textAlign: 'center' },

  hint: { fontSize: 11, color: C.muted, textAlign: 'center', lineHeight: 17, paddingHorizontal: 8 },

  // ── Card silhouette ───────────────────────────────────────────────────────
  cardFrame: {
    width: FRAME_W, height: FRAME_H,
    position: 'relative', overflow: 'hidden', borderRadius: 6,
  },
  cardInterior: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    padding: 10, gap: 8,
    opacity: 0.25,
  },
  photoZone: {
    width: '32%',
    borderWidth: 1, borderColor: C.gold, borderRadius: 4,
    alignItems: 'center', justifyContent: 'center',
    gap: 4, backgroundColor: C.gold + '18',
  },
  photoIcon:  { fontSize: 24, opacity: 0.8 },
  photoLabel: { fontSize: 7, color: C.text, fontWeight: '800', letterSpacing: 1 },
  fieldsZone: { flex: 1, justifyContent: 'center', paddingVertical: 8 },
  fLineWide:   { height: 3, backgroundColor: C.gold, borderRadius: 2, width: '90%', opacity: 0.8, marginBottom: 0 },
  fLineNarrow: { height: 3, backgroundColor: C.gold, borderRadius: 2, width: '55%', opacity: 0.8 },
  fLineMed:    { height: 3, backgroundColor: C.gold, borderRadius: 2, width: '75%', opacity: 0.8 },
  fLineShort:  { height: 3, backgroundColor: C.gold, borderRadius: 2, width: '40%', opacity: 0.8 },

  scanBeam: {
    position: 'absolute', left: 0, right: 0, height: 2,
    backgroundColor: C.gold, opacity: 0.95,
    shadowColor: C.gold, shadowRadius: 12, shadowOpacity: 1,
  },

  corner:   { position: 'absolute', width: CORNER_SZ, height: CORNER_SZ, borderColor: C.gold },
  tl:       { top: 0,    left: 0,  borderTopWidth: BORDER,    borderLeftWidth: BORDER  },
  tr:       { top: 0,    right: 0, borderTopWidth: BORDER,    borderRightWidth: BORDER },
  bl:       { bottom: 0, left: 0,  borderBottomWidth: BORDER, borderLeftWidth: BORDER  },
  br:       { bottom: 0, right: 0, borderBottomWidth: BORDER, borderRightWidth: BORDER },

  guideBottom: {
    flex: 1,
    backgroundColor: C.dim,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8, gap: 3,
  },
  guideArrow: { fontSize: 14, color: C.gold, fontWeight: '900' },
  guideLabel: { fontSize: 10, color: C.text, fontWeight: '600', textAlign: 'center', opacity: 0.9 },

  // ── Native camera layout ──────────────────────────────────────────────────
  nativeControls: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    alignItems: 'center', paddingBottom: 40, paddingTop: 16,
    gap: 12,
    backgroundColor: 'rgba(4,13,3,0.70)',
  },
  captureRing: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 4, borderColor: C.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  captureInner: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: C.gold,
  },
  nativeHint: { fontSize: 11, color: C.text, opacity: 0.7 },

  // ── Result ────────────────────────────────────────────────────────────────
  resultBox:    { padding: 20, paddingBottom: 40 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  resultIcon:   { fontSize: 36 },
  resultTitle:  { fontSize: 14, fontWeight: '900', color: C.goldLight, letterSpacing: 1 },
  resultSub:    { fontSize: 10, color: C.muted, marginTop: 2 },
  legend:       { flexDirection: 'row', gap: 14, marginBottom: 16, flexWrap: 'wrap' },
  legendItem:   { flexDirection: 'row', alignItems: 'center' },
  legendTxt:    { fontSize: 9, color: C.muted },

  useBtn:       { backgroundColor: C.gold, borderRadius: 30, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  useBtnTxt:    { fontSize: 14, fontWeight: '900', color: C.bg, letterSpacing: 1 },
  rescanBtn:    { alignItems: 'center', paddingVertical: 14 },
  rescanBtnTxt: { fontSize: 13, color: C.muted, fontWeight: '600' },

  // ── Shared buttons ────────────────────────────────────────────────────────
  primaryBtn:     { backgroundColor: C.gold, borderRadius: 30, paddingVertical: 15, paddingHorizontal: 28, alignItems: 'center', alignSelf: 'stretch' },
  primaryBtnTxt:  { fontSize: 13, fontWeight: '900', color: C.bg, letterSpacing: 0.5 },
  secondaryBtn:   { borderRadius: 30, paddingVertical: 13, paddingHorizontal: 28, alignItems: 'center', alignSelf: 'stretch', borderWidth: 1, borderColor: C.gold + '60' },
  secondaryBtnTxt:{ fontSize: 13, fontWeight: '700', color: C.gold },
  cancelBtn:      { paddingVertical: 8 },
  cancelBtnTxt:   { fontSize: 12, color: C.muted, fontWeight: '600', textAlign: 'center' },

  aiBadge:        { backgroundColor: '#1A2A10', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: C.gold + '60' },
  aiBadgeFallback:{ backgroundColor: '#1A1A0A', borderColor: C.warn + '60' },
  aiBadgeTxt:     { fontSize: 10, fontWeight: '800', color: C.goldLight, letterSpacing: 0.5 },
});
