import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, KeyboardAvoidingView,
  Platform, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompradorStackParamList } from '../../navigation/types';
import { useApp } from '../../context/AppContext';
import { MUNICIPIOS } from '../../data/mockData';
import { PremiumTheme } from '../../theme/PremiumTheme';

const MUNICIPIOS_TOLIMA = MUNICIPIOS.map(m => m.nombre);

export const CompradorRegistroScreen = () => {
  const { dispatch, state } = useApp();
  const navigation = useNavigation<NativeStackNavigationProp<CompradorStackParamList>>();

  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [showMunicipios, setShowMunicipios] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state.usuario) navigation.navigate('Dashboard');
  }, [state.usuario]);

  const simularEscaneo = () => {
    setCedula('110' + Math.floor(Math.random() * 9000000 + 1000000));
    setNombre('James Alexander Whitfield');
    setWhatsapp('3178901234');
    setMunicipio('Ibagué');
  };

  const registrar = () => {
    if (!cedula || !nombre || !whatsapp || !municipio) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos para crear tu pasaporte.');
      return;
    }
    if (whatsapp.length < 10) {
      Alert.alert('WhatsApp inválido', 'Ingresa un número válido de 10 dígitos.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      dispatch({
        type: 'SET_USUARIO',
        payload: {
          cedula, nombre, whatsapp, municipio,
          departamento: 'Tolima', puntos: 0,
          nivel: 'Comprador Internacional', sellos: [],
          creadoEn: Date.now(),
        },
      });
      setLoading(false);
      navigation.navigate('Dashboard');
    }, 1200);
  };

  return (
    <LinearGradient colors={[PremiumTheme.colors.bgDark, PremiumTheme.colors.bgMedium]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <Text style={styles.headerIcon}>🌿</Text>
            <View>
              <Text style={styles.brand1}>PASAPORTE CAFETERO</Text>
              <Text style={styles.brand2}>Feria Internacional del Café · Tolima 2026</Text>
            </View>
          </View>

          <View style={styles.hero}>
            <Text style={styles.heroEmoji}>🪪</Text>
            <Text style={styles.heroTitle}>CREA TU PASAPORTE{'\n'}CAFETERO</Text>
            <Text style={styles.heroSub}>
              Regístrate en menos de 60 segundos y empieza a coleccionar sellos, sumar puntos y ganar premios.
            </Text>
          </View>

          <View style={styles.pasosRow}>
            {['Cédula', 'WhatsApp', 'Municipio', '¡Listo!'].map((p, i) => (
              <View key={i} style={styles.paso}>
                <View style={[styles.pasoBubble, i === 0 && styles.pasoBubbleActive]}>
                  <Text style={styles.pasoNum}>{i + 1}</Text>
                </View>
                <Text style={styles.pasoLabel}>{p}</Text>
              </View>
            ))}
          </View>

          <View style={styles.form}>

            <TouchableOpacity style={styles.scanBtn} onPress={simularEscaneo} activeOpacity={0.8}>
              <Text style={styles.scanIcon}>📷</Text>
              <View>
                <Text style={styles.scanTitle}>SIMULAR ESCANEO DE CÉDULA</Text>
                <Text style={styles.scanSub}>Auto-rellena los datos para la demo</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.orText}>— o ingresa los datos manualmente —</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>NÚMERO DE CÉDULA / PASSPORT</Text>
              <TextInput style={styles.input} value={cedula} onChangeText={setCedula}
                placeholder="Ej: 1107654321" placeholderTextColor={PremiumTheme.colors.textMuted}
                keyboardType="numeric" maxLength={12} />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>NOMBRE COMPLETO</Text>
              <TextInput style={styles.input} value={nombre} onChangeText={setNombre}
                placeholder="Ej: James Alexander Whitfield" placeholderTextColor={PremiumTheme.colors.textMuted}
                autoCapitalize="words" />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>NÚMERO DE WHATSAPP</Text>
              <View style={styles.inputRow}>
                <View style={styles.prefix}><Text style={styles.prefixText}>🇨🇴 +57</Text></View>
                <TextInput
                  style={[styles.input, { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}
                  value={whatsapp} onChangeText={setWhatsapp}
                  placeholder="3156789012" placeholderTextColor={PremiumTheme.colors.textMuted}
                  keyboardType="phone-pad" maxLength={10} />
              </View>
              <Text style={styles.fieldHint}>Recibirás notificaciones y soporte por WhatsApp</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>MUNICIPIO DE RESIDENCIA</Text>
              <TouchableOpacity style={[styles.input, styles.selectBtn]} onPress={() => setShowMunicipios(!showMunicipios)} activeOpacity={0.8}>
                <Text style={municipio ? styles.selectText : styles.selectPlaceholder}>
                  {municipio || 'Selecciona tu municipio del Tolima'}
                </Text>
                <Text style={styles.selectArrow}>{showMunicipios ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showMunicipios && (
                <View style={styles.dropdown}>
                  {MUNICIPIOS_TOLIMA.map((m, i) => (
                    <TouchableOpacity key={i} style={[styles.dropItem, municipio === m && styles.dropItemActive]}
                      onPress={() => { setMunicipio(m); setShowMunicipios(false); }}>
                      <Text style={styles.dropEmoji}>{MUNICIPIOS[i].emoji}</Text>
                      <Text style={[styles.dropText, municipio === m && styles.dropTextActive]}>{m}</Text>
                      {municipio === m && <Text style={styles.dropCheck}>✓</Text>}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>DEPARTAMENTO</Text>
              <View style={[styles.input, { opacity: 0.7, flexDirection: 'row', alignItems: 'center' }]}>
                <Text style={{ color: PremiumTheme.colors.textMuted, fontSize: 14 }}>📍 Tolima, Colombia</Text>
              </View>
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
                    <Text style={styles.previewMun}>{municipio || '—'} · Tolima</Text>
                    <View style={styles.previewBadge}>
                      <Text style={styles.previewBadgeText}>🌍 Comprador Internacional · 0 puntos</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 32 }}>🪪</Text>
                </View>
              </View>
            )}

            <TouchableOpacity style={[styles.createBtn, loading && { opacity: 0.7 }]}
              onPress={registrar} activeOpacity={0.85} disabled={loading}>
              {loading
                ? <ActivityIndicator color={PremiumTheme.colors.bgDark} />
                : <Text style={styles.createBtnText}>🎉 CREAR MI PASAPORTE CAFETERO</Text>}
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              Al registrarte aceptas que tus datos sean usados para mejorar tu experiencia en la Feria Internacional de Café del Tolima.
            </Text>
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
  brand1: { fontSize: 13, fontWeight: '900', color: PremiumTheme.colors.goldPrimary, letterSpacing: 2 },
  brand2: { fontSize: 10, color: PremiumTheme.colors.textMuted, marginTop: 2 },
  hero: { backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 20, paddingVertical: 28, alignItems: 'center' },
  heroEmoji: { fontSize: 56, marginBottom: 12 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: PremiumTheme.colors.textLight, textAlign: 'center', letterSpacing: 1, marginBottom: 10 },
  heroSub: { fontSize: 13, color: PremiumTheme.colors.textMuted, textAlign: 'center', lineHeight: 20 },
  pasosRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(0,0,0,0.4)', paddingVertical: 16 },
  paso: { alignItems: 'center', gap: 4 },
  pasoBubble: { width: 28, height: 28, borderRadius: 14, backgroundColor: PremiumTheme.colors.glassBg, borderWidth: 1, borderColor: PremiumTheme.colors.textMuted, alignItems: 'center', justifyContent: 'center' },
  pasoBubbleActive: { backgroundColor: PremiumTheme.colors.goldPrimary, borderColor: PremiumTheme.colors.goldPrimary },
  pasoNum: { fontSize: 12, fontWeight: '800', color: PremiumTheme.colors.bgDark },
  pasoLabel: { fontSize: 9, color: PremiumTheme.colors.textMuted, fontWeight: '600' },
  form: { padding: 16 },
  scanBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(46,80,22,0.8)', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 0.5, borderColor: PremiumTheme.colors.goldLight + '60' },
  scanIcon: { fontSize: 28 },
  scanTitle: { fontSize: 12, fontWeight: '800', color: PremiumTheme.colors.goldLight, letterSpacing: 0.5 },
  scanSub: { fontSize: 11, color: PremiumTheme.colors.textMuted, marginTop: 2 },
  orText: { textAlign: 'center', color: PremiumTheme.colors.textMuted, fontSize: 11, marginBottom: 16 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 10, fontWeight: '800', color: PremiumTheme.colors.goldPrimary, letterSpacing: 1, marginBottom: 6 },
  input: { backgroundColor: PremiumTheme.colors.glassBg, borderWidth: 0.5, borderColor: PremiumTheme.colors.goldPrimary + '50', borderRadius: 10, padding: 14, fontSize: 14, color: PremiumTheme.colors.textLight },
  inputRow: { flexDirection: 'row' },
  prefix: { backgroundColor: 'rgba(0,0,0,0.4)', borderWidth: 0.5, borderColor: PremiumTheme.colors.goldPrimary + '50', borderTopLeftRadius: 10, borderBottomLeftRadius: 10, paddingHorizontal: 12, justifyContent: 'center', borderRightWidth: 0 },
  prefixText: { fontSize: 13, color: PremiumTheme.colors.textLight, fontWeight: '600' },
  fieldHint: { fontSize: 10, color: PremiumTheme.colors.textMuted, marginTop: 4 },
  selectBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectText: { fontSize: 14, color: PremiumTheme.colors.textLight },
  selectPlaceholder: { fontSize: 14, color: PremiumTheme.colors.textMuted },
  selectArrow: { fontSize: 10, color: PremiumTheme.colors.goldPrimary },
  dropdown: { backgroundColor: PremiumTheme.colors.glassBg, borderRadius: 10, borderWidth: 0.5, borderColor: PremiumTheme.colors.goldPrimary + '50', marginTop: 4, overflow: 'hidden', maxHeight: 200 },
  dropItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderBottomWidth: 0.5, borderBottomColor: PremiumTheme.colors.glassBorder },
  dropItemActive: { backgroundColor: 'rgba(212,175,55,0.15)' },
  dropEmoji: { fontSize: 18 },
  dropText: { flex: 1, fontSize: 13, color: PremiumTheme.colors.textLight },
  dropTextActive: { color: PremiumTheme.colors.goldLight, fontWeight: '700' },
  dropCheck: { fontSize: 14, color: PremiumTheme.colors.goldPrimary },
  preview: { marginBottom: 16 },
  previewTitle: { fontSize: 10, fontWeight: '800', color: PremiumTheme.colors.goldPrimary, letterSpacing: 1, marginBottom: 8 },
  previewCard: { backgroundColor: PremiumTheme.colors.glassBg, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: PremiumTheme.colors.goldPrimary + '60' },
  previewAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: PremiumTheme.colors.goldPrimary, alignItems: 'center', justifyContent: 'center' },
  previewAvatarText: { fontSize: 20, fontWeight: '800', color: PremiumTheme.colors.bgDark },
  previewNombre: { fontSize: 14, fontWeight: '700', color: PremiumTheme.colors.textLight },
  previewMun: { fontSize: 11, color: PremiumTheme.colors.textMuted, marginTop: 2 },
  previewBadge: { marginTop: 6, backgroundColor: 'rgba(46,80,22,0.8)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  previewBadgeText: { fontSize: 10, color: PremiumTheme.colors.goldLight, fontWeight: '600' },
  createBtn: { backgroundColor: PremiumTheme.colors.goldPrimary, borderRadius: 30, padding: 18, alignItems: 'center', marginBottom: 12 },
  createBtnText: { fontSize: 14, fontWeight: '900', color: PremiumTheme.colors.bgDark, letterSpacing: 0.5 },
  disclaimer: { fontSize: 10, color: PremiumTheme.colors.textMuted, textAlign: 'center', lineHeight: 15 },
});
