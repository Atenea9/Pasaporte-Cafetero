import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';

export const SaleScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const visitorUid = route.params?.visitorUid || 'Desconocido';
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const pointsCalculated = amount ? Math.floor(parseInt(amount) / 1000) : 0;

  const handleSale = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido en COP');
      return;
    }

    setLoading(true);
    try {
      const result = await mockDbService.registerSale(user!.uid, visitorUid, Number(amount));
      Alert.alert('¡Éxito!', result.message, [
        { text: 'OK', onPress: () => navigation.navigate('Dashboard') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar la venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Venta</Text>
      <Text style={styles.subtitle}>Visitante ID: {visitorUid}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Monto de compra ($ COP)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 15000"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <View style={styles.pointsPreview}>
          <Text style={styles.pointsText}>Puntos a otorgar:</Text>
          <Text style={styles.pointsValue}>{pointsCalculated} pts</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSale}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Confirmar Venta y Otorgar Sello</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SaleScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2', padding: 20, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#4A3B32', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#7A6B62', textAlign: 'center', marginBottom: 30 },
  card: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    marginBottom: 20,
  },
  label: { fontSize: 16, color: '#4A3B32', marginBottom: 10, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 15,
    borderRadius: 10,
    fontSize: 18,
    backgroundColor: '#F9F9F9',
  },
  pointsPreview: {
    marginTop: 20,
    backgroundColor: '#E3D5CA',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsText: { fontSize: 16, color: '#4A3B32' },
  pointsValue: { fontSize: 20, fontWeight: 'bold', color: '#E07A5F' },
  button: { backgroundColor: '#4A3B32', padding: 18, borderRadius: 10, alignItems: 'center' },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { marginTop: 20, alignItems: 'center' },
  cancelText: { color: '#E07A5F', fontSize: 16, fontWeight: 'bold' },
});
