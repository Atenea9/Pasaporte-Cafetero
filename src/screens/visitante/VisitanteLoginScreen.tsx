import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, KeyboardAvoidingView, Platform,
  Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { VisitanteNavProp } from '../../navigation/types';
import { useApp } from '../../context/AppContext';
import { mockDbService } from '../../services/mockDb.service';

const T = {
  bg: '#FAF7F0', card: '#FFFFFF', dark: '#2C1810', body: '#4A3728',
  muted: '#8A7060', gold: '#B8860B', goldDark: '#8B6308', goldPale: '#F5E6B0',
  green: '#2D5A1E', greenPale: '#E8F2E4', border: '#E8D5B0', danger: '#C0392B',
};

export default function VisitanteLoginScreen() {
  const nav = useNavigation<VisitanteNavProp>();
  const { dispatch } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'cedula' | 'phone'>('cedula');

  const handleLogin = async () => {
    if (!identifier.trim()) {
      Alert.alert('Campo requerido', 'Ingresa tu cédula o número de teléfono.');
      return;
    }
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      // In real app: look up user by cedula/phone in DB
      // For demo: navigate to registro if not found, or home if found
      nav.navigate('Registro');
    } catch (e) {
      Alert.alert('Error', 'No encontramos tu pasaporte. ¿Deseas crear uno nuevo?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Back */}
          <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
            <Text style={s.backIcon}>‹</Text>
            <Text style={s.backText}>Volver</Text>
          </TouchableOpacity>

          <View style={s.header}>
            <Text style={s.headerEmoji}>🪪</Text>
            <Text style={s.headerTitle}>Iniciar sesión</Text>
            <Text style={s.headerSub}>Ingresa con tu cédula o número de teléfono registrado</Text>
          </View>

          {/* Mode Toggle */}
          <View style={s.toggle}>
            <TouchableOpacity
              style={[s.toggleBtn, mode === 'cedula' && s.toggleBtnActive]}
              onPress={() => setMode('cedula')}
            >
              <Text style={[s.toggleText, mode === 'cedula' && s.toggleTextActive]}>🪪 Cédula</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.toggleBtn, mode === 'phone' && s.toggleBtnActive]}
              onPress={() => setMode('phone')}
            >
              <Text style={[s.toggleText, mode === 'phone' && s.toggleTextActive]}>📱 Teléfono</Text>
            </TouchableOpacity>
          </View>

          {/* Input */}
          <View style={s.inputGroup}>
            <Text style={s.label}>
              {mode === 'cedula' ? 'NÚMERO DE CÉDULA / DOCUMENTO' : 'NÚMERO DE TELÉFONO / WHATSAPP'}
            </Text>
            <TextInput
              style={s.input}
              value={identifier}
              onChangeText={setIdentifier}
              placeholder={mode === 'cedula' ? 'Ej: 1107654321' : 'Ej: +573156789012'}
              placeholderTextColor={T.muted}
              keyboardType={mode === 'phone' ? 'phone-pad' : 'numeric'}
              autoFocus
            />
          </View>

          <TouchableOpacity
            style={[s.loginBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#FFF" />
              : <Text style={s.loginBtnText}>INGRESAR AL PASAPORTE</Text>
            }
          </TouchableOpacity>

          <View style={s.divider}>
            <View style={s.divLine} />
            <Text style={s.divText}>¿No tienes pasaporte?</Text>
            <View style={s.divLine} />
          </View>

          <TouchableOpacity
            style={s.createBtn}
            onPress={() => nav.navigate('Registro')}
            activeOpacity={0.85}
          >
            <Text style={s.createBtnText}>📝 Crear mi pasaporte gratis</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: T.bg },
  scroll:       { flexGrow: 1, padding: 24, paddingTop: 16 },
  backBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 24, alignSelf: 'flex-start', padding: 8, marginLeft: -8 },
  backIcon:     { fontSize: 28, color: T.green, lineHeight: 32, fontWeight: '300' },
  backText:     { fontSize: 15, color: T.green, fontWeight: '600' },
  header:       { alignItems: 'center', marginBottom: 32 },
  headerEmoji:  { fontSize: 56, marginBottom: 12 },
  headerTitle:  { fontSize: 26, fontWeight: '900', color: T.dark, marginBottom: 8 },
  headerSub:    { fontSize: 13, color: T.muted, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
  toggle:       { flexDirection: 'row', backgroundColor: T.border, borderRadius: 14, padding: 4, marginBottom: 24 },
  toggleBtn:    { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: T.green },
  toggleText:   { fontSize: 14, fontWeight: '700', color: T.muted },
  toggleTextActive: { color: '#FFF' },
  inputGroup:   { marginBottom: 24 },
  label:        { fontSize: 10, fontWeight: '800', color: T.gold, letterSpacing: 1, marginBottom: 8 },
  input:        { backgroundColor: T.card, borderWidth: 1.5, borderColor: T.border, borderRadius: 14, padding: 16, fontSize: 16, color: T.dark, shadowColor: T.dark, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  loginBtn:     { backgroundColor: T.green, borderRadius: 16, padding: 18, alignItems: 'center', shadowColor: T.green, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  loginBtnText: { fontSize: 15, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  divider:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 24 },
  divLine:      { flex: 1, height: 1, backgroundColor: T.border },
  divText:      { fontSize: 12, color: T.muted, flexShrink: 0 },
  createBtn:    { backgroundColor: T.card, borderRadius: 16, padding: 18, alignItems: 'center', borderWidth: 1.5, borderColor: T.gold },
  createBtnText:{ fontSize: 15, fontWeight: '700', color: T.gold },
});
