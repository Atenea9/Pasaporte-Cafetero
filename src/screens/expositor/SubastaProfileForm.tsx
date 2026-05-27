import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { mockDbService } from '../../services/mockDb.service';
import { useAuth } from '../../contexts/AuthContext';

export const SubastaProfileForm = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [form, setForm] = useState({
    farmName: '', owner: '', municipality: '', altitude: '',
    variety: '', process: '', lotSize: '',
  });

  const handleSave = async () => {
    if (!form.farmName || !form.variety) {
      Alert.alert('Error', 'Por favor llena los campos requeridos (Nombre y Variedad)');
      return;
    }
    await mockDbService.saveAuctionProfile(user!.uid, form);
    Alert.alert('Guardado', 'Perfil de finca guardado', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Perfil de Finca</Text>

      <Text style={styles.label}>Nombre de la Finca *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Finca El Mirador"
        value={form.farmName}
        onChangeText={(t) => setForm({ ...form, farmName: t })}
      />

      <Text style={styles.label}>Propietario</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={form.owner}
        onChangeText={(t) => setForm({ ...form, owner: t })}
      />

      <Text style={styles.label}>Municipio</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Planadas"
        value={form.municipality}
        onChangeText={(t) => setForm({ ...form, municipality: t })}
      />

      <Text style={styles.label}>Altitud (msnm)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Ej: 1800"
        value={form.altitude}
        onChangeText={(t) => setForm({ ...form, altitude: t })}
      />

      <Text style={styles.label}>Variedad de Café * (Ej: Geisha, Caturra)</Text>
      <TextInput
        style={styles.input}
        placeholder="Variedad"
        value={form.variety}
        onChangeText={(t) => setForm({ ...form, variety: t })}
      />

      <Text style={styles.label}>Proceso (Lavado, Natural, Honey)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Lavado"
        value={form.process}
        onChangeText={(t) => setForm({ ...form, process: t })}
      />

      <Text style={styles.label}>Tamaño del Lote Disponible (Kg)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Ej: 150"
        value={form.lotSize}
        onChangeText={(t) => setForm({ ...form, lotSize: t })}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Guardar Perfil de Finca</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SubastaProfileForm;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#4A3B32', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#4A3B32', marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#4A3B32',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  cancelButton: { marginTop: 16, alignItems: 'center' },
  cancelText: { color: '#E07A5F', fontSize: 16, fontWeight: 'bold' },
});
