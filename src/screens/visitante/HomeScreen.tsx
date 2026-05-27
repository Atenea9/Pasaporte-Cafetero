import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';
import { PremiumTheme } from '../../theme/PremiumTheme';

export const HomeScreen = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ visitorCount: 0, activeStands: 0, happyHour: false });
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      mockDbService.getHomeStats().then(data => {
        if (isActive) { setStats(data); setLoading(false); }
      });
      return () => { isActive = false; };
    }, [])
  );

  if (loading) return <ActivityIndicator style={styles.loader} color={PremiumTheme.colors.goldPrimary} />;

  return (
    <LinearGradient colors={[PremiumTheme.colors.bgDark, PremiumTheme.colors.bgMedium]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>{t('welcome', 'Bienvenido')},</Text>
            <Text style={styles.userName}>{user?.name || 'Visitante VIP'}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}><Text style={styles.logoutText}>Salir</Text></TouchableOpacity>
        </View>

        {stats.happyHour && (
          <LinearGradient colors={[PremiumTheme.colors.goldDark, PremiumTheme.colors.goldPrimary]} style={styles.happyHourBanner}>
            <Text style={styles.happyHourText}>✨ HAPPY HOUR ACTIVO: PUNTOS DOBLES ✨</Text>
          </LinearGradient>
        )}

        <View style={styles.statsContainer}>
          <View style={styles.glassCard}>
            <Text style={styles.statValue}>{stats.visitorCount}</Text>
            <Text style={styles.statLabel}>Asistentes</Text>
          </View>
          <View style={styles.glassCard}>
            <Text style={styles.statValue}>{stats.activeStands}</Text>
            <Text style={styles.statLabel}>Stands Activos</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 25, paddingTop: 60 },
  loader: { flex: 1, justifyContent: 'center', backgroundColor: PremiumTheme.colors.bgDark },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 },
  welcome: { fontSize: 16, color: PremiumTheme.colors.textMuted, letterSpacing: 1, textTransform: 'uppercase' },
  userName: { fontSize: 28, fontWeight: 'bold', color: PremiumTheme.colors.textLight },
  logoutBtn: { backgroundColor: PremiumTheme.colors.glassBg, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: PremiumTheme.colors.glassBorder },
  logoutText: { color: PremiumTheme.colors.danger, fontWeight: 'bold', fontSize: 12 },
  happyHourBanner: { padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 30, ...PremiumTheme.shadows.glow },
  happyHourText: { color: PremiumTheme.colors.bgDark, fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
  glassCard: { flex: 1, backgroundColor: PremiumTheme.colors.glassBg, padding: 25, borderRadius: 15, borderWidth: 1, borderColor: PremiumTheme.colors.glassBorder, alignItems: 'center', ...PremiumTheme.shadows.card },
  statValue: { fontSize: 32, fontWeight: 'bold', color: PremiumTheme.colors.goldPrimary, marginBottom: 5 },
  statLabel: { fontSize: 12, color: PremiumTheme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 }
});
