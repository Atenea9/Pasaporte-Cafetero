import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TextInput,
  TouchableOpacity, SafeAreaView, StatusBar,
  Alert, KeyboardAvoidingView, Platform, Dimensions
} from 'react-native';
import { useApp } from '../context/AppContext';
import { MUNICIPIOS } from '../data/mockData';

const { width } = Dimensions.get('window');
const C = {
  bg: '#1A0F00', card: '#2C1A00', card2: '#3D2400',
  gold: '#C8860A', goldLight: '#E8A830',
  green: '#2E5016', text: '#F5EDD8', muted: '#A89070',
};

const MUNICIPIOS_TOLIMA = MUNICIPIOS.map(m => m.nombre);

export default function RegistroScreen({ onRegistrado }: { onRegistrado: () => void }) {
  const { dispatch } = useApp();
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [showMunicipios, setShowMunicipios] = useState(false);
  const [loading, setLoading] = useState(false);

  const simularEscaneo = () => {
    setCedula('1107' + Math.floor(Math.random() * 900000 + 100000));
    setNombre('Carlos Andrés Rojas');
    setWhatsapp('3156789012');
    setMunicipio('Chaparral');
  };

  const registrar = () => {
    if (!cedula || !nombre || !whatsapp || !municipio) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos para crear tu pasaporte.');
      return;
    }
    if (whatsapp.length < 10) {
      Alert.alert('WhatsApp inválido', 'Ingresa un número de WhatsApp válido de 10 dígitos.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const usuario = {
        cedula,
        nombre,
        whatsapp,
        municipio,
        departamento: 'Tolima',
        puntos: 0,
        nivel: 'Visitante',
        sellos: [],
        creadoEn: Date.now(),
      };
      dispatch({ type: 'SET_USUARIO', payload: usuario });
      dispatch({
        type: 'AGREGAR_NOTIF',
        payload: {
          id: Date.now().toString(),
          mensaje: `¡Bienvenido ${nombre.split(' ')[0]}! Tu pasaporte cafetero está listo. Visita los stands y colecciona sellos.`,
          fecha: new Date().toISOString(),
          leida: false,
        },
      });
      setLoading(false);
      onRegistrado();
    }, 1200);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.card} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* HEADER */}
          <View style={s.header}>
            <Text style={s.headerIcon}>🌿</Text>
            <View>
              <Text style={s.brand1}>PASAPORTE CAFETERO</Text>
              <Text style={s.brand2}>Feria Internacional del Café · Tolima 2026</Text>
            </View>
          </View>

          {/* HERO */}
          <View style={s.hero}>
            <Text style={s.heroEmoji}>🪪</Text>
            <Text style={s.heroTitle}>CREA TU PASAPORTE{'\n'}CAFETERO</Text>
            <Text style={s.heroSub}>
              Regístrate en menos de 60 segundos y empieza a coleccionar sellos, sumar puntos y ganar premios.
            </Text>
          </View>

          {/* PASOS */}
          <View style={s.pasosRow}>
            {['Cédula', 'WhatsApp', 'Municipio', '¡Listo!'].map((p, i) => (
              <View key={i} style={s.paso}>
                <View style={[s.pasoBubble, i === 0 && s.pasoBubbleActive]}>
                  <Text style={s.pasoNum}>{i + 1}</Text>
                </View>
                <Text style={s.pasoLabel}>{p}</Text>
              </View>
            ))}
          </View>

          {/* FORMULARIO */}
          <View style={s.form}>

            {/* SIMULAR ESCANEO */}
            <TouchableOpacity style={s.scanBtn} onPress={simularEscaneo} activeOpacity={0.8}>
              <Text style={s.scanIcon}>📷</Text>
              <View>
                <Text style={s.scanTitle}>SIMULAR ESCANEO DE CÉDULA</Text>
                <Text style={s.scanSub}>Auto-rellena los datos para el demo</Text>
              </View>
            </TouchableOpacity>

            <Text style={s.orText}>— o ingresa los datos manualmente —</Text>

            {/* CÉDULA */}
            <View style={s.fieldGroup}>
              <Text style={s.label}>NÚMERO DE CÉDULA</Text>
              <TextInput
                style={s.input}
                value={cedula}
                onChangeText={setCedula}
                placeholder="Ej: 1107654321"
                placeholderTextColor={C.muted}
                keyboardType="numeric"
                maxLength={12}
              />
            </View>

            {/* NOMBRE */}
            <View style={s.fieldGroup}>
              <Text style={s.label}>NOMBRE COMPLETO</Text>
              <TextInput
                style={s.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Ej: Carlos Andrés Rojas"
                placeholderTextColor={C.muted}
                autoCapitalize="words"
              />
            </View>

            {/* WHATSAPP */}
            <View style={s.fieldGroup}>
              <Text style={s.label}>NÚMERO DE WHATSAPP</Text>
              <View style={s.inputRow}>
                <View style={s.prefix}>
                  <Text style={s.prefixText}>🇨🇴 +57</Text>
                </View>
                <TextInput
                  style={[s.input, { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}
                  value={whatsapp}
                  onChangeText={setWhatsapp}
                  placeholder="3156789012"
                  placeholderTextColor={C.muted}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              <Text style={s.fieldHint}>Recibirás notificaciones y soporte por WhatsApp</Text>
            </View>

            {/* MUNICIPIO */}
            <View style={s.fieldGroup}>
              <Text style={s.label}>MUNICIPIO DE RESIDENCIA</Text>
              <View style={[s.input, s.selectBtn]}>
                <TouchableOpacity
                  style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                  onPress={() => setShowMunicipios(!showMunicipios)}
                  activeOpacity={0.8}
                >
                  <Text style={municipio ? s.selectText : s.selectPlaceholder}>
                    {municipio || 'Selecciona tu municipio del Tolima'}
                  </Text>
                  <Text style={s.selectArrow}>{showMunicipios ? '▲' : '▼'}</Text>
                </TouchableOpacity>
              </View>
              {showMunicipios && (
                <View style={s.dropdown}>
                  {MUNICIPIOS_TOLIMA.map((m, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[s.dropItem, municipio === m && s.dropItemActive]}
                      onPress={() => { setMunicipio(m); setShowMunicipios(false); }}
                    >
                      <Text style={s.dropEmoji}>{MUNICIPIOS[i].emoji}</Text>
                      <Text style={[s.dropText, municipio === m && s.dropTextActive]}>{m}</Text>
                      {municipio === m && <Text style={s.dropCheck}>✓</Text>}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* DEPARTAMENTO FIJO */}
            <View style={s.fieldGroup}>
              <Text style={s.label}>DEPARTAMENTO</Text>
              <View style={[s.input, s.inputFixed]}>
                <Text style={s.fixedText}>📍 Tolima, Colombia</Text>
              </View>
            </View>

            {/* PREVIEW PASAPORTE */}
            {nombre.length > 0 && (
              <View style={s.preview}>
                <Text style={s.previewTitle}>VISTA PREVIA DE TU PASAPORTE</Text>
                <View style={s.previewCard}>
                  <View style={s.previewAvatar}>
                    <Text style={s.previewAvatarText}>{nombre.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.previewNombre}>{nombre}</Text>
                    <Text style={s.previewMun}>{municipio || '—'} · Tolima</Text>
                    <View style={s.previewBadge}>
                      <Text style={s.previewBadgeText}>⭐ Visitante · 0 puntos</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 32 }}>🪪</Text>
                </View>
              </View>
            )}

            {/* BOTÓN CREAR */}
            <TouchableOpacity
              style={[s.createBtn, loading && s.createBtnLoading]}
              onPress={registrar}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={s.createBtnText}>
                {loading ? 'CREANDO TU PASAPORTE...' : '🎉 CREAR MI PASAPORTE CAFETERO'}
              </Text>
            </TouchableOpacity>

            <Text style={s.disclaimer}>
              Al registrarte aceptas que tus datos sean usados para mejorar tu experiencia en la Feria Internacional de Café del Tolima.
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 20, backgroundColor: C.card },
  headerIcon: { fontSize: 28 },
  brand1: { fontSize: 13, fontWeight: '900', color: C.gold, letterSpacing: 2 },
  brand2: { fontSize: 10, color: C.muted, marginTop: 2 },
  hero: { backgroundColor: C.card, paddingHorizontal: 20, paddingBottom: 28, alignItems: 'center' },
  heroEmoji: { fontSize: 56, marginBottom: 12 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: C.text, textAlign: 'center', letterSpacing: 1, marginBottom: 10 },
  heroSub: { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 20 },
  pasosRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: C.card2, paddingVertical: 16, paddingHorizontal: 8 },
  paso: { alignItems: 'center', gap: 4 },
  pasoBubble: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.muted, alignItems: 'center', justifyContent: 'center' },
  pasoBubbleActive: { backgroundColor: C.gold, borderColor: C.gold },
  pasoNum: { fontSize: 12, fontWeight: '800', color: C.bg },
  pasoLabel: { fontSize: 9, color: C.muted, fontWeight: '600' },
  form: { padding: 16 },
  scanBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.green, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 0.5, borderColor: C.goldLight + '60' },
  scanIcon: { fontSize: 28 },
  scanTitle: { fontSize: 12, fontWeight: '800', color: C.goldLight, letterSpacing: 0.5 },
  scanSub: { fontSize: 11, color: C.text + 'AA', marginTop: 2 },
  orText: { textAlign: 'center', color: C.muted, fontSize: 11, marginBottom: 16 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 10, fontWeight: '800', color: C.gold, letterSpacing: 1, marginBottom: 6 },
  input: { backgroundColor: C.card, borderWidth: 0.5, borderColor: C.gold + '50', borderRadius: 10, padding: 14, fontSize: 14, color: C.text },
  inputRow: { flexDirection: 'row' },
  prefix: { backgroundColor: C.card2, borderWidth: 0.5, borderColor: C.gold + '50', borderTopLeftRadius: 10, borderBottomLeftRadius: 10, paddingHorizontal: 12, justifyContent: 'center', borderRightWidth: 0 },
  prefixText: { fontSize: 13, color: C.text, fontWeight: '600' },
  fieldHint: { fontSize: 10, color: C.muted, marginTop: 4 },
  selectBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectText: { fontSize: 14, color: C.text },
  selectPlaceholder: { fontSize: 14, color: C.muted },
  selectArrow: { fontSize: 10, color: C.gold },
  dropdown: { backgroundColor: C.card2, borderRadius: 10, borderWidth: 0.5, borderColor: C.gold + '50', marginTop: 4, overflow: 'hidden' },
  dropItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderBottomWidth: 0.5, borderBottomColor: C.gold + '20' },
  dropItemActive: { backgroundColor: C.green },
  dropEmoji: { fontSize: 18 },
  dropText: { flex: 1, fontSize: 13, color: C.text },
  dropTextActive: { color: C.goldLight, fontWeight: '700' },
  dropCheck: { fontSize: 14, color: C.gold },
  inputFixed: { flexDirection: 'row', alignItems: 'center', opacity: 0.7 },
  fixedText: { fontSize: 14, color: C.muted },
  preview: { marginBottom: 16 },
  previewTitle: { fontSize: 10, fontWeight: '800', color: C.gold, letterSpacing: 1, marginBottom: 8 },
  previewCard: { backgroundColor: C.card2, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: C.gold + '60' },
  previewAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' },
  previewAvatarText: { fontSize: 20, fontWeight: '800', color: C.bg },
  previewNombre: { fontSize: 14, fontWeight: '700', color: C.text },
  previewMun: { fontSize: 11, color: C.muted, marginTop: 2 },
  previewBadge: { marginTop: 6, backgroundColor: C.green, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  previewBadgeText: { fontSize: 10, color: C.goldLight, fontWeight: '600' },
  createBtn: { backgroundColor: C.gold, borderRadius: 30, padding: 18, alignItems: 'center', marginBottom: 12 },
  createBtnLoading: { opacity: 0.7 },
  createBtnText: { fontSize: 14, fontWeight: '900', color: C.bg, letterSpacing: 0.5 },
  disclaimer: { fontSize: 10, color: C.muted, textAlign: 'center', lineHeight: 15 },
});
