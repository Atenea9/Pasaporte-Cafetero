import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';
import { PremiumTheme } from '../../theme/PremiumTheme';

export const CeoDashboardScreen = () => {
  const { logout } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  useFocusEffect(useCallback(() => { mockDbService.getCeoMetrics().then(setMetrics); }, []));

  const handleExport = async () => {
    setExporting(true);
    await mockDbService.generateDatabaseExport();
    setExporting(false);
    Alert.alert('Exportación Exitosa', 'Archivo generado en servidor mock.');
  };

  if (!metrics) return <ActivityIndicator style={styles.loader} color={PremiumTheme.colors.goldPrimary} />;

  return (
    <LinearGradient colors={['#000', PremiumTheme.colors.bgMedium]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>DIRECTORIO EJECUTIVO</Text>
        <Text style={styles.subtitle}>Visión Global del Sistema</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}><Text style={styles.logoutText}>Cerrar Sesión</Text></TouchableOpacity>
      </View>

      <View style={styles.glassCard}>
        <Text style={styles.label}>Usuarios Activos Totales</Text>
        <Text style={styles.val}>{metrics.totalUsers}</Text>
        <View style={styles.divider} />
        <Text style={styles.label}>Valor Transado Subasta (USD)</Text>
        <Text style={styles.valGold}>${metrics.totalAuctionValueUSD.toLocaleString()}</Text>
      </View>

      <TouchableOpacity onPress={handleExport} disabled={exporting} activeOpacity={0.8}>
        <LinearGradient colors={['#4DA8DA', '#00509E']} style={styles.btnGradient}>
          {exporting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>EXPORTAR DATABASE (XLSX)</Text>}
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default CeoDashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', backgroundColor: '#000' },
  header: { padding: 25, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: PremiumTheme.colors.glassBorder, marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: PremiumTheme.colors.textLight, letterSpacing: 2 },
  subtitle: { fontSize: 12, color: PremiumTheme.colors.textMuted, marginTop: 5 },
  logoutBtn: { position: 'absolute', top: 60, right: 25 },
  logoutText: { color: PremiumTheme.colors.danger, fontWeight: 'bold' },
  glassCard: { backgroundColor: PremiumTheme.colors.glassBg, margin: 20, padding: 25, borderRadius: 15, borderWidth: 1, borderColor: PremiumTheme.colors.glassBorder, ...PremiumTheme.shadows.card },
  label: { fontSize: 12, color: PremiumTheme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
  val: { fontSize: 32, fontWeight: 'bold', color: PremiumTheme.colors.textLight },
  valGold: { fontSize: 36, fontWeight: 'bold', color: PremiumTheme.colors.goldPrimary },
  divider: { height: 1, backgroundColor: PremiumTheme.colors.glassBorder, marginVertical: 20 },
  btnGradient: { margin: 20, padding: 20, borderRadius: 15, alignItems: 'center', ...PremiumTheme.shadows.card },
  btnText: { color: '#FFF', fontWeight: 'bold', letterSpacing: 1 }
});
