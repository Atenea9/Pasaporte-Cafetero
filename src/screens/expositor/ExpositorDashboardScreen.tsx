import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
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
    <View style={styles.container}>
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
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigation.navigate('Scanner')}
        >
          <Text style={styles.scanButtonText}>📸 Escanear Pasaporte (QR)</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>Escanea el código de un visitante para registrar una venta y darle puntos.</Text>
      </View>
    </View>
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
  statsContainer: { padding: 20, gap: 15 },
  statBox: { backgroundColor: '#FFF', padding: 20, borderRadius: 10, elevation: 2 },
  statLabel: { fontSize: 14, color: '#7A6B62' },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#2E3B32', marginTop: 5 },
  actionContainer: { padding: 20, alignItems: 'center', marginTop: 20 },
  scanButton: {
    backgroundColor: '#4A3B32',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    elevation: 3,
  },
  scanButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  hint: { textAlign: 'center', color: '#7A6B62', marginTop: 15, fontSize: 14 },
});
