import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TextInput,
  TouchableOpacity, SafeAreaView, StatusBar,
  Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { VisitanteStackParamList } from '../navigation/types';
import { useApp } from '../context/AppContext';

const C = {
  bg: '#0B1608', card: '#142210', card2: '#1C3018',
  gold: '#CFA020', goldLight: '#EAC040', goldGlow: '#CFA02022',
  green: '#2E5016', text: '#F3EED6', muted: '#6A8060',
  border: '#CFA02022', borderBright: '#CFA02055',
};

export default function RegistroScreen({ onRegistrado }: { onRegistrado?: () => void }) {
  const { dispatch, state } = useApp();
  const navigation = useNavigation<NativeStackNavigationProp<VisitanteStackParamList>>();

  const [cedula, setCedula]   = useState('');
  const [nombre, setNombre]   = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [pais, setPais]       = useState('');
  const [estado, setEstado]   = useState('');
  const [ciudad, setCiudad]   = useState('');
  const [termsOk, setTermsOk] = useState(false);
  const [dataOk, setDataOk]   = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state.usuario) navigation.navigate('Inicio');
  }, [state.usuario]);

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
      const usuario = {
        cedula, nombre, whatsapp,
        pais, estado, ciudad,
        puntos: 0, nivel: 'Visitante',
        sellos: [], creadoEn: Date.now(),
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
      onRegistrado?.();
      navigation.navigate('Inicio');
    }, 1200);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.card} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <View style={s.header}>
            <Text style={s.headerIcon}>🌿</Text>
            <View>
              <Text style={s.brand1}>PASAPORTE CAFETERO</Text>
              <Text style={s.brand2}>Feria Internacional del Café · Chaparral 2026</Text>
            </View>
          </View>

          <View style={s.hero}>
            <Text style={s.heroEmoji}>🪪</Text>
            <Text style={s.heroTitle}>CREA TU PASAPORTE{'\n'}CAFETERO</Text>
            <Text style={s.heroSub}>
              Regístrate en menos de 60 segundos y empieza a coleccionar sellos, sumar puntos y ganar premios.
            </Text>
          </View>

          <View style={s.form}>

            <View style={s.fieldGroup}>
              <Text style={s.label}>NÚMERO DE CÉDULA / DOCUMENTO</Text>
              <TextInput
                style={s.input} value={cedula} onChangeText={setCedula}
                placeholder="Ej: 1107654321" placeholderTextColor={C.muted}
                keyboardType="default" maxLength={20}
              />
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.label}>NOMBRE COMPLETO</Text>
              <TextInput
                style={s.input} value={nombre} onChangeText={setNombre}
                placeholder="Ej: Carlos Andrés Rojas" placeholderTextColor={C.muted}
                autoCapitalize="words"
              />
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.label}>NÚMERO DE WHATSAPP (con código de país)</Text>
              <TextInput
                style={s.input} value={whatsapp} onChangeText={setWhatsapp}
                placeholder="Ej: +573156789012  /  +12025550123" placeholderTextColor={C.muted}
                keyboardType="phone-pad"
              />
              <Text style={s.fieldHint}>Incluye el código de país · Ej: +57 Colombia, +1 EE.UU., +55 Brasil</Text>
            </View>

            <View style={s.sectionDivider}>
              <View style={s.sectionLine} />
              <Text style={s.sectionLabel}>📍 UBICACIÓN</Text>
              <View style={s.sectionLine} />
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.label}>PAÍS</Text>
              <TextInput
                style={s.input} value={pais} onChangeText={setPais}
                placeholder="Ej: Colombia, México, España..." placeholderTextColor={C.muted}
                autoCapitalize="words"
              />
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.label}>DEPARTAMENTO / ESTADO / PROVINCIA</Text>
              <TextInput
                style={s.input} value={estado} onChangeText={setEstado}
                placeholder="Ej: Tolima, Cundinamarca, Texas..." placeholderTextColor={C.muted}
                autoCapitalize="words"
              />
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.label}>CIUDAD / MUNICIPIO</Text>
              <TextInput
                style={s.input} value={ciudad} onChangeText={setCiudad}
                placeholder="Ej: Chaparral, Bogotá, Miami..." placeholderTextColor={C.muted}
                autoCapitalize="words"
              />
            </View>

            {nombre.length > 0 && (
              <View style={s.preview}>
                <Text style={s.previewTitle}>VISTA PREVIA DE TU PASAPORTE</Text>
                <View style={s.previewCard}>
                  <View style={s.previewAvatar}>
                    <Text style={s.previewAvatarText}>{nombre.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.previewNombre}>{nombre}</Text>
                    <Text style={s.previewLoc}>
                      {[ciudad, estado, pais].filter(Boolean).join(' · ') || '—'}
                    </Text>
                    <View style={s.previewBadge}>
                      <Text style={s.previewBadgeText}>⭐ Visitante · 0 puntos</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 32 }}>🪪</Text>
                </View>
              </View>
            )}

            <View style={s.sectionDivider}>
              <View style={s.sectionLine} />
              <Text style={s.sectionLabel}>📋 AUTORIZACIÓN</Text>
              <View style={s.sectionLine} />
            </View>

            <TouchableOpacity style={s.checkRow} onPress={() => setTermsOk(v => !v)} activeOpacity={0.75}>
              <View style={[s.checkbox, termsOk && s.checkboxChecked]}>
                {termsOk && <Text style={s.checkmark}>✓</Text>}
              </View>
              <Text style={s.checkText}>
                Acepto los{' '}
                <Text style={s.checkLink}>Términos y Condiciones</Text>
                {' '}de la Feria Internacional de Café de Chaparral, Tolima 2026.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.checkRow} onPress={() => setDataOk(v => !v)} activeOpacity={0.75}>
              <View style={[s.checkbox, dataOk && s.checkboxChecked]}>
                {dataOk && <Text style={s.checkmark}>✓</Text>}
              </View>
              <Text style={s.checkText}>
                Autorizo el tratamiento de mis datos personales conforme a la{' '}
                <Text style={s.checkLink}>Ley 1581 de 2012</Text>
                {' '}(Habeas Data) de la República de Colombia y la política de privacidad de la Gobernación del Tolima.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.createBtn, loading && s.createBtnLoading]}
              onPress={registrar} activeOpacity={0.85} disabled={loading}
            >
              <Text style={s.createBtnText}>
                {loading ? 'CREANDO TU PASAPORTE...' : '🎉 CREAR MI PASAPORTE CAFETERO'}
              </Text>
            </TouchableOpacity>

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
  form: { padding: 16 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 10, fontWeight: '800', color: C.gold, letterSpacing: 1, marginBottom: 6 },
  input: { backgroundColor: C.card, borderWidth: 0.5, borderColor: C.borderBright, borderRadius: 10, padding: 14, fontSize: 14, color: C.text },
  fieldHint: { fontSize: 10, color: C.muted, marginTop: 4, lineHeight: 15 },
  sectionDivider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, marginTop: 4 },
  sectionLine: { flex: 1, height: 0.5, backgroundColor: C.borderBright },
  sectionLabel: { fontSize: 9, fontWeight: '900', color: C.gold, letterSpacing: 2 },
  preview: { marginBottom: 20 },
  previewTitle: { fontSize: 10, fontWeight: '800', color: C.gold, letterSpacing: 1, marginBottom: 8 },
  previewCard: { backgroundColor: C.card2, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: C.borderBright },
  previewAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' },
  previewAvatarText: { fontSize: 20, fontWeight: '800', color: C.bg },
  previewNombre: { fontSize: 14, fontWeight: '700', color: C.text },
  previewLoc: { fontSize: 11, color: C.muted, marginTop: 2 },
  previewBadge: { marginTop: 6, backgroundColor: C.green, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  previewBadgeText: { fontSize: 10, color: C.goldLight, fontWeight: '600' },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 14 },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: C.borderBright, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 },
  checkboxChecked: { backgroundColor: C.gold, borderColor: C.gold },
  checkmark: { fontSize: 12, fontWeight: '900', color: C.bg },
  checkText: { flex: 1, fontSize: 11, color: C.muted, lineHeight: 17 },
  checkLink: { color: C.goldLight, fontWeight: '700' },
  createBtn: { backgroundColor: C.gold, borderRadius: 30, padding: 18, alignItems: 'center', marginTop: 8, marginBottom: 12 },
  createBtnLoading: { opacity: 0.7 },
  createBtnText: { fontSize: 14, fontWeight: '900', color: C.bg, letterSpacing: 0.5 },
});
