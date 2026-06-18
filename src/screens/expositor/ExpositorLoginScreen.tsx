import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Animated, Platform, StatusBar, KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ExpositorStackParamList } from '../../navigation/types';
import { useApp } from '../../context/AppContext';

type Nav   = NativeStackNavigationProp<ExpositorStackParamList, 'ExpositorLogin'>;
type Route = RouteProp<ExpositorStackParamList, 'ExpositorLogin'>;

const T = {
  bg: '#F4EDD8', card: '#FFFDF8', dark: '#1A0A00',
  coffee: '#7B4A2A', amber: '#C8960C',
  green: '#1B5E20', greenLight: '#2E7D32', greenBg: '#E8F5E9',
  gold: '#B8860B', goldDark: '#8B6308', goldBg: '#FFF8E1',
  red: '#C62828', redBg: '#FFEBEE',
  muted: '#9B7B5A', border: '#E8D5A8', white: '#FFFFFF',
};

type ResultState = null | 'checking' | 'found' | 'not-found';

export default function ExpositorLoginScreen() {
  const nav   = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { tipo } = route.params;
  const { state } = useApp();

  const [cedula, setCedula]         = useState('');
  const [result, setResult]         = useState<ResultState>(null);
  const [foundName, setFoundName]   = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const resultAnim = useRef(new Animated.Value(0)).current;

  const pendingTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    return () => { pendingTimers.current.forEach(clearTimeout); };
  }, []);

  const schedule = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    pendingTimers.current.push(id);
    return id;
  };

  const showResult = (r: ResultState) => {
    setResult(r);
    resultAnim.setValue(0);
    Animated.timing(resultAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  };

  const handleLogin = () => {
    const id = cedula.trim().replace(/\s/g, '');
    if (!id) return;
    showResult('checking');

    schedule(() => {
      const p = state.expositorPerfil;
      const match = p && p.cedula.replace(/\s/g, '') === id;

      if (match && p) {
        setFoundName(p.nombre);
        showResult('found');
        schedule(() => nav.replace('Dashboard'), 1500);
      } else {
        showResult('not-found');
        schedule(() => nav.navigate('ExpositorRegistro', { tipo, cedula: id }), 2000);
      }
    }, 700);
  };

  const isStand   = tipo === 'stand';
  const accentClr = isStand ? T.greenLight : T.gold;
  const bgLight   = isStand ? '#F0FFF4' : '#FFFDE7';
  const icon      = isStand ? '🏪' : '☕';
  const tipoLabel = isStand ? 'Stand de Exhibición' : 'Microlotes & Subastas';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor={T.coffee} />

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
            <Text style={s.backTxt}>← Volver</Text>
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerSub}>PORTAL EXPOSITORES</Text>
            <Text style={s.headerTitle}>Identificación</Text>
          </View>
          <View style={{ width: 64 }} />
        </View>

        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <Animated.View style={{ opacity: fadeAnim }}>

            {/* Tipo badge */}
            <View style={[s.tipoBadge, { backgroundColor: bgLight, borderColor: accentClr + '55' }]}>
              <Text style={s.tipoEmoji}>{icon}</Text>
              <Text style={[s.tipoLabel, { color: accentClr }]}>{tipoLabel}</Text>
            </View>

            <Text style={s.title}>¿Ya estás registrado?</Text>
            <Text style={s.subtitle}>
              Ingresa tu número de cédula para verificar si ya tienes un perfil en la feria.
            </Text>

            {/* Input */}
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>Número de Cédula</Text>
              <TextInput
                style={[s.input, { borderColor: result === 'found' ? T.greenLight : result === 'not-found' ? T.red : T.border }]}
                placeholder="Ej: 1 098 765 432"
                placeholderTextColor={T.muted}
                keyboardType="numeric"
                value={cedula}
                onChangeText={setCedula}
                onSubmitEditing={handleLogin}
                returnKeyType="search"
                maxLength={15}
                editable={result !== 'checking' && result !== 'found'}
              />
            </View>

            {/* Result feedback */}
            {result && (
              <Animated.View style={[s.resultBox, { opacity: resultAnim },
                result === 'checking' && { backgroundColor: '#EEE' },
                result === 'found'    && { backgroundColor: T.greenBg, borderColor: T.greenLight },
                result === 'not-found' && { backgroundColor: T.redBg, borderColor: T.red },
              ]}>
                {result === 'checking' && <Text style={s.resultTxt}>🔍  Buscando tu perfil...</Text>}
                {result === 'found'    && <Text style={[s.resultTxt, { color: T.green }]}>✅  ¡Hola {foundName.split(' ')[0]}! Ingresando...</Text>}
                {result === 'not-found' && <Text style={[s.resultTxt, { color: T.red }]}>⚠️  Cédula no encontrada. Te llevamos al registro.</Text>}
              </Animated.View>
            )}

            {/* Verify button */}
            <TouchableOpacity
              style={[s.btnPrimary, { backgroundColor: accentClr }, (!cedula.trim() || result === 'checking' || result === 'found') && { opacity: 0.45 }]}
              onPress={handleLogin}
              disabled={!cedula.trim() || result === 'checking' || result === 'found'}
              activeOpacity={0.8}
            >
              <Text style={s.btnPrimaryTxt}>
                {result === 'checking' ? 'Verificando...' : 'Verificar Acceso'}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={s.divider}>
              <View style={s.dividerLine} />
              <Text style={s.dividerTxt}>o</Text>
              <View style={s.dividerLine} />
            </View>

            {/* New registration */}
            <TouchableOpacity
              style={[s.btnSecondary, { borderColor: accentClr }]}
              onPress={() => nav.navigate('ExpositorRegistro', { tipo })}
              activeOpacity={0.8}
            >
              <Text style={[s.btnSecondaryTxt, { color: accentClr }]}>
                Registrarme por primera vez
              </Text>
            </TouchableOpacity>

            <Text style={s.footerNote}>
              Tu información es usada únicamente para gestionar tu participación en la Feria Internacional del Café Chaparral 2026.
            </Text>
          </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: T.bg },
  header:       { backgroundColor: T.coffee, paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight ?? 24) + 8, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn:      { padding: 6 },
  backTxt:      { color: '#FFF', fontSize: 14, fontWeight: '600' },
  headerCenter: { alignItems: 'center' },
  headerSub:    { color: 'rgba(255,255,255,0.75)', fontSize: 9, letterSpacing: 1.5, fontWeight: '700' },
  headerTitle:  { color: T.amber, fontSize: 15, fontWeight: '800', letterSpacing: 1 },
  scroll:       { padding: 24, paddingBottom: 40 },
  tipoBadge:    { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderRadius: 14, padding: 14, marginBottom: 24 },
  tipoEmoji:    { fontSize: 28 },
  tipoLabel:    { fontSize: 15, fontWeight: '700' },
  title:        { fontSize: 22, fontWeight: '800', color: T.dark, marginBottom: 8 },
  subtitle:     { fontSize: 14, color: T.muted, lineHeight: 20, marginBottom: 24 },
  inputGroup:   { marginBottom: 12 },
  inputLabel:   { fontSize: 12, fontWeight: '700', color: T.coffee, marginBottom: 6, letterSpacing: 0.5 },
  input:        { backgroundColor: T.white, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 18, color: T.dark, letterSpacing: 1 },
  resultBox:    { borderWidth: 1.5, borderRadius: 12, padding: 14, marginBottom: 16 },
  resultTxt:    { fontSize: 14, fontWeight: '600', color: T.muted },
  btnPrimary:   { borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 16 },
  btnPrimaryTxt:{ color: '#FFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  divider:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  dividerLine:  { flex: 1, height: 1, backgroundColor: T.border },
  dividerTxt:   { color: T.muted, fontSize: 13 },
  btnSecondary: { borderWidth: 1.5, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 24 },
  btnSecondaryTxt: { fontSize: 14, fontWeight: '700' },
  footerNote:   { textAlign: 'center', color: T.muted, fontSize: 11, lineHeight: 16 },
});
