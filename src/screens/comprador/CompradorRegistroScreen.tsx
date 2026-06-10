import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, KeyboardAvoidingView,
  Platform, Alert, Animated, Easing, SafeAreaView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompradorStackParamList } from '../../navigation/types';
import { useApp } from '../../context/AppContext';
import CedulaScanner, { ScannedData } from '../../components/CedulaScanner';

const T = {
  bg:         '#FAF7F0',
  card:       '#FFFFFF',
  dark:       '#2C1810',
  body:       '#4A3728',
  muted:      '#8A7060',
  gold:       '#B8860B',
  goldLight:  '#D4A520',
  goldPale:   '#F5E6B0',
  green:      '#2D5A1E',
  greenLight: '#4A8030',
  greenPale:  '#E8F2E4',
  border:     '#E8D5B0',
};

export const CompradorRegistroScreen = () => {
  const { dispatch, state } = useApp();
  const navigation = useNavigation<NativeStackNavigationProp<CompradorStackParamList>>();

  const [cedula,      setCedula]      = useState('');
  const [nombre,      setNombre]      = useState('');
  const [whatsapp,    setWhatsapp]    = useState('');
  const [pais,        setPais]        = useState('');
  const [estado,      setEstado]      = useState('');
  const [ciudad,      setCiudad]      = useState('');
  const [termsOk,     setTermsOk]     = useState(false);
  const [dataOk,      setDataOk]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedOk,   setScannedOk]   = useState(false);

  const scanSuccessScale = useRef(new Animated.Value(0)).current;
  const prizeShimmer     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state.usuario) navigation.navigate('Dashboard');
  }, [state.usuario]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(prizeShimmer, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(prizeShimmer, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const handleScanned = (data: ScannedData) => {
    setCedula(data.cedula);
    setNombre(data.nombre);
    setPais(data.pais);
    setEstado(data.estado);
    setCiudad(data.ciudad);
    setScannedOk(true);
    scanSuccessScale.setValue(0);
    Animated.spring(scanSuccessScale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  };

  const registrar = () => {
    if (!cedula || !nombre || !whatsapp || !pais || !estado || !ciudad) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos para crear tu pasaporte.');
      return;
    }
    if (!termsOk) {
      Alert.alert('Términos requeridos', 'Debes aceptar los Términos y Condiciones para continuar.');
      return;
    }
    if (!dataOk) {
      Alert.alert('Autorización requerida', 'Debes autorizar el tratamiento de tus datos personales para continuar.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      dispatch({
        type: 'SET_USUARIO',
        payload: { cedula, nombre, whatsapp, pais, estado, ciudad, puntos: 0, nivel: 'Comprador Internacional', sellos: [], creadoEn: Date.now() },
      });
      setLoading(false);
      navigation.navigate('Dashboard');
    }, 1000);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <CedulaScanner visible={scannerOpen} onScanned={handleScanned} onClose={() => setScannerOpen(false)} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Back */}
          <View style={s.topBar}>
            <TouchableOpacity style={s.backBtn} onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Welcome')}>
              <Text style={s.backIcon}>‹</Text>
              <Text style={s.backText}>Volver</Text>
            </TouchableOpacity>
          </View>

          {/* Hero */}
          <LinearGradient colors={['#1E3A8A', '#2563EB', '#1E3A8A']} style={s.hero}>
            <Text style={s.heroEmoji}>🌍</Text>
            <Text style={s.heroTitle}>REGISTRO{'\n'}COMPRADOR INTERNACIONAL</Text>
            <View style={s.heroPills}>
              {['Café Especial', 'Subastas', 'Contacto Directo'].map(p => (
                <View key={p} style={s.heroPill}><Text style={s.heroPillText}>{p}</Text></View>
              ))}
            </View>
          </LinearGradient>

          <View style={s.form}>

            {/* Prize Box */}
            <Animated.View style={[s.prizeBox, {
              backgroundColor: prizeShimmer.interpolate({ inputRange: [0, 1], outputRange: [T.goldPale, '#FFF8E0'] }),
              borderColor: prizeShimmer.interpolate({ inputRange: [0, 1], outputRange: [T.gold + '60', T.gold] }),
            }]}>
              <Text style={s.prizeTop}>🏆 ACCEDE A LO EXCLUSIVO</Text>
              <Text style={s.prizeMain}>
                Como comprador internacional accedes a{'\n'}
                <Text style={s.prizeHighlight}>subastas en vivo</Text>  ·  <Text style={s.prizeHighlight}>perfiles de finca</Text>  ·  <Text style={s.prizeHighlight}>análisis SCA</Text>
              </Text>
            </Animated.View>

            {/* Scan */}
            <TouchableOpacity style={s.scanCard} onPress={() => setScannerOpen(true)} activeOpacity={0.85}>
              <View style={s.scanIconWrap}>
                <Text style={s.scanIconBig}>📷</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.scanTitle}>ESCANEAR DOCUMENTO</Text>
                <Text style={s.scanSub}>Cédula · Pasaporte · DNI · ID extranjero</Text>
              </View>
              <Text style={s.scanArrow}>›</Text>
            </TouchableOpacity>

            {scannedOk && (
              <Animated.View style={[s.scannedBadge, { transform: [{ scale: scanSuccessScale }] }]}>
                <Text style={s.scannedText}>✅ Documento leído — solo falta tu WhatsApp</Text>
              </Animated.View>
            )}

            <Text style={s.orText}>— o ingresa los datos manualmente —</Text>

            {[
              { label: 'NÚMERO DE CÉDULA / PASAPORTE / ID', val: cedula, set: setCedula, ph: 'Ej: A12345678 · 1107654321', kb: 'default' as const },
              { label: 'NOMBRE COMPLETO', val: nombre, set: setNombre, ph: 'Ej: James Alexander Whitfield', kb: 'default' as const, cap: 'words' as const },
            ].map(f => (
              <View key={f.label} style={s.fieldGroup}>
                <Text style={s.label}>{f.label}</Text>
                <TextInput style={[s.input, scannedOk && s.inputFilled]} value={f.val} onChangeText={f.set} placeholder={f.ph} placeholderTextColor={T.muted} autoCapitalize={f.cap} />
              </View>
            ))}

            <View style={[s.fieldGroup, scannedOk && s.fieldGroupHighlight]}>
              <Text style={[s.label, scannedOk && s.labelHighlight]}>
                {scannedOk ? '📲 WHATSAPP — ¡SOLO FALTA ESTE CAMPO!' : 'NÚMERO DE WHATSAPP (con código de país)'}
              </Text>
              <TextInput
                style={[s.input, scannedOk && s.inputHighlight]}
                value={whatsapp} onChangeText={setWhatsapp}
                placeholder="Ej: +12025550123  /  +573156789012"
                placeholderTextColor={T.muted}
                keyboardType="phone-pad"
                autoFocus={scannedOk}
              />
              <Text style={s.fieldHint}>Include country code · e.g. +1 USA, +57 Colombia, +44 UK</Text>
            </View>

            <View style={s.sectionDiv}>
              <View style={s.sectionLine} />
              <Text style={s.sectionLbl}>📍 LOCATION</Text>
              <View style={s.sectionLine} />
            </View>

            {[
              { label: 'PAÍS / COUNTRY', val: pais, set: setPais, ph: 'Ej: USA, Germany, Colombia...' },
              { label: 'STATE / PROVINCE / DEPARTMENT', val: estado, set: setEstado, ph: 'Ej: California, Bavaria, Tolima...' },
              { label: 'CITY / CIUDAD', val: ciudad, set: setCiudad, ph: 'Ej: New York, Berlin, Bogotá...' },
            ].map(f => (
              <View key={f.label} style={s.fieldGroup}>
                <Text style={s.label}>{f.label}</Text>
                <TextInput style={[s.input, scannedOk && s.inputFilled]} value={f.val} onChangeText={f.set} placeholder={f.ph} placeholderTextColor={T.muted} autoCapitalize="words" />
              </View>
            ))}

            {nombre.length > 0 && (
              <View style={s.preview}>
                <Text style={s.previewTitle}>PASSPORT PREVIEW</Text>
                <View style={s.previewCard}>
                  <View style={s.previewAvatar}>
                    <Text style={s.previewAvatarText}>{nombre.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.previewNombre}>{nombre}</Text>
                    <Text style={s.previewLoc}>{[ciudad, pais].filter(Boolean).join(' · ') || '—'}</Text>
                    <View style={s.previewBadge}>
                      <Text style={s.previewBadgeText}>🌍 Comprador Internacional</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 30 }}>🌐</Text>
                </View>
              </View>
            )}

            <View style={s.sectionDiv}>
              <View style={s.sectionLine} />
              <Text style={s.sectionLbl}>📋 AUTORIZACIÓN</Text>
              <View style={s.sectionLine} />
            </View>

            {[
              { checked: termsOk, toggle: () => setTermsOk(v => !v), text: 'Acepto los ', link: 'Términos y Condiciones', rest: ' de la Feria Internacional de Café de Chaparral, Tolima 2026.' },
              { checked: dataOk,  toggle: () => setDataOk(v => !v),  text: 'Autorizo el tratamiento de mis datos conforme a la ', link: 'Ley 1581 de 2012', rest: ' (Habeas Data) de Colombia.' },
            ].map((c, i) => (
              <TouchableOpacity key={i} style={s.checkRow} onPress={c.toggle} activeOpacity={0.75}>
                <View style={[s.checkbox, c.checked && s.checkboxChecked]}>
                  {c.checked && <Text style={s.checkmark}>✓</Text>}
                </View>
                <Text style={s.checkText}>
                  {c.text}<Text style={s.checkLink}>{c.link}</Text>{c.rest}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[s.createBtn, loading && { opacity: 0.7 }]}
              onPress={registrar}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#FFF" />
                : <Text style={s.createBtnText}>🌐 CREAR PASAPORTE INTERNACIONAL</Text>}
            </TouchableOpacity>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CompradorRegistroScreen;

const s = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: T.bg },
  topBar:             { padding: 16, paddingBottom: 0 },
  backBtn:            { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', padding: 4, marginLeft: -4 },
  backIcon:           { fontSize: 28, color: T.green, lineHeight: 32, fontWeight: '300' },
  backText:           { fontSize: 15, color: T.green, fontWeight: '600' },

  hero:               { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 28, alignItems: 'center', gap: 10 },
  heroEmoji:          { fontSize: 52 },
  heroTitle:          { fontSize: 22, fontWeight: '900', color: '#FFF', textAlign: 'center', letterSpacing: 0.5, lineHeight: 28 },
  heroPills:          { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  heroPill:           { backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  heroPillText:       { fontSize: 11, fontWeight: '700', color: '#FFF' },

  form:               { padding: 16 },

  prizeBox:           { borderRadius: 14, borderWidth: 1.5, padding: 16, marginBottom: 18, gap: 8 },
  prizeTop:           { fontSize: 10, fontWeight: '900', color: T.gold, letterSpacing: 2 },
  prizeMain:          { fontSize: 13, color: T.body, lineHeight: 22 },
  prizeHighlight:     { color: T.gold, fontWeight: '800' },

  scanCard:           { borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, marginBottom: 14, backgroundColor: T.card, borderWidth: 1, borderColor: T.border, shadowColor: T.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 5, elevation: 2 },
  scanIconWrap:       { width: 50, height: 50, borderRadius: 25, backgroundColor: T.greenPale, alignItems: 'center', justifyContent: 'center' },
  scanIconBig:        { fontSize: 24 },
  scanTitle:          { fontSize: 12, fontWeight: '900', color: T.dark },
  scanSub:            { fontSize: 10, color: T.muted, marginTop: 2 },
  scanArrow:          { fontSize: 26, color: T.gold, fontWeight: '300' },

  scannedBadge:       { backgroundColor: T.greenPale, borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: T.green + '50', alignItems: 'center' },
  scannedText:        { fontSize: 12, color: T.green, fontWeight: '700' },

  orText:             { textAlign: 'center', color: T.muted, fontSize: 11, marginBottom: 16 },
  fieldGroup:         { marginBottom: 16 },
  fieldGroupHighlight:{ backgroundColor: T.goldPale, borderRadius: 12, padding: 10, marginHorizontal: -6, marginBottom: 16 },
  label:              { fontSize: 10, fontWeight: '800', color: T.gold, letterSpacing: 1, marginBottom: 6 },
  labelHighlight:     { color: T.goldLight, fontSize: 11 },
  input:              { backgroundColor: T.card, borderWidth: 1, borderColor: T.border, borderRadius: 12, padding: 14, fontSize: 14, color: T.dark },
  inputFilled:        { borderColor: T.green + '60', backgroundColor: T.greenPale },
  inputHighlight:     { borderColor: T.gold, borderWidth: 1.5, backgroundColor: T.goldPale + '80', fontSize: 15 },
  fieldHint:          { fontSize: 10, color: T.muted, marginTop: 4, lineHeight: 15 },

  sectionDiv:         { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, marginTop: 4 },
  sectionLine:        { flex: 1, height: 1, backgroundColor: T.border },
  sectionLbl:         { fontSize: 9, fontWeight: '900', color: T.gold, letterSpacing: 2 },

  preview:            { marginBottom: 20 },
  previewTitle:       { fontSize: 10, fontWeight: '800', color: T.gold, letterSpacing: 1, marginBottom: 8 },
  previewCard:        { backgroundColor: T.card, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: T.border },
  previewAvatar:      { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1565C0', alignItems: 'center', justifyContent: 'center' },
  previewAvatarText:  { fontSize: 20, fontWeight: '800', color: '#FFF' },
  previewNombre:      { fontSize: 14, fontWeight: '700', color: T.dark },
  previewLoc:         { fontSize: 11, color: T.muted, marginTop: 2 },
  previewBadge:       { marginTop: 6, backgroundColor: '#EBF2FB', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  previewBadgeText:   { fontSize: 10, color: '#1565C0', fontWeight: '600' },

  checkRow:           { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 14 },
  checkbox:           { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: T.border, backgroundColor: T.card, alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 },
  checkboxChecked:    { backgroundColor: T.green, borderColor: T.green },
  checkmark:          { fontSize: 13, fontWeight: '900', color: '#FFF' },
  checkText:          { flex: 1, fontSize: 12, color: T.body, lineHeight: 18 },
  checkLink:          { color: T.green, fontWeight: '700' },

  createBtn:          { backgroundColor: '#1565C0', borderRadius: 20, padding: 18, alignItems: 'center', marginTop: 8, marginBottom: 12, shadowColor: '#1565C0', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  createBtnText:      { fontSize: 14, fontWeight: '900', color: '#FFF', letterSpacing: 0.3 },
});
