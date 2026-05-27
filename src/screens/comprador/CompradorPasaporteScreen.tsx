import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';

export const CompradorPasaporteScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    mockDbService.getCompradorStats(user!.uid).then(setStats);
  }, []);

  if (!stats) return <ActivityIndicator style={{ flex: 1 }} color="#1A2530" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pasaporte Comprador</Text>
      <Text style={styles.sub}>ID: {user?.uid}</Text>

      <View style={styles.card}>
        <Text style={styles.statLabel}>Pujas Activas</Text>
        <Text style={styles.statVal}>{stats.activeBids}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.statLabel}>Lotes Ganados</Text>
        <Text style={styles.statVal}>{stats.lotsWon}</Text>
      </View>

      <View style={styles.stampsContainer}>
        <Text style={styles.stampsTitle}>Insignias</Text>
        {stats.stamps.map((s: string) => (
          <Text key={s} style={styles.stamp}>🏆 {s}</Text>
        ))}
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Volver al Catálogo</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CompradorPasaporteScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2', padding: 20, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A2530', textAlign: 'center' },
  sub: { fontSize: 13, color: '#7A6B62', textAlign: 'center', marginBottom: 30 },
  card: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 14,
    alignItems: 'center',
    elevation: 2,
  },
  statLabel: { fontSize: 13, color: '#7A6B62', letterSpacing: 1 },
  statVal: { fontSize: 36, fontWeight: '900', color: '#1A2530', marginTop: 4 },
  stampsContainer: { backgroundColor: '#E8F4FF', padding: 16, borderRadius: 12, marginBottom: 30 },
  stampsTitle: { fontSize: 14, fontWeight: 'bold', color: '#1A2530', marginBottom: 10 },
  stamp: { fontSize: 15, color: '#4DA8DA', marginBottom: 6 },
  backBtn: { alignItems: 'center' },
  backText: { color: '#4DA8DA', fontSize: 16, fontWeight: 'bold' },
});
