import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';
import { useNavigation } from '@react-navigation/native';

export const ExpositorDashboardScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await mockDbService.getStandStats(user!.uid);
    setStats(data);
    setLoading(false);
  };

  if (loading) return <ActivityIndicator style={styles.loader} color="#4A3B32" />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.standName}>{stats?.standName}</Text>
        <Text style={styles.municipality}>{stats?.municipality} - Expositor</Text>
        <Text onPress={logout} style={styles.logoutBtn}>Cerrar Sesión</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Ventas Hoy (COP)</Text>
          <Text style={styles.statValue}>${stats?.todaySalesCOP.toLocaleString()}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Sellos Otorgados</Text>
          <Text style={styles.statValue}>{stats?.stampsIssued}</Text>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.scanButton} onPress={() => navigation.navigate('Scanner')}>
          <Text style={styles.scanButtonText}>📸 Escanear Pasaporte (QR)</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>Registra ventas del Stand aquí.</Text>
      </View>

      {/* NUEVA SECCIÓN DE SUBASTA */}
      <View style={styles.auctionContainer}>
        <Text style={styles.sectionTitle}>Subasta Internacional</Text>
        <Text style={styles.auctionDesc}>
          Registra tu lote de café especial para la subasta con compradores internacionales.
        </Text>
        <TouchableOpacity
          style={styles.auctionButton}
          onPress={() => navigation.navigate('SubastaDashboard')}
        >
          <Text style={styles.auctionButtonText}>🌾 Gestionar Lote de Subasta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ExpositorDashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  loader: { flex: 1, justifyContent: 'center' },
  header: {
    padding: 20,
    backgroundColor: '#2E3B32',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  standName: { fontSize: 26, fontWeight: 'bold', color: '#FFF' },
  municipality: { fontSize: 16, color: '#D4C4B7', marginTop: 5 },
  logoutBtn: { color: '#E07A5F', marginTop: 15, fontWeight: 'bold' },
  statsContainer: { padding: 20, flexDirection: 'row', gap: 15 },
  statBox: { flex: 1, backgroundColor: '#FFF', padding: 20, borderRadius: 10, elevation: 2 },
  statLabel: { fontSize: 12, color: '#7A6B62' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#2E3B32', marginTop: 5 },
  actionContainer: { paddingHorizontal: 20, alignItems: 'center' },
  scanButton: {
    backgroundColor: '#4A3B32',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    elevation: 3,
  },
  scanButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  hint: { textAlign: 'center', color: '#7A6B62', marginTop: 10, fontSize: 12 },
  auctionContainer: { margin: 20, padding: 20, backgroundColor: '#E3D5CA', borderRadius: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A3B32' },
  auctionDesc: { fontSize: 13, color: '#7A6B62', marginTop: 5, marginBottom: 15 },
  auctionButton: { backgroundColor: '#E07A5F', padding: 15, borderRadius: 10, alignItems: 'center' },
  auctionButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
});
