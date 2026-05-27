import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';
import { useNavigation } from '@react-navigation/native';
import { PremiumTheme } from '../../theme/PremiumTheme';

export const ExpositorDashboardScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockDbService.getStandStats(user!.uid).then(data => {
      setStats(data);
      setLoading(false);
    });
  }, [user]);

  if (loading) return <ActivityIndicator style={styles.loader} color={PremiumTheme.colors.goldPrimary} />;

  return (
    <LinearGradient colors={[PremiumTheme.colors.bgDark, PremiumTheme.colors.bgMedium]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.standName}>{stats?.standName}</Text>
            <Text style={styles.municipality}>{stats?.municipality} • Expositor</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.glassCard}>
            <Text style={styles.statLabel}>Ventas Hoy</Text>
            <Text style={styles.statValue}>${stats?.todaySalesCOP.toLocaleString()}</Text>
          </View>
          <View style={styles.glassCard}>
            <Text style={styles.statLabel}>Sellos</Text>
            <Text style={styles.statValue}>{stats?.stampsIssued}</Text>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.scanButton} onPress={() => navigation.navigate('Scanner')} activeOpacity={0.8}>
            <LinearGradient colors={[PremiumTheme.colors.goldPrimary, PremiumTheme.colors.goldDark]} style={styles.btnGradient}>
              <Text style={styles.scanButtonText}>[ 📸 ] Escanear Pasaporte</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.hint}>Registra ventas del Stand escaneando el QR del visitante.</Text>
        </View>

        <View style={styles.auctionContainer}>
          <Text style={styles.sectionTitle}>Subasta Internacional</Text>
          <Text style={styles.auctionDesc}>Registra tu lote de café especial para la subasta con compradores internacionales.</Text>
          <TouchableOpacity style={styles.auctionButton} onPress={() => navigation.navigate('SubastaDashboard')} activeOpacity={0.8}>
            <Text style={styles.auctionButtonText}>Gestionar Lote de Subasta</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </LinearGradient>
  );
};

export default ExpositorDashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 25, paddingTop: 60 },
  loader: { flex: 1, justifyContent: 'center', backgroundColor: PremiumTheme.colors.bgDark },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 },
  headerTextContainer: { flex: 1, paddingRight: 10 },
  standName: { fontSize: 26, fontWeight: 'bold', color: PremiumTheme.colors.textLight, marginBottom: 5 },
  municipality: { fontSize: 14, color: PremiumTheme.colors.goldPrimary, letterSpacing: 1, textTransform: 'uppercase' },
  logoutBtn: { backgroundColor: PremiumTheme.colors.glassBg, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: PremiumTheme.colors.glassBorder },
  logoutText: { color: PremiumTheme.colors.danger, fontWeight: 'bold', fontSize: 12 },
  statsContainer: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  glassCard: { flex: 1, backgroundColor: PremiumTheme.colors.glassBg, padding: 20, borderRadius: 15, borderWidth: 1, borderColor: PremiumTheme.colors.glassBorder, ...PremiumTheme.shadows.card },
  statLabel: { fontSize: 12, color: PremiumTheme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: PremiumTheme.colors.textLight },
  actionContainer: { alignItems: 'center', marginBottom: 40 },
  scanButton: { width: '100%', borderRadius: 15, overflow: 'hidden', ...PremiumTheme.shadows.glow },
  btnGradient: { padding: 20, alignItems: 'center' },
  scanButtonText: { color: PremiumTheme.colors.bgDark, fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  hint: { textAlign: 'center', color: PremiumTheme.colors.textMuted, marginTop: 15, fontSize: 12 },
  auctionContainer: { backgroundColor: PremiumTheme.colors.glassBg, padding: 25, borderRadius: 20, borderWidth: 1, borderColor: PremiumTheme.colors.glassBorder, ...PremiumTheme.shadows.card },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: PremiumTheme.colors.goldPrimary, marginBottom: 5 },
  auctionDesc: { fontSize: 13, color: PremiumTheme.colors.textMuted, marginBottom: 20, lineHeight: 20 },
  auctionButton: { backgroundColor: 'transparent', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: PremiumTheme.colors.goldPrimary, alignItems: 'center' },
  auctionButtonText: { color: PremiumTheme.colors.goldPrimary, fontWeight: 'bold', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }
});
