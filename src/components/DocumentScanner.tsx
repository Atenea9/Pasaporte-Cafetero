/**
 * DocumentScanner.tsx
 * Full-screen Modal OCR scanner for identity documents.
 * Primary engine: Gemini 2.0 Flash AI (requires EXPO_PUBLIC_GEMINI_API_KEY)
 * Fallback engine: Tesseract.js local OCR
 */
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  ScrollView, TextInput, ActivityIndicator, Image,
  Platform,
} from 'react-native';
import { scanDocument, DocumentScanResult, Confidence } from '../utils/documentScanner';
import { isGeminiAvailable } from '../utils/geminiOcr';

// ─── Types ────────────────────────────────────────────────────────────────────

export type { DocumentScanResult };

interface Props {
  visible:          boolean;
  onDataExtracted:  (data: DocumentScanResult) => void;
  onClose:          () => void;
}

type Phase = 'idle' | 'processing' | 'result' | 'error';

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
};

// ─── Confidence dot ───────────────────────────────────────────────────────────

function ConfDot({ level }: { level: Confidence }) {
  const color = level === 'high' ? C.confHigh : level === 'medium' ? C.confMed : C.confLow;
  return <View style={[dot.base, { backgroundColor: color }]} />;
}
const dot = StyleSheet.create({ base: { width: 8, height: 8, borderRadius: 4, marginRight: 6, marginTop: 3 } });

// ─── Editable result field ────────────────────────────────────────────────────

function ResultField({
  label, value, conf, placeholder, onChange, numeric,
}: {
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
  input:    {
    backgroundColor: C.input, borderRadius: 10, padding: 13,
    fontSize: 14, color: C.text, borderWidth: 1, borderColor: C.border,
  },
  inputEmpty: { borderColor: '#8B4513', borderStyle: 'dashed' as any },
  hint:       { fontSize: 9, color: C.warn, marginTop: 3, letterSpacing: 0.3 },
});

// ─── Main component ───────────────────────────────────────────────────────────

export default function DocumentScanner({ visible, onDataExtracted, onClose }: Props) {
  const [phase,     setPhase]     = useState<Phase>('idle');
  const [stage,     setStage]     = useState('');
  const [pct,       setPct]       = useState(0);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [result,    setResult]    = useState<DocumentScanResult | null>(null);

  // Editable form state (mirrors result fields)
  const [fNum,  setFNum]  = useState('');
  const [fNom,  setFNom]  = useState('');
  const [fApe,  setFApe]  = useState('');
  const [fFec,  setFec]   = useState('');
  const [fPais, setFPais] = useState('');
  const [fReg,  setFReg]  = useState('');
  const [fMun,  setFMun]  = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const reset = () => {
    setPhase('idle');
    setStage('');
    setPct(0);
    setPreviewUri(null);
    setResult(null);
    setFNum(''); setFNom(''); setFApe(''); setFec('');
    setFPais(''); setFReg(''); setFMun('');
  };

  const handleClose = () => { reset(); onClose(); };

  const handleFile = async (file: File) => {
    setPreviewUri(URL.createObjectURL(file));
    setPhase('processing');
    setPct(0);
    setStage('Extrayendo texto del documento…');
    try {
      const data = await scanDocument(file, (s, p) => { setStage(s); setPct(p); });
      if (data._raw_text.trim().length < 20) {
        setPhase('error');
        return;
      }
      setResult(data);
      setFNum(data.numero_documento  ?? '');
      setFNom(data.nombres           ?? '');
      setFApe(data.apellidos         ?? '');
      setFec(data.fecha_nacimiento   ?? '');
      setFPais(data.pais_emision     ?? '');
      setFReg(data.region_departamento ?? '');
      setFMun(data.municipio_ciudad  ?? '');
      setPhase('result');
    } catch {
      setPhase('error');
    }
  };

  const handleUseData = () => {
    if (!result) return;
    const finalData: DocumentScanResult = {
      ...result,
      numero_documento:    fNum  || null,
      nombres:             fNom  || null,
      apellidos:           fApe  || null,
      fecha_nacimiento:    fFec  || null,
      pais_emision:        fPais || null,
      region_departamento: fReg  || null,
      municipio_ciudad:    fMun  || null,
    };
    onDataExtracted(finalData);
    handleClose();
  };

  // ── Render: idle ─────────────────────────────────────────────────────────
  const renderIdle = () => (
    <View style={s.centeredBox}>
      <Text style={s.bigIcon}>🪪</Text>
      <Text style={s.idleTitle}>ESCANEAR DOCUMENTO</Text>
      {isGeminiAvailable() ? (
        <View style={s.aiBadge}>
          <Text style={s.aiBadgeTxt}>✨ Gemini AI · Alta precisión</Text>
        </View>
      ) : (
        <View style={[s.aiBadge, s.aiBadgeFallback]}>
          <Text style={[s.aiBadgeTxt, { color: C.warn }]}>🔧 OCR local (Tesseract)</Text>
        </View>
      )}
      <Text style={s.idleSub}>
        Cédula · Pasaporte · DNI · Licencia{'\n'}Extracción automática con IA
      </Text>

      {previewUri && (
        /* @ts-ignore */
        <img src={previewUri} style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 12, marginBottom: 8 } as any} />
      )}

      {Platform.OS === 'web' && (
        <>
          {/* Hidden file input */}
          {/* @ts-ignore */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            style={{ display: 'none' }}
            onChange={(e: any) => {
              const file = e.target?.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <TouchableOpacity
            style={s.primaryBtn}
            activeOpacity={0.85}
            onPress={() => (fileInputRef.current as any)?.click()}
          >
            <Text style={s.primaryBtnTxt}>📷  TOMAR FOTO / SUBIR IMAGEN</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={s.cancelBtn} onPress={handleClose} activeOpacity={0.7}>
        <Text style={s.cancelBtnTxt}>Cancelar — ingresar manualmente</Text>
      </TouchableOpacity>
    </View>
  );

  // ── Render: processing ───────────────────────────────────────────────────
  const renderProcessing = () => {
    const gemini = isGeminiAvailable();
    const steps = gemini
      ? [
          { label: 'Procesando imagen',          threshold: 5  },
          { label: 'Enviando a Gemini AI…',       threshold: 20 },
          { label: 'Analizando con IA…',          threshold: 50 },
          { label: 'Extrayendo campos del doc…',  threshold: 80 },
        ]
      : [
          { label: 'Procesando imagen',      threshold: 10 },
          { label: 'Extrayendo texto',        threshold: 40 },
          { label: 'Identificando campos',    threshold: 85 },
          { label: 'Calculando confianza',    threshold: 98 },
        ];

    return (
      <View style={s.centeredBox}>
        <ActivityIndicator size="large" color={gemini ? C.goldLight : C.gold} style={{ marginBottom: 16 }} />
        {gemini && (
          <View style={s.aiBadge}>
            <Text style={s.aiBadgeTxt}>✨ Gemini AI procesando…</Text>
          </View>
        )}
        <Text style={s.procTitle}>{stage || 'Analizando documento…'}</Text>

        <View style={s.progressTrack}>
          <View style={[s.progressBar, { width: `${pct}%` as any }]} />
        </View>
        <Text style={s.progressPct}>{pct}%</Text>

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

  // ── Render: result ───────────────────────────────────────────────────────
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
            {isGeminiAvailable() && (
              <View style={[s.aiBadge, { marginTop: 4, alignSelf: 'flex-start' }]}>
                <Text style={s.aiBadgeTxt}>✨ Gemini AI</Text>
              </View>
            )}
          </View>
        </View>

        {/* Confidence legend */}
        <View style={s.legend}>
          <View style={s.legendItem}><ConfDot level="high"   /><Text style={s.legendTxt}>Alta</Text></View>
          <View style={s.legendItem}><ConfDot level="medium" /><Text style={s.legendTxt}>Media</Text></View>
          <View style={s.legendItem}><ConfDot level="low"    /><Text style={s.legendTxt}>Baja confianza — verifica</Text></View>
        </View>

        <ResultField
          label="NÚMERO DE DOCUMENTO" value={fNum} conf={conf.numero_documento}
          placeholder="Ej: 1107654321" onChange={setFNum} numeric
        />
        <ResultField
          label="NOMBRES" value={fNom} conf={conf.nombres}
          placeholder="Ej: CARLOS ANDRÉS" onChange={setFNom}
        />
        <ResultField
          label="APELLIDOS" value={fApe} conf={conf.apellidos}
          placeholder="Ej: ROJAS PÉREZ" onChange={setFApe}
        />
        <ResultField
          label="FECHA DE NACIMIENTO (AAAA-MM-DD)" value={fFec} conf={conf.fecha_nacimiento}
          placeholder="Ej: 1990-03-15" onChange={setFec}
        />
        <ResultField
          label="PAÍS DE EMISIÓN" value={fPais} conf={conf.pais_emision}
          placeholder="Ej: Colombia" onChange={setFPais}
        />
        <ResultField
          label="DEPARTAMENTO / REGIÓN" value={fReg} conf={conf.region_departamento}
          placeholder="Ej: Tolima" onChange={setFReg}
        />
        <ResultField
          label="CIUDAD / MUNICIPIO" value={fMun} conf={conf.municipio_ciudad}
          placeholder="Ej: Chaparral" onChange={setFMun}
        />

        <TouchableOpacity style={s.useBtn} onPress={handleUseData} activeOpacity={0.85}>
          <Text style={s.useBtnTxt}>✓  USAR ESTOS DATOS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.rescanBtn} onPress={reset} activeOpacity={0.75}>
          <Text style={s.rescanBtnTxt}>🔄 Volver a escanear</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  // ── Render: error ────────────────────────────────────────────────────────
  const renderError = () => (
    <View style={s.centeredBox}>
      <Text style={s.bigIcon}>⚠️</Text>
      <Text style={s.procTitle}>NO SE PUDO LEER EL DOCUMENTO</Text>
      <Text style={s.procSub}>
        No se pudo leer el documento. Asegúrese de que la imagen sea nítida y bien iluminada.
      </Text>
      <TouchableOpacity style={s.primaryBtn} onPress={reset} activeOpacity={0.85}>
        <Text style={s.primaryBtnTxt}>🔄  INTENTAR DE NUEVO</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.cancelBtn} onPress={handleClose} activeOpacity={0.7}>
        <Text style={s.cancelBtnTxt}>Ingresar manualmente</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose} statusBarTranslucent>
      <View style={s.root}>
        {/* Header */}
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

  centeredBox: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 28, gap: 14,
  },
  bigIcon:   { fontSize: 72 },
  idleTitle: { fontSize: 17, fontWeight: '900', color: C.goldLight, letterSpacing: 1, textAlign: 'center' },
  idleSub:   { fontSize: 12, color: C.muted, textAlign: 'center', lineHeight: 20 },

  procTitle:  { fontSize: 15, fontWeight: '900', color: C.goldLight, letterSpacing: 0.5, textAlign: 'center' },
  procSub:    { fontSize: 11, color: C.muted, textAlign: 'center', lineHeight: 17 },

  progressTrack: { width: '80%', height: 5, backgroundColor: C.green, borderRadius: 3, overflow: 'hidden', marginTop: 4 },
  progressBar:   { height: '100%', backgroundColor: C.gold, borderRadius: 3 },
  progressPct:   { fontSize: 13, fontWeight: '700', color: C.gold },

  stepList: { gap: 6, alignSelf: 'stretch', paddingHorizontal: 20, marginTop: 6 },
  stepRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepDot:  { fontSize: 14, color: C.muted, fontWeight: '900', width: 16 },
  stepTxt:  { fontSize: 11, color: C.muted },

  resultBox:    { padding: 20, paddingBottom: 40 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  resultIcon:   { fontSize: 36 },
  resultTitle:  { fontSize: 14, fontWeight: '900', color: C.goldLight, letterSpacing: 1 },
  resultSub:    { fontSize: 10, color: C.muted, marginTop: 2 },

  legend:     { flexDirection: 'row', gap: 14, marginBottom: 16, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendTxt:  { fontSize: 9, color: C.muted },

  useBtn:    { backgroundColor: C.gold, borderRadius: 30, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  useBtnTxt: { fontSize: 14, fontWeight: '900', color: C.bg, letterSpacing: 1 },

  rescanBtn:    { alignItems: 'center', paddingVertical: 14 },
  rescanBtnTxt: { fontSize: 13, color: C.muted, fontWeight: '600' },

  primaryBtn:    { backgroundColor: C.gold, borderRadius: 30, paddingVertical: 15, paddingHorizontal: 28, alignItems: 'center', alignSelf: 'stretch' },
  primaryBtnTxt: { fontSize: 13, fontWeight: '900', color: C.bg, letterSpacing: 0.5 },

  cancelBtn:    { paddingVertical: 10 },
  cancelBtnTxt: { fontSize: 12, color: C.muted, fontWeight: '600', textAlign: 'center' },

  aiBadge:        { backgroundColor: '#1A2A10', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: C.gold + '60' },
  aiBadgeFallback:{ backgroundColor: '#1A1A0A', borderColor: C.warn + '60' },
  aiBadgeTxt:     { fontSize: 10, fontWeight: '800', color: C.goldLight, letterSpacing: 0.5 },
});
