import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { mockDbService } from '../../services/mockDb.service';
import { useAuth } from '../../contexts/AuthContext';

const SCA_ATTRIBUTES = [
  { key: 'fragancia',   label: 'Fragancia / Aroma',   hint: '0 – 10' },
  { key: 'sabor',       label: 'Sabor (Flavor)',        hint: '0 – 10' },
  { key: 'residual',    label: 'Sabor Residual',        hint: '0 – 10' },
  { key: 'acidez',      label: 'Acidez',                hint: '0 – 10' },
  { key: 'cuerpo',      label: 'Cuerpo',                hint: '0 – 10' },
  { key: 'uniformidad', label: 'Uniformidad',           hint: '0 – 10' },
  { key: 'balance',     label: 'Balance',               hint: '0 – 10' },
  { key: 'tazaLimpia',  label: 'Taza Limpia',           hint: '0 – 10' },
  { key: 'dulzura',     label: 'Dulzura',               hint: '0 – 10' },
  { key: 'general',     label: 'Puntaje General',       hint: '0 – 10' },
];

export const ScaFormScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [scores, setScores] = useState<Record<string, string>>(
    Object.fromEntries(SCA_ATTRIBUTES.map(a => [a.key, '']))
  );

  const total = SCA_ATTRIBUTES.reduce((sum, a) => {
    const val = parseFloat(scores[a.key]);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const handleSubmit = async () => {
    const missing = SCA_ATTRIBUTES.filter(a => scores[a.key].trim() === '');
    if (missing.length > 0) {
      Alert.alert('Error', `Faltan campos: ${missing.map(m => m.label).join(', ')}`);
      return;
    }
    const invalids = SCA_ATTRIBUTES.filter(a => {
      const v = parseFloat(scores[a.key]);
      return isNaN(v) || v < 0 || v > 10;
    });
    if (invalids.length > 0) {
      Alert.alert('Error', 'Todos los puntajes deben estar entre 0 y 10');
      return;
    }

    setLoading(true);
    try {
      const result = await mockDbService.submitScaAnalysis(user!.uid, { scores, total });
      Alert.alert('¡Enviado!', result.message, [
        { text: 'OK', onPress: () => navigation.navigate('SubastaDashboard') },
      ]);
    } catch {
      Alert.alert('Error', 'No se pudo enviar el análisis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Análisis SCA</Text>
      <Text style={styles.subtitle}>Formulario de Catación — 10 Atributos</Text>

      {SCA_ATTRIBUTES.map((attr) => (
        <View key={attr.key} style={styles.row}>
          <View style={styles.rowLeft}>
            <Text style={styles.attrLabel}>{attr.label}</Text>
            <Text style={styles.attrHint}>{attr.hint}</Text>
          </View>
          <TextInput
            style={styles.scoreInput}
            keyboardType="decimal-pad"
            placeholder="0.0"
            value={scores[attr.key]}
            onChangeText={(t) => setScores({ ...scores, [attr.key]: t })}
          />
        </View>
      ))}

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>PUNTAJE TOTAL SCA</Text>
        <Text style={[styles.totalValue, total >= 80 && styles.totalHigh]}>
          {total.toFixed(2)} / 100
        </Text>
        {total >= 80 && <Text style={styles.specialtyBadge}>☕ Café Especial</Text>}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#FFF" />
          : <Text style={styles.submitText}>Enviar a Revisión</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ScaFormScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#4A3B32' },
  subtitle: { fontSize: 13, color: '#7A6B62', marginBottom: 24, marginTop: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
  rowLeft: { flex: 1 },
  attrLabel: { fontSize: 15, fontWeight: '600', color: '#4A3B32' },
  attrHint: { fontSize: 11, color: '#A09080', marginTop: 2 },
  scoreInput: {
    width: 64,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A3B32',
    backgroundColor: '#FAF7F2',
  },
  totalCard: {
    backgroundColor: '#4A3B32',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginVertical: 24,
  },
  totalLabel: { fontSize: 12, color: '#D4C4B7', letterSpacing: 2, fontWeight: '700' },
  totalValue: { fontSize: 42, fontWeight: '900', color: '#FFF', marginTop: 4 },
  totalHigh: { color: '#7ED348' },
  specialtyBadge: { fontSize: 14, color: '#7ED348', marginTop: 8, fontWeight: 'bold' },
  submitButton: {
    backgroundColor: '#E07A5F',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  cancelButton: { marginTop: 16, alignItems: 'center' },
  cancelText: { color: '#7A6B62', fontSize: 16, fontWeight: 'bold' },
});
