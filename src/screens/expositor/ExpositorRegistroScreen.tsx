import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Animated, Platform, StatusBar, KeyboardAvoidingView,
  Switch, Alert,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ExpositorStackParamList } from '../../navigation/types';
import { useApp } from '../../context/AppContext';
import type { ExpositorPerfil, CafeExpositor } from '../../context/AppContext';
import { MUNICIPIOS, STANDS } from '../../data/mockData';

type Nav   = NativeStackNavigationProp<ExpositorStackParamList, 'ExpositorRegistro'>;
type Route = RouteProp<ExpositorStackParamList, 'ExpositorRegistro'>;

const T = {
  bg: '#F4EDD8', card: '#FFFDF8', dark: '#1A0A00',
  coffee: '#7B4A2A', amber: '#C8960C',
  green: '#1B5E20', greenLight: '#2E7D32',
  gold: '#B8860B', goldDark: '#8B6308',
  muted: '#9B7B5A', border: '#E8D5A8', white: '#FFFFFF',
  red: '#C62828',
};

const VARIEDADES  = ['Castillo', 'Caturra', 'Colombia', 'Gesha', 'Bourbon', 'Typica', 'Tabi', 'Cenicafé 1', 'Otro'];
const PROCESOS    = ['Lavado', 'Natural', 'Honey', 'Anaeróbico', 'Doble anaeróbico', 'Biodinámico'];
const SECCIONES   = ['A', 'B', 'C', 'D', 'E'];
const CARGOS      = ['Propietario/a', 'Administrador/a', 'Vendedor/a', 'Catador/a', 'Representante'];
const CERTS       = ['Orgánico', 'RainForest Alliance', 'FLO Fairtrade', 'Café Practices', '4C', 'UTZ', 'Ninguna'];
const UNIDADES    = ['kg', 'libra', '250g', '500g', 'arroba'];

interface StepDotProps { step: number; current: number; total: number; color: string; }
function StepDots({ step, current, total, color }: StepDotProps) {
  return (
    <View style={sd.row}>
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <View style={[sd.dot, i <= current ? { backgroundColor: color } : { backgroundColor: '#D4C4A8' }]}>
            {i < current ? <Text style={sd.dotTick}>✓</Text> : <Text style={[sd.dotNum, i === current && { color: '#FFF' }]}>{i + 1}</Text>}
          </View>
          {i < total - 1 && <View style={[sd.line, i < current && { backgroundColor: color }]} />}
        </React.Fragment>
      ))}
    </View>
  );
}
const sd = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  dot:    { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  dotTick:{ color: '#FFF', fontSize: 13, fontWeight: '800' },
  dotNum: { fontSize: 13, fontWeight: '700', color: '#9B7B5A' },
  line:   { flex: 1, height: 2, backgroundColor: '#D4C4A8', maxWidth: 40 },
});

function PillPicker({ options, selected, onSelect, color }: { options: string[]; selected: string; onSelect: (v: string) => void; color: string }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 2 }}>
        {options.map(o => (
          <TouchableOpacity
            key={o}
            style={[pp.pill, selected === o && { backgroundColor: color, borderColor: color }]}
            onPress={() => onSelect(o)}
          >
            <Text style={[pp.pillTxt, selected === o && { color: '#FFF' }]}>{o}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
const pp = StyleSheet.create({
  pill:    { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: '#D4C4A8', backgroundColor: '#FFF' },
  pillTxt: { fontSize: 13, fontWeight: '600', color: '#7B4A2A' },
});

function MultiPill({ options, selected, onToggle, color }: { options: string[]; selected: string[]; onToggle: (v: string) => void; color: string }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
      {options.map(o => {
        const active = selected.includes(o);
        return (
          <TouchableOpacity key={o} style={[pp.pill, active && { backgroundColor: color, borderColor: color }]} onPress={() => onToggle(o)}>
            <Text style={[pp.pillTxt, active && { color: '#FFF' }]}>{o}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function Field({ label, children, optional }: { label: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <Text style={s.fieldLabel}>{label}</Text>
        {optional && <Text style={s.optional}>(opcional)</Text>}
      </View>
      {children}
    </View>
  );
}

function TInput({ value, onChangeText, placeholder, keyboardType = 'default', multiline = false, maxLength }: any) {
  return (
    <TextInput
      style={[s.input, multiline && { height: 80, textAlignVertical: 'top' }]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={T.muted}
      keyboardType={keyboardType}
      multiline={multiline}
      maxLength={maxLength}
    />
  );
}

export default function ExpositorRegistroScreen() {
  const nav   = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { tipo, cedula: cedulaParam } = route.params;
  const { dispatch } = useApp();

  const isStand   = tipo === 'stand';
  const accentClr = isStand ? T.greenLight : T.gold;
  const totalSteps = 3;

  const [step, setStep]   = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateStep = (next: number) => {
    const dir = next > step ? 1 : -1;
    slideAnim.setValue(dir * 30);
    setStep(next);
    Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }).start();
  };

  // ── Datos personales ──────────────────────────────────────────────────────
  const [nombre,   setNombre]   = useState('');
  const [cedula,   setCedula]   = useState(cedulaParam ?? '');
  const [whatsapp, setWhatsapp] = useState('');
  const [email,    setEmail]    = useState('');
  const [cargo,    setCargo]    = useState('');

  // ── Stand ─────────────────────────────────────────────────────────────────
  const [municipioId,  setMunicipioId]  = useState('');
  const [standExistId, setStandExistId] = useState('');  // '' = nuevo
  const [standNombre,  setStandNombre]  = useState('');
  const [standSeccion, setStandSeccion] = useState('');
  const [standNumero,  setStandNumero]  = useState('');
  const [descripcion,  setDescripcion]  = useState('');
  const [horario,      setHorario]      = useState('');

  // ── Finca (subasta) ───────────────────────────────────────────────────────
  const [nombreFinca,   setNombreFinca]   = useState('');
  const [altitudFinca,  setAltitudFinca]  = useState('');
  const [hectareas,     setHectareas]     = useState('');
  const [certificaciones, setCerts]       = useState<string[]>([]);

  // ── Primer café / microlote ───────────────────────────────────────────────
  const [cafNombre,  setCafNombre]  = useState('');
  const [cafMarca,   setCafMarca]   = useState('');
  const [cafVariedad,setCafVariedad]= useState('');
  const [cafProceso, setCafProceso] = useState('');
  const [cafAltitud, setCafAltitud] = useState('');
  const [cafMunOrig, setCafMunOrig] = useState('');
  const [cafPrecio,  setCafPrecio]  = useState('');
  const [cafUnidad,  setCafUnidad]  = useState('kg');
  const [cafDesc,    setCafDesc]    = useState('');
  const [cafSca,     setCafSca]     = useState('');
  const [cafDisp,    setCafDisp]    = useState(true);

  // Stands del municipio seleccionado
  const standsDelMunicipio = STANDS.filter(st => st.municipioId === municipioId && st.activo);

  // Sync stand data when picking existing stand
  useEffect(() => {
    if (standExistId) {
      const st = STANDS.find(s => s.id === standExistId);
      if (st) { setStandNombre(st.nombre); setStandSeccion(st.seccion ?? ''); }
    }
  }, [standExistId]);

  const toggleCert = (c: string) =>
    setCerts(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const stepLabels = isStand
    ? ['Datos Personales', 'Info del Stand', 'Primer Café']
    : ['Datos Personales', 'Tu Finca',       'Primer Microlote'];

  // ── Validation ────────────────────────────────────────────────────────────
  const canNext = () => {
    if (step === 0) return nombre.trim() && cedula.trim() && whatsapp.trim() && cargo;
    if (step === 1) {
      if (isStand) return municipioId && standNombre.trim() && standSeccion;
      return nombreFinca.trim() && municipioId && altitudFinca.trim();
    }
    return cafVariedad && cafProceso;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    const primerCafe: CafeExpositor = {
      id: `cafe_${Date.now()}`,
      nombre: cafNombre || (isStand ? cafMarca || cafVariedad : `Microlote ${cafVariedad}`),
      marca: cafMarca,
      variedad: cafVariedad,
      proceso: cafProceso,
      altitud: cafAltitud,
      municipioOrigen: cafMunOrig || municipioId,
      precio: cafPrecio,
      unidad: cafUnidad,
      descripcion: cafDesc,
      scaScore: cafSca || undefined,
      disponible: cafDisp,
      esMicrolote: !isStand,
    };

    const perfil: ExpositorPerfil = {
      nombre: nombre.trim(),
      cedula: cedula.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      cargo,
      tipo,
      standId: standExistId,
      standNombre: standNombre.trim(),
      standSeccion,
      standNumero: standNumero.trim(),
      municipioId,
      descripcionStand: descripcion.trim(),
      horario: horario.trim(),
      cafes: cafVariedad ? [primerCafe] : [],
      productos: [],
      nombreFinca: nombreFinca.trim(),
      hectareasCafe: hectareas.trim(),
      certificaciones,
      altitudFinca: altitudFinca.trim(),
      creadoEn: Date.now(),
    };

    dispatch({ type: 'SET_EXPOSITOR_PERFIL', payload: perfil });
    nav.replace('Dashboard');
  };

  // ── Step content ──────────────────────────────────────────────────────────
  const renderStep0 = () => (
    <>
      <Text style={s.stepTitle}>Tus Datos Personales</Text>
      <Text style={s.stepSub}>Con esto te identificamos en la feria.</Text>

      <Field label="Nombre completo">
        <TInput value={nombre} onChangeText={setNombre} placeholder="Tu nombre y apellidos" maxLength={80} />
      </Field>
      <Field label="Número de Cédula">
        <TInput value={cedula} onChangeText={setCedula} placeholder="Ej: 1 098 765 432" keyboardType="numeric" maxLength={15} />
      </Field>
      <Field label="WhatsApp (con indicativo)">
        <TInput value={whatsapp} onChangeText={setWhatsapp} placeholder="+57 300 000 0000" keyboardType="phone-pad" maxLength={20} />
      </Field>
      <Field label="Correo electrónico" optional>
        <TInput value={email} onChangeText={setEmail} placeholder="tu@correo.com" keyboardType="email-address" maxLength={80} />
      </Field>
      <Field label="Tu rol en el stand">
        <PillPicker options={CARGOS} selected={cargo} onSelect={setCargo} color={accentClr} />
      </Field>
    </>
  );

  const renderStep1Stand = () => (
    <>
      <Text style={s.stepTitle}>Info de tu Stand</Text>
      <Text style={s.stepSub}>¿De qué municipio y cuál es tu espacio?</Text>

      <Field label="Municipio del stand">
        <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
          {(['Norte', 'Centro', 'Sur'] as const).map(region => (
            <View key={region}>
              <Text style={s.regionLabel}>{region}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {MUNICIPIOS.filter(m => m.region === region).map(m => (
                  <TouchableOpacity
                    key={m.id}
                    style={[pp.pill, municipioId === m.id && { backgroundColor: accentClr, borderColor: accentClr }]}
                    onPress={() => { setMunicipioId(m.id); setStandExistId(''); }}
                  >
                    <Text style={[pp.pillTxt, municipioId === m.id && { color: '#FFF' }]}>{m.emoji} {m.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </Field>

      {municipioId !== '' && (
        <Field label="¿Cuál es tu stand?">
          {standsDelMunicipio.length > 0 && (
            <>
              <Text style={s.subFieldNote}>Stands existentes en {MUNICIPIOS.find(m=>m.id===municipioId)?.nombre}:</Text>
              {standsDelMunicipio.map(st => (
                <TouchableOpacity
                  key={st.id}
                  style={[s.standOption, standExistId === st.id && { borderColor: accentClr, backgroundColor: isStand ? '#F0FFF4' : '#FFFDE7' }]}
                  onPress={() => setStandExistId(st.id)}
                >
                  <Text style={[s.standOptionTxt, standExistId === st.id && { color: accentClr }]}>
                    {standExistId === st.id ? '●' : '○'} {st.nombre} — Sección {st.seccion}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[s.standOption, standExistId === '' && standNombre === '' ? {} : standExistId === '' && { borderColor: accentClr, backgroundColor: isStand ? '#F0FFF4' : '#FFFDE7' }]}
                onPress={() => setStandExistId('')}
              >
                <Text style={[s.standOptionTxt, standExistId === '' && { color: accentClr }]}>
                  {standExistId === '' ? '●' : '○'} Crear nuevo stand
                </Text>
              </TouchableOpacity>
            </>
          )}
          {standsDelMunicipio.length === 0 && (
            <Text style={s.subFieldNote}>No hay stands registrados aún. Crea el tuyo:</Text>
          )}
        </Field>
      )}

      <Field label="Nombre del stand">
        <TInput value={standNombre} onChangeText={setStandNombre} placeholder="Ej: Café Las Palmas" maxLength={60} />
      </Field>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Field label="Sección">
            <PillPicker options={SECCIONES} selected={standSeccion} onSelect={setStandSeccion} color={accentClr} />
          </Field>
        </View>
        <View style={{ flex: 1 }}>
          <Field label="N° de stand" optional>
            <TInput value={standNumero} onChangeText={setStandNumero} placeholder="Ej: 12" keyboardType="numeric" maxLength={5} />
          </Field>
        </View>
      </View>
      <Field label="Descripción del stand" optional>
        <TInput value={descripcion} onChangeText={setDescripcion} placeholder="Breve descripción de tu oferta..." multiline maxLength={200} />
      </Field>
      <Field label="Horario de atención" optional>
        <TInput value={horario} onChangeText={setHorario} placeholder="Ej: 8am – 6pm" maxLength={50} />
      </Field>
    </>
  );

  const renderStep1Subasta = () => (
    <>
      <Text style={s.stepTitle}>Tu Finca</Text>
      <Text style={s.stepSub}>Datos del origen de tus microlotes.</Text>

      <Field label="Nombre de la finca">
        <TInput value={nombreFinca} onChangeText={setNombreFinca} placeholder="Ej: Finca La Esperanza" maxLength={80} />
      </Field>
      <Field label="Municipio de origen">
        <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
          {(['Norte', 'Centro', 'Sur'] as const).map(region => (
            <View key={region}>
              <Text style={s.regionLabel}>{region}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {MUNICIPIOS.filter(m => m.region === region).map(m => (
                  <TouchableOpacity
                    key={m.id}
                    style={[pp.pill, municipioId === m.id && { backgroundColor: accentClr, borderColor: accentClr }]}
                    onPress={() => setMunicipioId(m.id)}
                  >
                    <Text style={[pp.pillTxt, municipioId === m.id && { color: '#FFF' }]}>{m.emoji} {m.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </Field>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Field label="Altitud promedio">
            <TInput value={altitudFinca} onChangeText={setAltitudFinca} placeholder="msnm" keyboardType="numeric" maxLength={6} />
          </Field>
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Hectáreas de café" optional>
            <TInput value={hectareas} onChangeText={setHectareas} placeholder="ha" keyboardType="numeric" maxLength={5} />
          </Field>
        </View>
      </View>
      <Field label="Certificaciones" optional>
        <MultiPill options={CERTS} selected={certificaciones} onToggle={toggleCert} color={accentClr} />
      </Field>
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={s.stepTitle}>{isStand ? 'Primer Café a Ofertar' : 'Primer Microlote'}</Text>
      <Text style={s.stepSub}>
        {isStand
          ? 'Agrega tu primer café. Podrás añadir más desde el dashboard.'
          : 'Ingresa tu primer microlote. Podrás agregar más y subirlo a subasta.'}
      </Text>

      <Field label={isStand ? 'Nombre del café' : 'Nombre del microlote'} optional>
        <TInput value={cafNombre} onChangeText={setCafNombre} placeholder={isStand ? 'Ej: Gesha Honey 2025' : 'Ej: Microlote Anaeróbico #1'} maxLength={80} />
      </Field>
      {isStand && (
        <Field label="Marca comercial" optional>
          <TInput value={cafMarca} onChangeText={setCafMarca} placeholder="Ej: Café Planadas" maxLength={60} />
        </Field>
      )}
      <Field label="Variedad">
        <PillPicker options={VARIEDADES} selected={cafVariedad} onSelect={setCafVariedad} color={accentClr} />
      </Field>
      <Field label="Proceso de beneficio">
        <PillPicker options={PROCESOS} selected={cafProceso} onSelect={setCafProceso} color={accentClr} />
      </Field>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Field label="Altitud (msnm)" optional>
            <TInput value={cafAltitud} onChangeText={setCafAltitud} placeholder="1800" keyboardType="numeric" maxLength={6} />
          </Field>
        </View>
        {!isStand && (
          <View style={{ flex: 1 }}>
            <Field label="Puntaje SCA" optional>
              <TInput value={cafSca} onChangeText={setCafSca} placeholder="86.5" keyboardType="numeric" maxLength={5} />
            </Field>
          </View>
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 2 }}>
          <Field label={isStand ? 'Precio de venta' : 'Precio base subasta'} optional>
            <TInput value={cafPrecio} onChangeText={setCafPrecio} placeholder="$35.000" keyboardType="numeric" maxLength={12} />
          </Field>
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Unidad">
            <PillPicker options={UNIDADES} selected={cafUnidad} onSelect={setCafUnidad} color={accentClr} />
          </Field>
        </View>
      </View>
      <Field label="Notas de cata / descripción" optional>
        <TInput value={cafDesc} onChangeText={setCafDesc} placeholder="Ej: Notas de durazno, jazmín y panela..." multiline maxLength={250} />
      </Field>
      <View style={s.switchRow}>
        <Text style={s.switchLabel}>Disponible desde el primer día</Text>
        <Switch value={cafDisp} onValueChange={setCafDisp} trackColor={{ true: accentClr }} />
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor={T.coffee} />

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => step === 0 ? nav.goBack() : animateStep(step - 1)}>
            <Text style={s.backTxt}>← {step === 0 ? 'Volver' : 'Anterior'}</Text>
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerSub}>REGISTRO EXPOSITOR</Text>
            <Text style={s.headerTitle}>{isStand ? 'Stand de Exhibición' : 'Microlotes & Subastas'}</Text>
          </View>
          <View style={{ width: 72 }} />
        </View>

        {/* Progress */}
        <View style={s.progressBar}>
          <StepDots step={step} current={step} total={totalSteps} color={accentClr} />
          <Text style={[s.stepLabelTxt, { color: accentClr }]}>
            Paso {step + 1} de {totalSteps}: {stepLabels[step]}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
            {step === 0 && renderStep0()}
            {step === 1 && isStand && renderStep1Stand()}
            {step === 1 && !isStand && renderStep1Subasta()}
            {step === 2 && renderStep2()}
          </Animated.View>
        </ScrollView>

        {/* Bottom buttons */}
        <View style={s.bottomBar}>
          {step < totalSteps - 1 ? (
            <TouchableOpacity
              style={[s.btnNext, { backgroundColor: accentClr }, !canNext() && { opacity: 0.45 }]}
              onPress={() => canNext() && animateStep(step + 1)}
              disabled={!canNext()}
              activeOpacity={0.85}
            >
              <Text style={s.btnNextTxt}>Siguiente →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[s.btnNext, { backgroundColor: accentClr }]}
              onPress={handleSubmit}
              activeOpacity={0.85}
            >
              <Text style={s.btnNextTxt}>✓  Completar Registro</Text>
            </TouchableOpacity>
          )}
          {step === totalSteps - 1 && (
            <TouchableOpacity style={s.btnSkip} onPress={() => {
              setCafVariedad('Caturra'); setCafProceso('Lavado'); handleSubmit();
            }}>
              <Text style={s.btnSkipTxt}>Agregar cafés después</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: T.bg },
  header:       { backgroundColor: T.coffee, paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight ?? 24) + 8, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn:      { padding: 6 },
  backTxt:      { color: '#FFF', fontSize: 13, fontWeight: '600' },
  headerCenter: { alignItems: 'center' },
  headerSub:    { color: 'rgba(255,255,255,0.7)', fontSize: 8, letterSpacing: 1.5, fontWeight: '700' },
  headerTitle:  { color: T.amber, fontSize: 13, fontWeight: '800', letterSpacing: 0.8 },
  progressBar:  { backgroundColor: T.card, paddingTop: 14, paddingBottom: 10, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: T.border },
  stepLabelTxt: { textAlign: 'center', fontSize: 12, fontWeight: '700', marginTop: 4, letterSpacing: 0.3 },
  scroll:       { padding: 20, paddingBottom: 20 },
  stepTitle:    { fontSize: 20, fontWeight: '800', color: T.dark, marginBottom: 4 },
  stepSub:      { fontSize: 13, color: T.muted, marginBottom: 20, lineHeight: 18 },
  fieldLabel:   { fontSize: 12, fontWeight: '700', color: T.coffee, letterSpacing: 0.5 },
  optional:     { fontSize: 11, color: T.muted, fontStyle: 'italic' },
  input:        { backgroundColor: T.white, borderWidth: 1.5, borderColor: T.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: T.dark },
  regionLabel:  { fontSize: 10, fontWeight: '800', color: T.muted, letterSpacing: 1, marginBottom: 4, marginTop: 2 },
  subFieldNote: { fontSize: 12, color: T.muted, marginBottom: 8, fontStyle: 'italic' },
  standOption:  { borderWidth: 1.5, borderColor: T.border, borderRadius: 10, padding: 12, marginBottom: 6, backgroundColor: T.white },
  standOptionTxt: { fontSize: 13, fontWeight: '600', color: T.coffee },
  switchRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: T.white, borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1.5, borderColor: T.border },
  switchLabel:  { fontSize: 14, fontWeight: '600', color: T.dark, flex: 1 },
  bottomBar:    { backgroundColor: T.card, padding: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16, borderTopWidth: 1, borderTopColor: T.border, gap: 8 },
  btnNext:      { borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  btnNextTxt:   { color: '#FFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  btnSkip:      { alignItems: 'center', paddingVertical: 6 },
  btnSkipTxt:   { color: T.muted, fontSize: 13, textDecorationLine: 'underline' },
});
