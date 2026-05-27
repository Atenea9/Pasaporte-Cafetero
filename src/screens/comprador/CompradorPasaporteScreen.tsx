import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';
import { PremiumTheme } from '../../theme/PremiumTheme';

export const CompradorPasaporteScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      mockDbService.getCompradorStats(user!.uid).then(data => {
        if (isActive) { setStats(data); setLoading(false); }
      });
      return () => { isActive = false; };
    }, [user])
  );

  if (loading || !stats) return <ActivityIndicator style={styles.loader} color={PremiumTheme.colors.goldPrimary} />;

  return (
    <LinearGradient colors={[PremiumTheme.colors.bgDark, PremiumTheme.colors.bgMedium]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Volver al Catálogo</Text>
        </TouchableOpacity>

        <Text style={styles.title}>PASAPORTE COMPRADOR</Text>
        <Text style={styles.uid}>ID: {user?.uid.split('-')[2] || user?.uid}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.glassCard}>
            <Text style={styles.statValue}>{stats.activeBids}</Text>
            <Text style={styles.statLabel}>Pujas Activas</Text>
          </View>
          <View style={styles.glassCard}>
            <Text style={styles.statValue}>{stats.lotsWon}</Text>
            <Text style={styles.statLabel}>Lotes Ganados</Text>
          </View>
        </View>

        <View style={styles.stampsContainer}>
          <Text style={styles.stampsTitle}>INSIGNIAS DE SUBASTA</Text>
          <View style={styles.divider} />
          <View style={styles.stampsGrid}>
            {stats.stamps.map((stamp: string, index: number) => (
              <View key={index} style={styles.stampBadge}>
                <Text style={styles.stampText}>{stamp}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </LinearGradient>
  );
};

export default CompradorPasaporteScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 25, paddingTop: 50 },
  loader: { flex: 1, justifyContent: 'center', backgroundColor: PremiumTheme.colors.bgDark },
  backBtn: { marginBottom: 25 },
  backText: { color: PremiumTheme.colors.goldPrimary, fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  title: { fontSize: 22, fontWeight: 'bold', color: PremiumTheme.colors.textLight, letterSpacing: 2 },
  uid: { fontSize: 10, color: PremiumTheme.colors.textMuted, marginBottom: 40, letterSpacing: 2 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 15, marginBottom: 30 },
  glassCard: { flex: 1, backgroundColor: PremiumTheme.colors.glassBg, padding: 25, borderRadius: 15, borderWidth: 1, borderColor: PremiumTheme.colors.glassBorder, alignItems: 'center', ...PremiumTheme.shadows.card },
  statValue: { fontSize: 36, fontWeight: 'bold', color: PremiumTheme.colors.goldPrimary, marginBottom: 5 },
  statLabel: { fontSize: 12, color: PremiumTheme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' },
  stampsContainer: { backgroundColor: PremiumTheme.colors.glassBg, padding: 25, borderRadius: 15, borderWidth: 1, borderColor: PremiumTheme.colors.glassBorder, ...PremiumTheme.shadows.card },
  stampsTitle: { fontSize: 14, fontWeight: 'bold', color: PremiumTheme.colors.goldPrimary, letterSpacing: 1 },
  divider: { height: 1, backgroundColor: PremiumTheme.colors.glassBorder, marginVertical: 15 },
  stampsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stampBadge: { backgroundColor: 'transparent', borderWidth: 1, borderColor: PremiumTheme.colors.goldPrimary, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  stampText: { color: PremiumTheme.colors.goldLight, fontWeight: '600', fontSize: 12, letterSpacing: 1 }
});
