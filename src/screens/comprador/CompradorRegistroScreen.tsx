import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, KeyboardAvoidingView,
  Platform, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompradorStackParamList } from '../../navigation/types';
import { useApp } from '../../context/AppContext';
import { PremiumTheme } from '../../theme/PremiumTheme';

const T = PremiumTheme.colors;

export const CompradorRegistroScreen = () => {
  const { dispatch, state } = useApp();
  const navigation = useNavigation<NativeStackNavigationProp<CompradorStackParamList>>();

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
    if (state.usuario) navigation.navigate('Dashboard');
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
      dispatch({
        type: 'SET_USUARIO',
        payload: {
          cedula, nombre, whatsapp,
          pais, estado, ciudad,
          puntos: 0, nivel: 'Comprador Internacional',
          sellos: [], creadoEn: Date.now(),
        },
      });
      setLoading(false);
      navigation.navigate('Dashboard');
    }, 1200);
  };

  return (
    <LinearGradient colors={[T.bgDark, T.bgMedium]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <Text style={styles.headerIcon}>🌿</Text>
            <View>
              <Text style={styles.brand1}>PASAPORTE CAFETERO</Text>
              <Text style={styles.brand2}>Feria Internacional del Café · Chaparral 2026</Text>
            </View>
          </View>

          <View style={styles.hero}>
            <Text style={styles.heroEmoji}>🪪</Text>
            <Text style={styles.heroTitle}>CREA TU PASAPORTE{'\n'}CAFETERO</Text>
            <Text style={styles.heroSub}>
              Regístrate en menos de 60 segundos y empieza a coleccionar sellos, sumar puntos y ganar premios.
            </Text>
          </View>

          <View style={styles.form}>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>NÚMERO DE CÉDULA / DOCUMENTO / PASAPORTE</Text>
              <TextInput style={styles.input} value={cedula} onChangeText={setCedula}
                placeholder="Ej: 1107654321 · A12345678" placeholderTextColor={T.textMuted}
                keyboardType="default" maxLength={20} />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>NOMBRE COMPLETO</Text>
              <TextInput style={styles.input} value={nombre} onChangeText={setNombre}
                placeholder="Ej: James Alexander Whitfield" placeholderTextColor={T.textMuted}
                autoCapitalize="words" />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>NÚMERO DE WHATSAPP (con código de país)</Text>
              <TextInput
                style={styles.input} value={whatsapp} onChangeText={setWhatsapp}
                placeholder="Ej: +573156789012  /  +12025550123" placeholderTextColor={T.textMuted}
                keyboardType="phone-pad"
              />
              <Text style={styles.fieldHint}>Incluye el código de país · Ej: +57 Colombia, +1 EE.UU., +55 Brasil</Text>
            </View>

            <View style={styles.sectionDivider}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionLabel}>📍 UBICACIÓN</Text>
              <View style={styles.sectionLine} />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>PAÍS / COUNTRY</Text>
              <TextInput style={styles.input} value={pais} onChangeText={setPais}
                placeholder="Ej: Colombia, USA, Germany..." placeholderTextColor={T.textMuted}
                autoCapitalize="words" />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>DEPARTAMENTO / STATE / PROVINCE</Text>
              <TextInput style={styles.input} value={estado} onChangeText={setEstado}
                placeholder="Ej: Tolima, California, Bavaria..." placeholderTextColor={T.textMuted}
                autoCapitalize="words" />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>CIUDAD / CITY</Text>
              <TextInput style={styles.input} value={ciudad} onChangeText={setCiudad}
                placeholder="Ej: Bogotá, New York, Berlin..." placeholderTextColor={T.textMuted}
                autoCapitalize="words" />
            </View>

            {nombre.length > 0 && (
              <View style={styles.preview}>
                <Text style={styles.previewTitle}>VISTA PREVIA DE TU PASAPORTE</Text>
                <View style={styles.previewCard}>
                  <View style={styles.previewAvatar}>
                    <Text style={styles.previewAvatarText}>{nombre.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.previewNombre}>{nombre}</Text>
                    <Text style={styles.previewLoc}>
                      {[ciudad, estado, pais].filter(Boolean).join(' · ') || '—'}
                    </Text>
                    <View style={styles.previewBadge}>
                      <Text style={styles.previewBadgeText}>🌍 Comprador Internacional · 0 puntos</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 32 }}>🪪</Text>
                </View>
              </View>
            )}

            <View style={styles.sectionDivider}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionLabel}>📋 AUTORIZACIÓN</Text>
              <View style={styles.sectionLine} />
            </View>

            <TouchableOpacity style={styles.checkRow} onPress={() => setTermsOk(v => !v)} activeOpacity={0.75}>
              <View style={[styles.checkbox, termsOk && styles.checkboxChecked]}>
                {termsOk && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkText}>
                Acepto los{' '}
                <Text style={styles.checkLink}>Términos y Condiciones</Text>
                {' '}de la Feria Internacional de Café de Chaparral, Tolima 2026.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.checkRow} onPress={() => setDataOk(v => !v)} activeOpacity={0.75}>
              <View style={[styles.checkbox, dataOk && styles.checkboxChecked]}>
                {dataOk && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkText}>
                Autorizo el tratamiento de mis datos personales conforme a la{' '}
                <Text style={styles.checkLink}>Ley 1581 de 2012</Text>
                {' '}(Habeas Data) de la República de Colombia y la política de privacidad de la Gobernación del Tolima.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.createBtn, loading && { opacity: 0.7 }]}
              onPress={registrar} activeOpacity={0.85} disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={T.bgDark} />
                : <Text style={styles.createBtnText}>🎉 CREAR MI PASAPORTE CAFETERO</Text>}
            </TouchableOpacity>

          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default CompradorRegistroScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 20, backgroundColor: 'rgba(0,0,0,0.4)' },
  headerIcon: { fontSize: 28 },
  brand1: { fontSize: 13, fontWeight: '900', color: T.goldPrimary, letterSpacing: 2 },
  brand2: { fontSize: 10, color: T.textMuted, marginTop: 2 },
  hero: { backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 20, paddingVertical: 28, alignItems: 'center' },
  heroEmoji: { fontSize: 56, marginBottom: 12 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: T.textLight, textAlign: 'center', letterSpacing: 1, marginBottom: 10 },
  heroSub: { fontSize: 13, color: T.textMuted, textAlign: 'center', lineHeight: 20 },
  form: { padding: 16 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 10, fontWeight: '800', color: T.goldPrimary, letterSpacing: 1, marginBottom: 6 },
  input: { backgroundColor: T.glassBg, borderWidth: 0.5, borderColor: T.goldPrimary + '50', borderRadius: 10, padding: 14, fontSize: 14, color: T.textLight },
  fieldHint: { fontSize: 10, color: T.textMuted, marginTop: 4, lineHeight: 15 },
  sectionDivider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, marginTop: 4 },
  sectionLine: { flex: 1, height: 0.5, backgroundColor: T.goldPrimary + '40' },
  sectionLabel: { fontSize: 9, fontWeight: '900', color: T.goldPrimary, letterSpacing: 2 },
  preview: { marginBottom: 20 },
  previewTitle: { fontSize: 10, fontWeight: '800', color: T.goldPrimary, letterSpacing: 1, marginBottom: 8 },
  previewCard: { backgroundColor: T.glassBg, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: T.goldPrimary + '60' },
  previewAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: T.goldPrimary, alignItems: 'center', justifyContent: 'center' },
  previewAvatarText: { fontSize: 20, fontWeight: '800', color: T.bgDark },
  previewNombre: { fontSize: 14, fontWeight: '700', color: T.textLight },
  previewLoc: { fontSize: 11, color: T.textMuted, marginTop: 2 },
  previewBadge: { marginTop: 6, backgroundColor: 'rgba(46,80,22,0.8)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  previewBadgeText: { fontSize: 10, color: T.goldLight, fontWeight: '600' },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 14 },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: T.goldPrimary + '80', backgroundColor: T.glassBg, alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 },
  checkboxChecked: { backgroundColor: T.goldPrimary, borderColor: T.goldPrimary },
  checkmark: { fontSize: 12, fontWeight: '900', color: T.bgDark },
  checkText: { flex: 1, fontSize: 11, color: T.textMuted, lineHeight: 17 },
  checkLink: { color: T.goldLight, fontWeight: '700' },
  createBtn: { backgroundColor: T.goldPrimary, borderRadius: 30, padding: 18, alignItems: 'center', marginTop: 8, marginBottom: 12 },
  createBtnText: { fontSize: 14, fontWeight: '900', color: T.bgDark, letterSpacing: 0.5 },
});
