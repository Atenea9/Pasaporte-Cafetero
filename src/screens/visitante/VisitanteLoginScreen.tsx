import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { VisitanteNavProp } from '../../navigation/types';
import LangSelector from '../../components/LangSelector';
import { useApp } from '../../context/AppContext';

const T = {
  bg:         '#FBF7ED',
  card:       '#FFFDF8',
  dark:       '#2C1A0E',
  body:       '#5C3520',
  muted:      '#9B7B5A',
  amber:      '#C8960C',
  amberLight: '#E8B820',
  amberPale:  '#FBF0C8',
  coffee:     '#7B4A2A',
  coffeeDark: '#5C3520',
  border:     '#EDD9A8',
  green:      '#2D5A1E',
  greenPale:  '#E8F2E4',
  red:        '#C0392B',
  redPale:    '#FDECEA',
};

type Result = null | 'checking' | 'found' | 'not-found';

export default function VisitanteLoginScreen() {
  const nav              = useNavigation<VisitanteNavProp>();
  const { t }           = useTranslation();
  const { state }       = useApp();
  const [identifier, setIdentifier] = useState('');
  const [mode, setMode]             = useState<'cedula' | 'phone'>('cedula');
  const [result, setResult]         = useState<Result>(null);
  const [foundName, setFoundName]   = useState('');

  const checkAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(30)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;

  const handleBack = () => {
    if (nav.canGoBack()) nav.goBack();
    else nav.navigate('Welcome');
  };

  const showResult = (r: 'found' | 'not-found') => {
    setResult(r);
    checkAnim.setValue(0);
    slideAnim.setValue(20);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.spring(checkAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(slideAnim,  { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(fadeAnim,   { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = () => {
    const id = identifier.trim();
    if (!id) {
      setResult(null);
      return;
    }

    setResult('checking');

    // Small delay to show checking state
    setTimeout(() => {
      const u = state.usuario;
      let isRegistered = false;

      if (u) {
        if (mode === 'cedula') {
          isRegistered = u.cedula?.trim() === id || u.cedula?.trim().replace(/[^0-9]/g, '') === id.replace(/[^0-9]/g, '');
        } else {
          // Phone mode — match against whatsapp, ignoring country code variations
          const normalise = (n: string) => n.replace(/\D/g, '').slice(-9);
          isRegistered = normalise(u.whatsapp ?? '') === normalise(id);
        }
      }

      if (isRegistered && u) {
        setFoundName(u.nombre);
        showResult('found');
        setTimeout(() => nav.navigate('Inicio'), 1600);
      } else {
        showResult('not-found');
        setTimeout(() => {
          nav.navigate('Registro', { cedula: mode === 'cedula' ? id : undefined, fromLogin: true });
        }, 1800);
      }
    }, 600);
  };

  const isChecking = result === 'checking';

  const cedulaLabel = mode === 'cedula'
    ? t('login.cedula_label', 'NÚMERO DE CÉDULA / DOCUMENTO')
    : t('login.phone_label', 'NÚMERO DE TELÉFONO / WHATSAPP');

  const placeholder = mode === 'cedula'
    ? t('login.cedula_placeholder', 'Ej: 1107654321')
    : t('login.phone_placeholder', 'Ej: +573156789012');

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      <View style={s.langBar}>
        <LangSelector light />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          <TouchableOpacity style={s.backBtn} onPress={handleBack}>
            <Text style={s.backIcon}>‹</Text>
            <Text style={s.backText}>{t('common.back', '‹ Volver')}</Text>
          </TouchableOpacity>

          <LinearGradient colors={[T.coffeeDark, T.coffee]} style={s.headerStrip}>
            <Text style={s.headerEmoji}>🪪</Text>
            <Text style={s.headerTitle}>{t('login.sign_in', 'Iniciar sesión')}</Text>
            <Text style={s.headerSub}>{t('login.subtitle_visitor', 'Ingresa con tu cédula o teléfono registrado')}</Text>
          </LinearGradient>

          {/* Mode toggle */}
          <View style={s.toggle}>
            {(['cedula', 'phone'] as const).map(m => (
              <TouchableOpacity
                key={m}
                style={[s.toggleBtn, mode === m && s.toggleBtnActive]}
                onPress={() => { setMode(m); setResult(null); }}
              >
                <Text style={[s.toggleText, mode === m && s.toggleTextActive]}>
                  {m === 'cedula' ? `🪪 ${t('login.cedula_tab', 'Cédula')}` : `📱 ${t('login.phone_tab', 'Teléfono')}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Input */}
          <View style={s.inputGroup}>
            <Text style={s.label}>{cedulaLabel}</Text>
            <TextInput
              style={[
                s.input,
                result === 'found'     && s.inputFound,
                result === 'not-found' && s.inputNotFound,
              ]}
              value={identifier}
              onChangeText={v => { setIdentifier(v); setResult(null); }}
              placeholder={placeholder}
              placeholderTextColor={T.muted}
              keyboardType={mode === 'phone' ? 'phone-pad' : 'numeric'}
              autoFocus
              editable={!isChecking && result === null}
            />
          </View>

          {/* Result feedback card */}
          {(result === 'found' || result === 'not-found') && (
            <Animated.View style={[
              s.resultCard,
              result === 'found' ? s.resultCardFound : s.resultCardNotFound,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: checkAnim }] },
            ]}>
              <Animated.Text style={[s.resultIcon, { transform: [{ scale: checkAnim }] }]}>
                {result === 'found' ? '✅' : '⚠️'}
              </Animated.Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.resultTitle, result === 'found' ? s.resultTitleFound : s.resultTitleNotFound]}>
                  {result === 'found'
                    ? `¡Bienvenido de vuelta!`
                    : 'Pasaporte no encontrado'}
                </Text>
                <Text style={s.resultSub}>
                  {result === 'found'
                    ? foundName
                    : 'Te llevaremos a crear tu pasaporte…'}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Login button */}
          {(result === null || result === 'checking') && (
            <TouchableOpacity
              style={[s.loginBtn, (isChecking || !identifier.trim()) && { opacity: 0.65 }]}
              onPress={handleLogin}
              disabled={isChecking || !identifier.trim()}
              activeOpacity={0.85}
            >
              <LinearGradient colors={[T.coffeeDark, T.coffee]} style={s.loginGrad}>
                {isChecking
                  ? <ActivityIndicator color="#FFF" />
                  : <Text style={s.loginBtnText}>{t('login.enter_passport', 'INGRESAR AL PASAPORTE')}</Text>
                }
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Divider + create */}
          {result === null && (
            <>
              <View style={s.divider}>
                <View style={s.divLine} />
                <Text style={s.divText}>{t('login.no_passport', '¿No tienes pasaporte?')}</Text>
                <View style={s.divLine} />
              </View>

              <TouchableOpacity style={s.createBtn} onPress={() => nav.navigate('Registro', {})} activeOpacity={0.85}>
                <Text style={s.createBtnText}>{t('login.create_free', '📝 Crear mi pasaporte gratis')}</Text>
              </TouchableOpacity>
            </>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: T.bg },
  langBar: { position: 'absolute', top: 12, right: 16, zIndex: 20 },
  scroll:  { flexGrow: 1, padding: 24, paddingTop: 8 },

  backBtn:  { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 20, alignSelf: 'flex-start', padding: 8, marginLeft: -8, marginTop: 40 },
  backIcon: { fontSize: 28, color: T.coffee, lineHeight: 32, fontWeight: '300' },
  backText: { fontSize: 15, color: T.coffee, fontWeight: '600' },

  headerStrip: { borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 28, gap: 6 },
  headerEmoji: { fontSize: 48 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#FFF' },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 18, paddingHorizontal: 10 },

  toggle:          { flexDirection: 'row', backgroundColor: T.border, borderRadius: 14, padding: 4, marginBottom: 24 },
  toggleBtn:       { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: T.coffee },
  toggleText:      { fontSize: 13, fontWeight: '700', color: T.muted },
  toggleTextActive:{ color: '#FFF' },

  inputGroup: { marginBottom: 20 },
  label:      { fontSize: 10, fontWeight: '800', color: T.amber, letterSpacing: 1.2, marginBottom: 8 },
  input:      { backgroundColor: T.card, borderWidth: 1.5, borderColor: T.border, borderRadius: 14, padding: 16, fontSize: 16, color: T.dark },
  inputFound:    { borderColor: T.green, backgroundColor: T.greenPale },
  inputNotFound: { borderColor: T.red,  backgroundColor: T.redPale },

  resultCard:         { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1.5 },
  resultCardFound:    { backgroundColor: T.greenPale, borderColor: T.green + '60' },
  resultCardNotFound: { backgroundColor: T.redPale,   borderColor: T.red  + '40' },
  resultIcon:         { fontSize: 36 },
  resultTitle:        { fontSize: 15, fontWeight: '900' },
  resultTitleFound:   { color: T.green },
  resultTitleNotFound:{ color: T.red },
  resultSub:          { fontSize: 12, color: T.muted, marginTop: 2 },

  loginBtn:     { borderRadius: 16, overflow: 'hidden', marginBottom: 4, shadowColor: T.coffeeDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  loginGrad:    { padding: 18, alignItems: 'center' },
  loginBtnText: { fontSize: 15, fontWeight: '900', color: '#FFF', letterSpacing: 1 },

  divider:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 24 },
  divLine:  { flex: 1, height: 1, backgroundColor: T.border },
  divText:  { fontSize: 12, color: T.muted, flexShrink: 0 },

  createBtn:    { backgroundColor: T.card, borderRadius: 16, padding: 18, alignItems: 'center', borderWidth: 1.5, borderColor: T.amber },
  createBtnText:{ fontSize: 15, fontWeight: '700', color: T.amber },
});
