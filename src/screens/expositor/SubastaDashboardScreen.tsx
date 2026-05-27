import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';

export const SubastaDashboardScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [lotStatus, setLotStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    const status = await mockDbService.getAuctionLotStatus(user!.uid);
    setLotStatus(status);
    setLoading(false);
  };

  if (loading) return <ActivityIndicator style={styles.loader} color="#4A3B32" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Lote de Subasta</Text>

      <View style={styles.statusCard}>
        <Text style={styles.label}>Estado Actual:</Text>
        <Text style={styles.statusText}>{lotStatus.status.toUpperCase()}</Text>
        {lotStatus.farmName ? <Text style={styles.farmText}>Finca: {lotStatus.farmName}</Text> : null}
        <Text style={styles.scoreText}>
          Puntaje SCA: {lotStatus.scaScore > 0 ? lotStatus.scaScore : 'Pendiente'}
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SubastaProfile')}>
        <Text style={styles.buttonText}>1. Información de la Finca y Lote</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.buttonAlt]} onPress={() => navigation.navigate('ScaForm')}>
        <Text style={styles.buttonText}>2. Ingresar Análisis SCA</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Volver al Stand</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SubastaDashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2', padding: 20 },
  loader: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#4A3B32', marginBottom: 20 },
  statusCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 10, elevation: 2, marginBottom: 30 },
  label: { fontSize: 14, color: '#7A6B62' },
  statusText: { fontSize: 22, fontWeight: 'bold', color: '#E07A5F', marginVertical: 5 },
  farmText: { fontSize: 16, color: '#4A3B32', fontWeight: 'bold' },
  scoreText: { fontSize: 14, color: '#4A3B32', marginTop: 10 },
  button: {
    backgroundColor: '#4A3B32',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonAlt: { backgroundColor: '#2E3B32' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  backButton: { marginTop: 20, alignItems: 'center' },
  backText: { color: '#7A6B62', fontSize: 16, fontWeight: 'bold' },
});
