import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';

export const CeoDashboardScreen = () => {
  const { logout } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const data = await mockDbService.getCeoMetrics();
    setMetrics(data);
    setLoading(false);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await mockDbService.generateDatabaseExport();
      Alert.alert(
        '📊 Exportación Completa',
        `Base de datos generada exitosamente.\n\nArchivo: pasaporte_export.xlsx\nRuta: ${result.url}`
      );
    } catch {
      Alert.alert('Error', 'No se pudo generar la exportación');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <ActivityIndicator style={styles.loader} color="#C8860A" />;

  const isOperational = metrics.sysStatus === 'Operativo';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.badge}>👔 CEO</Text>
        <Text style={styles.title}>Dashboard Ejecutivo</Text>
        <Text onPress={logout} style={styles.logout}>Cerrar Sesión</Text>
      </View>

      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiIcon}>👥</Text>
          <Text style={styles.kpiValue}>{metrics.totalUsers.toLocaleString()}</Text>
          <Text style={styles.kpiLabel}>TOTAL USUARIOS</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiIcon}>🏷️</Text>
          <Text style={styles.kpiValue}>{metrics.activeBuyers}</Text>
          <Text style={styles.kpiLabel}>COMPRADORES</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiIcon}>💵</Text>
          <Text style={styles.kpiValue}>${metrics.totalAuctionValueUSD.toLocaleString()}</Text>
          <Text style={styles.kpiLabel}>VALOR SUBASTA (USD)</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiIcon}>{isOperational ? '🟢' : '🔴'}</Text>
          <Text style={[styles.kpiValue, isOperational ? styles.sysOk : styles.sysErr]}>
            {metrics.sysStatus}
          </Text>
          <Text style={styles.kpiLabel}>SISTEMA</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exportación de Datos</Text>
        <Text style={styles.sectionDesc}>
          Genera un archivo XLSX con toda la información de visitantes, expositors, pujas y transacciones de la feria.
        </Text>
        <TouchableOpacity
          style={[styles.exportButton, exporting && styles.exportDisabled]}
          onPress={handleExport}
          disabled={exporting}
        >
          {exporting
            ? (
              <View style={styles.exportRow}>
                <ActivityIndicator color="#FFF" style={{ marginRight: 10 }} />
                <Text style={styles.exportText}>Generando XLSX...</Text>
              </View>
            )
            : <Text style={styles.exportText}>📊 Exportar Base de Datos (XLSX)</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CeoDashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0800' },
  loader: { flex: 1, justifyContent: 'center', backgroundColor: '#0D0800' },
  header: { padding: 30, alignItems: 'center', backgroundColor: '#1A1200' },
  badge: {
    fontSize: 11, color: '#C8860A', letterSpacing: 2,
    backgroundColor: '#C8860A22', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20, marginBottom: 10, overflow: 'hidden',
  },
  title: { fontSize: 20, fontWeight: '900', color: '#C8860A', letterSpacing: 2 },
  logout: { color: '#E07A5F', marginTop: 12, fontSize: 14 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 10 },
  kpiCard: {
    width: '47%', backgroundColor: '#1A1200', borderRadius: 14,
    padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#C8860A33',
  },
  kpiIcon: { fontSize: 26, marginBottom: 6 },
  kpiValue: { fontSize: 22, fontWeight: '900', color: '#C8860A' },
  kpiLabel: { fontSize: 9, color: '#888', marginTop: 4, letterSpacing: 1, textAlign: 'center' },
  sysOk: { color: '#4CAF50' },
  sysErr: { color: '#E07A5F' },
  section: { margin: 16, padding: 20, backgroundColor: '#1A1200', borderRadius: 16, borderWidth: 1, borderColor: '#C8860A33' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#F5E6C8', marginBottom: 8 },
  sectionDesc: { fontSize: 13, color: '#888', marginBottom: 16, lineHeight: 20 },
  exportButton: { backgroundColor: '#C8860A', padding: 18, borderRadius: 12, alignItems: 'center' },
  exportDisabled: { opacity: 0.6 },
  exportRow: { flexDirection: 'row', alignItems: 'center' },
  exportText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
});
