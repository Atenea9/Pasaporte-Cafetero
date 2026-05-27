import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';
import { PremiumTheme } from '../../theme/PremiumTheme';

export const CompradorDashboardScreen = () => {
  const { logout } = useAuth();
  const navigation = useNavigation<any>();
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      mockDbService.getAuctionLots().then(data => { if (isActive) { setLots(data); setLoading(false); } });
      return () => { isActive = false; };
    }, [])
  );

  if (loading) return <ActivityIndicator style={styles.loader} color={PremiumTheme.colors.goldPrimary} />;

  return (
    <LinearGradient colors={[PremiumTheme.colors.bgDark, PremiumTheme.colors.bgMedium]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SUBASTA INTERNACIONAL</Text>
        <Text style={styles.subtitle}>Catálogo de Lotes Especiales</Text>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => navigation.navigate('CompradorPasaporte')}><Text style={styles.link}>Mi Perfil</Text></TouchableOpacity>
          <TouchableOpacity onPress={logout}><Text style={styles.logout}>Salir</Text></TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={lots}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.glassCard} onPress={() => navigation.navigate('LotDetail', { lotId: item.id })} activeOpacity={0.8}>
            <View style={styles.cardHeader}>
              <Text style={styles.farmName}>{item.farmName}</Text>
              <View style={styles.scoreBadge}><Text style={styles.scoreText}>SCA {item.scaScore}</Text></View>
            </View>
            <Text style={styles.detailText}>{item.variety} • {item.lotSizeKg} Kg</Text>
            <View style={styles.bidRow}>
              <Text style={styles.bidLabel}>Puja Actual:</Text>
              <Text style={styles.bidValue}>${item.currentBidUSD.toFixed(2)} USD</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </LinearGradient>
  );
};

export default CompradorDashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', backgroundColor: PremiumTheme.colors.bgDark },
  header: { padding: 25, paddingTop: 60, backgroundColor: 'rgba(0,0,0,0.5)', borderBottomWidth: 1, borderBottomColor: PremiumTheme.colors.glassBorder },
  title: { fontSize: 20, fontWeight: 'bold', color: PremiumTheme.colors.goldPrimary, letterSpacing: 2 },
  subtitle: { fontSize: 12, color: PremiumTheme.colors.textMuted, marginTop: 5, letterSpacing: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  link: { color: PremiumTheme.colors.goldLight, fontWeight: 'bold', letterSpacing: 1 },
  logout: { color: PremiumTheme.colors.danger, fontWeight: 'bold', letterSpacing: 1 },
  list: { padding: 20 },
  glassCard: { backgroundColor: PremiumTheme.colors.glassBg, padding: 20, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: PremiumTheme.colors.glassBorder, ...PremiumTheme.shadows.card },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  farmName: { fontSize: 18, fontWeight: 'bold', color: PremiumTheme.colors.textLight, flex: 1 },
  scoreBadge: { backgroundColor: PremiumTheme.colors.goldPrimary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  scoreText: { color: PremiumTheme.colors.bgDark, fontWeight: 'bold', fontSize: 12 },
  detailText: { fontSize: 14, color: PremiumTheme.colors.textMuted, marginBottom: 10 },
  bidRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: PremiumTheme.colors.glassBorder },
  bidLabel: { fontSize: 14, color: PremiumTheme.colors.textMuted },
  bidValue: { fontSize: 16, fontWeight: 'bold', color: PremiumTheme.colors.goldPrimary }
});
