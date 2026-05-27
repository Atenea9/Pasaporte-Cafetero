import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService, VisitorStats } from '../../services/mockDb.service';
import { PremiumTheme } from '../../theme/PremiumTheme';

export const PasaporteScreen = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      if (user) {
        mockDbService.getUserStats(user.uid).then(data => {
          if (isActive) { setStats(data); setLoading(false); }
        });
      }
      return () => { isActive = false; };
    }, [user])
  );

  if (loading) return <ActivityIndicator style={styles.loader} color={PremiumTheme.colors.goldPrimary} />;

  return (
    <LinearGradient colors={[PremiumTheme.colors.bgDark, PremiumTheme.colors.bgMedium]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <LinearGradient colors={['#3A2618', '#1A110A']} style={styles.membershipCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>PASAPORTE CAFETERO</Text>
            <Text style={styles.levelBadge}>{stats?.level.toUpperCase()}</Text>
          </View>
          <View style={styles.qrPlaceholder}><Text style={styles.qrText}>[ QR EXCLUSIVO ]</Text></View>
          <Text style={styles.uidText}>ID: {user?.uid.split('-')[2] || user?.uid}</Text>
        </LinearGradient>

        <View style={styles.glassContainer}>
          <Text style={styles.pointsLabel}>Balance de Puntos</Text>
          <Text style={styles.pointsValue}>{stats?.points} <Text style={styles.pts}>PTS</Text></Text>
          <View style={styles.divider} />
          <Text style={styles.stampsTitle}>Sellos de Origen ({stats?.stamps.length})</Text>
          <View style={styles.stampsGrid}>
            {stats?.stamps.map((stamp, index) => (
              <View key={index} style={styles.stampBadge}><Text style={styles.stampText}>{stamp}</Text></View>
            ))}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default PasaporteScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 25, paddingTop: 50 },
  loader: { flex: 1, justifyContent: 'center', backgroundColor: PremiumTheme.colors.bgDark },
  membershipCard: { padding: 25, borderRadius: 20, borderWidth: 1, borderColor: PremiumTheme.colors.goldPrimary, marginBottom: 30, ...PremiumTheme.shadows.glow },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  cardTitle: { color: PremiumTheme.colors.goldPrimary, fontWeight: 'bold', letterSpacing: 2, fontSize: 12 },
  levelBadge: { backgroundColor: PremiumTheme.colors.goldPrimary, color: PremiumTheme.colors.bgDark, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 10, fontWeight: 'bold', overflow: 'hidden' },
  qrPlaceholder: { height: 180, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  qrText: { color: PremiumTheme.colors.bgDark, fontWeight: '900', letterSpacing: 2 },
  uidText: { color: PremiumTheme.colors.textMuted, fontSize: 10, textAlign: 'center', letterSpacing: 2 },
  glassContainer: { backgroundColor: PremiumTheme.colors.glassBg, padding: 25, borderRadius: 20, borderWidth: 1, borderColor: PremiumTheme.colors.glassBorder, ...PremiumTheme.shadows.card },
  pointsLabel: { color: PremiumTheme.colors.textMuted, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },
  pointsValue: { color: PremiumTheme.colors.textLight, fontSize: 40, fontWeight: 'bold', marginVertical: 5 },
  pts: { fontSize: 18, color: PremiumTheme.colors.goldPrimary },
  divider: { height: 1, backgroundColor: PremiumTheme.colors.glassBorder, marginVertical: 20 },
  stampsTitle: { color: PremiumTheme.colors.textLight, fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  stampsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stampBadge: { backgroundColor: 'transparent', borderWidth: 1, borderColor: PremiumTheme.colors.goldPrimary, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  stampText: { color: PremiumTheme.colors.goldLight, fontWeight: '600', fontSize: 12, letterSpacing: 1 }
});
