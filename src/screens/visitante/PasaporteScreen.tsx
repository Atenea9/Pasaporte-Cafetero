import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService, VisitorStats } from '../../services/mockDb.service';

export const PasaporteScreen = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadStats();
  }, [user]);

  const loadStats = async () => {
    const data = await mockDbService.getUserStats(user!.uid);
    setStats(data);
    setLoading(false);
  };

  if (loading) return <ActivityIndicator style={styles.loader} color="#4A3B32" />;

  return (
    <View style={styles.container}>
      <View style={styles.qrContainer}>
        <View style={styles.qrPlaceholder}>
          <Text style={styles.qrText}>QR del Visitante</Text>
          <Text style={styles.uidText}>{user?.uid}</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.level}>Nivel: {stats?.level}</Text>
        <Text style={styles.points}>{stats?.points} Puntos</Text>

        <Text style={styles.stampsTitle}>Sellos Coleccionados ({stats?.stamps.length}):</Text>
        <View style={styles.stampsGrid}>
          {stats?.stamps.map((stamp, index) => (
            <View key={index} style={styles.stampBadge}>
              <Text style={styles.stampText}>{stamp}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2', padding: 20 },
  loader: { flex: 1, justifyContent: 'center' },
  qrContainer: { alignItems: 'center', marginVertical: 30 },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4A3B32',
    borderRadius: 10,
  },
  qrText: { fontWeight: 'bold', color: '#4A3B32' },
  uidText: { fontSize: 10, color: '#999', marginTop: 10 },
  infoContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
  },
  level: { fontSize: 18, color: '#7A6B62', fontWeight: '600' },
  points: { fontSize: 32, fontWeight: 'bold', color: '#4A3B32', marginVertical: 10 },
  stampsTitle: { fontSize: 16, fontWeight: 'bold', color: '#4A3B32', marginTop: 10 },
  stampsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  stampBadge: {
    backgroundColor: '#E3D5CA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  stampText: { color: '#4A3B32', fontWeight: 'bold', fontSize: 12 },
});

export default PasaporteScreen;
