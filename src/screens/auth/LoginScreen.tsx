import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, SafeAreaView, StatusBar, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const C = {
  bg: '#0D0800', card: '#1A1200', gold: '#C8860A', goldLight: '#E8A830',
  text: '#F5E6C8', muted: '#888', border: '#2C1A00',
};

const ROLE_SHORTCUTS = [
  { label: 'Visitante', key: 'visitante321' },
  { label: 'Expositor', key: 'expositor321' },
  { label: 'Comprador', key: 'comprador321' },
  { label: 'Admin',     key: 'admin321'     },
  { label: 'CEO',       key: 'ceo321'       },
];

export default function LoginScreen() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (id = identifier) => {
    const value = id.trim();
    if (!value) { setError('Ingresa un identificador'); return; }
    setError('');
    setIsLoading(true);
    try {
      const type = value.includes('@') ? 'email' : 'phone';
      await login(value, type);
    } catch {
      setError('Error al iniciar sesión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.card} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={s.header}>
            <Text style={s.coffeeIcon}>☕</Text>
            <Text style={s.brand1}>PASAPORTE CAFETERO</Text>
            <Text style={s.brand2}>Feria Internacional del Café · Tolima 2026</Text>
          </View>

          {/* Input */}
          <View style={s.card}>
            <Text style={s.cardTitle}>ACCESO AL SISTEMA</Text>

            <Text style={s.label}>TELÉFONO O CORREO</Text>
            <TextInput
              style={s.input}
              placeholder="Ej: 3001234567 o admin@feria.co"
              placeholderTextColor={C.muted}
              value={identifier}
              onChangeText={t => { setIdentifier(t); setError(''); }}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {error ? <Text style={s.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[s.btn, isLoading && s.btnDisabled]}
              onPress={() => handleLogin()}
              disabled={isLoading}
            >
              {isLoading
                ? <ActivityIndicator color={C.bg} />
                : <Text style={s.btnText}>INGRESAR →</Text>
              }
            </TouchableOpacity>
          </View>

          {/* Role shortcuts for demo */}
          <View style={s.hintsCard}>
            <Text style={s.hintsTitle}>⚡ ACCESO RÁPIDO (DEMO)</Text>
            <View style={s.pillsRow}>
              {ROLE_SHORTCUTS.map(r => (
                <TouchableOpacity
                  key={r.key}
                  style={s.pill}
                  onPress={() => { setIdentifier(r.key); handleLogin(r.key); }}
                >
                  <Text style={s.pillText}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.hint}>
              Toca un rol para ingresar directamente, o escribe un identificador
              que contenga 'admin', 'ceo', 'expositor' o 'comprador'.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: C.bg },
  scroll:     { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header:     { alignItems: 'center', marginBottom: 32 },
  coffeeIcon: { fontSize: 56, marginBottom: 12 },
  brand1:     { fontSize: 22, fontWeight: '900', color: C.gold, letterSpacing: 3 },
  brand2:     { fontSize: 11, color: C.muted, marginTop: 4, letterSpacing: 1, textAlign: 'center' },
  card:       { backgroundColor: C.card, borderRadius: 20, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: '#C8860A22' },
  cardTitle:  { fontSize: 13, fontWeight: '800', color: C.gold, letterSpacing: 2, marginBottom: 20 },
  label:      { fontSize: 11, color: C.muted, letterSpacing: 1, marginBottom: 8, fontWeight: '700' },
  input:      {
    backgroundColor: '#0D0800', color: C.text, borderWidth: 1, borderColor: '#C8860A44',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, marginBottom: 16,
  },
  errorText:  { color: '#FF6B6B', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  btn:        { backgroundColor: C.gold, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  btnDisabled:{ opacity: 0.6 },
  btnText:    { color: C.bg, fontWeight: '900', fontSize: 15, letterSpacing: 2 },
  hintsCard:  { backgroundColor: C.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#C8860A22' },
  hintsTitle: { fontSize: 11, fontWeight: '800', color: C.gold, letterSpacing: 2, marginBottom: 14 },
  pillsRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  pill:       { backgroundColor: '#C8860A22', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#C8860A44' },
  pillText:   { color: C.gold, fontSize: 13, fontWeight: '700' },
  hint:       { fontSize: 11, color: C.muted, lineHeight: 18, textAlign: 'center' },
});
