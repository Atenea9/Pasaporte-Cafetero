import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';

export const CompradorDashboardScreen = () => {
  const { logout } = useAuth();
  const navigation = useNavigation<any>();
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockDbService.getAuctionLots().then(data => {
      setLots(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <ActivityIndicator style={styles.loader} color="#4A3B32" />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Catálogo de Subasta</Text>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => navigation.navigate('CompradorPasaporte')}>
            <Text style={styles.link}>Mi Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout}>
            <Text style={styles.logout}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={lots}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('LotDetail', { lotId: item.id })}
          >
            <Text style={styles.farmName}>
              {item.farmName} <Text style={styles.score}>(SCA {item.scaScore})</Text>
            </Text>
            <Text style={styles.detailText}>{item.variety} • {item.lotSizeKg} Kg</Text>
            <Text style={styles.bidValue}>Puja Actual: ${item.currentBidUSD.toFixed(2)} USD</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default CompradorDashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  loader: { flex: 1, justifyContent: 'center' },
  header: { padding: 20, backgroundColor: '#1A2530' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  link: { color: '#4DA8DA' },
  logout: { color: '#E07A5F' },
  list: { padding: 20 },
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
  farmName: { fontSize: 18, fontWeight: 'bold', color: '#4A3B32' },
  score: { fontSize: 14, color: '#7A6B62' },
  detailText: { fontSize: 14, color: '#7A6B62', marginVertical: 5 },
  bidValue: { fontSize: 16, fontWeight: 'bold', color: '#28A745' },
});
