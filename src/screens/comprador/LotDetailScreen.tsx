import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';

export const LotDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [lot, setLot] = useState<any>(null);

  useEffect(() => {
    mockDbService.getLotDetails(route.params?.lotId).then(setLot);
  }, []);

  const handleBid = async () => {
    try {
      await mockDbService.placeBid(lot.id, user!.uid, lot.currentBidUSD + 1);
      Alert.alert('¡Éxito!', 'Puja colocada (+ $1 USD)');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  if (!lot) return <ActivityIndicator style={{ flex: 1 }} color="#4A3B32" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{lot.farmName}</Text>
      <Text style={styles.subtitle}>{lot.municipality} • {lot.altitude} msnm</Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoRow}>Propietario: <Text style={styles.infoVal}>{lot.owner}</Text></Text>
        <Text style={styles.infoRow}>Variedad: <Text style={styles.infoVal}>{lot.variety}</Text></Text>
        <Text style={styles.infoRow}>Proceso: <Text style={styles.infoVal}>{lot.process}</Text></Text>
        <Text style={styles.infoRow}>Lote: <Text style={styles.infoVal}>{lot.lotSizeKg} Kg</Text></Text>
      </View>

      <View style={styles.scaCard}>
        <Text style={styles.scaTitle}>Puntaje SCA: {lot.scaScore} / 100</Text>
        {Object.entries(lot.scaDetails).map(([key, val]) => (
          <Text key={key} style={styles.scaRow}>• {key}: {val as number}</Text>
        ))}
      </View>

      <View style={styles.bidCard}>
        <Text style={styles.bidLabel}>Puja Actual</Text>
        <Text style={styles.bidAmount}>${lot.currentBidUSD.toFixed(2)} USD</Text>
      </View>

      <TouchableOpacity style={styles.bidButton} onPress={handleBid}>
        <Text style={styles.bidButtonText}>Pujar ${(lot.currentBidUSD + 1).toFixed(2)} USD</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Volver al Catálogo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default LotDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A2530', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#7A6B62', marginBottom: 20 },
  infoCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 10, marginBottom: 16, elevation: 1 },
  infoRow: { fontSize: 14, color: '#7A6B62', marginBottom: 6 },
  infoVal: { fontWeight: 'bold', color: '#4A3B32' },
  scaCard: { backgroundColor: '#E3D5CA', padding: 16, borderRadius: 10, marginBottom: 16 },
  scaTitle: { fontSize: 16, fontWeight: 'bold', color: '#4A3B32', marginBottom: 10 },
  scaRow: { fontSize: 13, color: '#4A3B32', marginBottom: 3 },
  bidCard: {
    backgroundColor: '#1A2530',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  bidLabel: { fontSize: 12, color: '#9AB', letterSpacing: 2 },
  bidAmount: { fontSize: 32, fontWeight: '900', color: '#4DA8DA', marginTop: 4 },
  bidButton: {
    backgroundColor: '#28A745',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  bidButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  back: { textAlign: 'center', color: '#4DA8DA', fontSize: 15 },
});
