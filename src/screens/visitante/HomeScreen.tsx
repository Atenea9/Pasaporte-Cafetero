import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';

export const HomeScreen = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ visitorCount: 0, activeStands: 0, happyHour: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await mockDbService.getHomeStats();
    setStats(data);
    setLoading(false);
  };

  if (loading) return <ActivityIndicator style={styles.loader} color="#4A3B32" />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>{t('welcome', 'Bienvenido')}, {user?.name || 'Visitante'}</Text>
        <Text style={styles.subtitle}>Feria Internacional del Café 2026</Text>
        <Text onPress={logout} style={styles.logoutBtn}>Cerrar Sesión</Text>
      </View>

      {stats.happyHour && (
        <View style={styles.happyHourBanner}>
          <Text style={styles.happyHourText}>🔥 ¡HAPPY HOUR ACTIVO! Puntos Dobles 🔥</Text>
        </View>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.visitorCount}</Text>
          <Text style={styles.statLabel}>Visitantes</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.activeStands}</Text>
          <Text style={styles.statLabel}>Stands Activos</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  loader: { flex: 1, justifyContent: 'center' },
  header: {
    padding: 20,
    backgroundColor: '#4A3B32',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  welcome: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  subtitle: { fontSize: 14, color: '#D4C4B7', marginTop: 5 },
  logoutBtn: { color: '#E07A5F', marginTop: 10, fontWeight: 'bold' },
  happyHourBanner: {
    backgroundColor: '#E07A5F',
    padding: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  happyHourText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 20 },
  statBox: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '45%',
    elevation: 2,
  },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#4A3B32' },
  statLabel: { fontSize: 14, color: '#7A6B62', marginTop: 5 },
});

export default HomeScreen;
