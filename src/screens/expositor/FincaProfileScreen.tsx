import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, StatusBar, TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { ExpositorNavProp } from '../../navigation/types';

const T = {
  bg: '#FAF7F0', card: '#FFFFFF', dark: '#2C1810', body: '#4A3728',
  muted: '#8A7060', gold: '#B8860B', goldPale: '#F5E6B0',
  green: '#2D5A1E', greenPale: '#E8F2E4', border: '#E8D5B0', brown: '#5D4037',
};

const PROCESOS = ['Lavado', 'Natural', 'Honey', 'Anaeróbico', 'Washed', 'Semi-lavado', 'Otro'];
const VARIEDADES = ['Castillo', 'Caturra', 'Colombia', 'Geisha', 'Tabi', 'Bourbon', 'Típica', 'Java', 'Otro'];

export default function FincaProfileScreen() {
  const nav = useNavigation<ExpositorNavProp>();
  const [saved, setSaved] = useState(false);

  const [perfil, setPerfil] = useState({
    nombreFinca: '',
    municipio: '',
    altitud: '',
    hectareas: '',
    generaciones: '',
    historia: '',
    proceso: 'Lavado',
    variedad: 'Castillo',
    certificaciones: '',
    contacto: '',
    web: '',
    redes: '',
    propietario: '',
    anioFundacion: '',
    descripcionBreve: '',
  });

  const handleSave = () => {
    if (!perfil.nombreFinca.trim() || !perfil.municipio.trim()) {
      Alert.alert('Campos requeridos', 'El nombre de la finca y el municipio son obligatorios.');
      return;
    }
    setSaved(true);
    Alert.alert('✅ Perfil guardado', 'Tu perfil de finca está disponible para visitantes y compradores.');
  };

  const field = (label: string, key: keyof typeof perfil, opts?: { placeholder?: string; multiline?: boolean; keyboardType?: any }) => (
    <View style={s.fieldGroup}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        style={[s.input, opts?.multiline && { height: 100, textAlignVertical: 'top' }]}
        value={perfil[key]}
        onChangeText={v => setPerfil(p => ({ ...p, [key]: v }))}
        placeholder={opts?.placeholder || ''}
        placeholderTextColor={T.muted}
        multiline={opts?.multiline}
        keyboardType={opts?.keyboardType || 'default'}
      />
    </View>
  );

  const selectorRow = (label: string, key: 'proceso' | 'variedad', options: string[]) => (
    <View style={s.fieldGroup}>
      <Text style={s.fieldLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.selectorScroll}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[s.selectorPill, perfil[key] === opt && s.selectorPillActive]}
            onPress={() => setPerfil(p => ({ ...p, [key]: opt }))}
          >
            <Text style={[s.selectorText, perfil[key] === opt && s.selectorTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Text style={s.backIcon}>‹</Text>
          <Text style={s.backText}>Volver</Text>
        </TouchableOpacity>
        <Text style={s.topTitle}>Perfil de Finca</Text>
        <View style={{ width: 80 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Hero */}
          <LinearGradient colors={[T.brown, '#795548', '#5D4037']} style={s.hero}>
            <Text style={s.heroEmoji}>🌿</Text>
            <Text style={s.heroTitle}>Perfil Comercial{'\n'}de tu Finca</Text>
            <Text style={s.heroSub}>Visitantes y compradores internacionales podrán ver toda esta información</Text>
          </LinearGradient>

          {saved && (
            <View style={s.savedBanner}>
              <Text style={s.savedText}>✅ Perfil publicado y visible para visitantes y compradores</Text>
            </View>
          )}

          {/* Sección Identidad */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>🏡 Identidad de la Finca</Text>
            {field('NOMBRE DE LA FINCA *', 'nombreFinca', { placeholder: 'Ej: Finca La Esperanza' })}
            {field('MUNICIPIO / VEREDA', 'municipio', { placeholder: 'Ej: Planadas, Vereda El Jardín' })}
            {field('PROPIETARIO / CAFICULTOR', 'propietario', { placeholder: 'Ej: Don Hernando Gómez Ospina' })}
            {field('AÑO DE FUNDACIÓN', 'anioFundacion', { placeholder: 'Ej: 1987', keyboardType: 'numeric' })}
            {field('DESCRIPCIÓN BREVE', 'descripcionBreve', { placeholder: 'Tagline de tu finca en una frase', multiline: false })}
          </View>

          {/* Sección Datos Técnicos */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>☕ Datos Técnicos</Text>
            {field('ALTITUD (msnm)', 'altitud', { placeholder: 'Ej: 1800', keyboardType: 'numeric' })}
            {field('ÁREA DE CULTIVO (hectáreas)', 'hectareas', { placeholder: 'Ej: 5.5', keyboardType: 'numeric' })}
            {selectorRow('VARIEDAD PRINCIPAL', 'variedad', VARIEDADES)}
            {selectorRow('PROCESO', 'proceso', PROCESOS)}
            {field('CERTIFICACIONES', 'certificaciones', { placeholder: 'Ej: UTZ, Rainforest Alliance, Orgánico, SCA' })}
          </View>

          {/* Sección Historia */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>📖 Historia de la Finca</Text>
            <Text style={s.sectionHint}>Cuéntale a los compradores y visitantes la historia de tu finca, la pasión detrás de tu café y las generaciones que han dedicado su vida a este cultivo.</Text>
            {field('HISTORIA Y ORIGEN', 'historia', {
              placeholder: 'Ej: La familia Gómez lleva 3 generaciones cultivando en las laderas del Páramo de Las Hermosas. Esta finca nació en 1987 cuando el abuelo Hernando...',
              multiline: true,
            })}
            {field('GENERACIONES CAFETERAS', 'generaciones', { placeholder: 'Ej: 3 generaciones · Desde 1987', keyboardType: 'default' })}
          </View>

          {/* Sección Contacto */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>📲 Contacto y Redes</Text>
            {field('WHATSAPP / TELÉFONO', 'contacto', { placeholder: 'Ej: +573156789012', keyboardType: 'phone-pad' })}
            {field('SITIO WEB', 'web', { placeholder: 'Ej: www.fincalaesperanza.co' })}
            {field('REDES SOCIALES', 'redes', { placeholder: 'Ej: @fincalaesperanza en Instagram' })}
          </View>

          {/* Save */}
          <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
            <Text style={s.saveBtnText}>💾 Publicar Perfil de Finca</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: T.bg },
  topBar:           { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: T.border },
  backBtn:          { flexDirection: 'row', alignItems: 'center', gap: 2, width: 80 },
  backIcon:         { fontSize: 28, color: T.brown, lineHeight: 32, fontWeight: '300' },
  backText:         { fontSize: 15, color: T.brown, fontWeight: '600' },
  topTitle:         { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '900', color: T.dark },
  scroll:           { padding: 16, paddingBottom: 40 },
  hero:             { borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16 },
  heroEmoji:        { fontSize: 48, marginBottom: 8 },
  heroTitle:        { fontSize: 26, fontWeight: '900', color: '#FFF', textAlign: 'center', lineHeight: 32, marginBottom: 8 },
  heroSub:          { fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 18 },
  savedBanner:      { backgroundColor: '#E8F5E9', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: T.green + '40' },
  savedText:        { fontSize: 13, color: T.green, fontWeight: '700' },
  section:          { backgroundColor: T.card, borderRadius: 18, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: T.border },
  sectionTitle:     { fontSize: 15, fontWeight: '900', color: T.dark, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: T.border, paddingBottom: 10 },
  sectionHint:      { fontSize: 12, color: T.muted, lineHeight: 18, marginBottom: 12, fontStyle: 'italic' },
  fieldGroup:       { marginBottom: 14 },
  fieldLabel:       { fontSize: 10, fontWeight: '800', color: T.gold, letterSpacing: 1, marginBottom: 6 },
  input:            { backgroundColor: T.bg, borderWidth: 1, borderColor: T.border, borderRadius: 12, padding: 14, fontSize: 14, color: T.dark },
  selectorScroll:   { marginBottom: 4 },
  selectorPill:     { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: T.border, backgroundColor: T.bg, marginRight: 8 },
  selectorPillActive: { backgroundColor: T.brown, borderColor: T.brown },
  selectorText:     { fontSize: 12, color: T.body, fontWeight: '600' },
  selectorTextActive: { color: '#FFF' },
  saveBtn:          { backgroundColor: T.green, borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 8 },
  saveBtnText:      { fontSize: 16, fontWeight: '900', color: '#FFF' },
});
