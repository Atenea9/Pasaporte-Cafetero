import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { ExpositorNavProp } from '../../navigation/types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import LangSelector from '../../components/LangSelector';

export default function ExpositorHomeScreen() {
  const navigation = useNavigation<ExpositorNavProp>();
  const { dispatch } = useApp();
  const { logout } = useAuth();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <LangSelector />
      </View>
      <View style={styles.header}>
        <Text style={styles.title}>{t('expositor.panel_title', '☕ PANEL EXPOSITOR')}</Text>
        <Text style={styles.subtitle}>{t('expositor.manage_stand_sub', 'Gestiona tu stand')}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>{t('expositor.sales_today_label', 'VENTAS HOY')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>{t('expositor.customers_label', 'CLIENTES')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>{t('expositor.points_given_label', 'PUNTOS DADOS')}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.scanBtn}
        onPress={() => navigation.navigate('Scanner')}
      >
        <Text style={styles.scanIcon}>📷</Text>
        <Text style={styles.scanBtnText}>{t('expositor.scan_customer_btn', 'ESCANEAR CLIENTE')}</Text>
        <Text style={styles.scanBtnSub}>{t('expositor.scan_customer_sub_text', 'Registra compras y otorga puntos')}</Text>
      </TouchableOpacity>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>{t('expositor.in_development', '🔧 MÓDULO EN DESARROLLO')}</Text>
        <Text style={styles.infoText}>
          {t('expositor.my_stand', 'Mi Stand')}{'\n'}
          {t('expositor.my_products', 'Mis Productos')}{'\n'}
          {t('expositor.stand_stats', 'Estadísticas del Stand')}{'\n'}
          {t('expositor.scan_to_register', 'Escanea el QR del cliente')}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => logout()}
      >
        <Text style={styles.logoutText}>{t('expositor.logout', 'Cerrar sesión')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0800', padding: 20 },
  topBar: { position: 'absolute', top: 48, right: 16, zIndex: 10 },
  header: { alignItems: 'center', paddingTop: 30, paddingBottom: 24, marginTop: 20 },
  title: { fontSize: 22, fontWeight: '900', color: '#C8860A', letterSpacing: 2 },
  subtitle: { fontSize: 14, color: '#888', marginTop: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1200',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#C8860A33',
  },
  statNumber: { fontSize: 28, fontWeight: '900', color: '#C8860A' },
  statLabel: { fontSize: 10, color: '#888', marginTop: 4, letterSpacing: 1, textAlign: 'center' },
  scanBtn: {
    backgroundColor: '#C8860A',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  scanIcon: { fontSize: 40, marginBottom: 8 },
  scanBtnText: { fontSize: 18, fontWeight: '900', color: '#0D0800', letterSpacing: 2 },
  scanBtnSub: { fontSize: 12, color: '#0D0800', marginTop: 4, opacity: 0.7 },
  infoCard: {
    backgroundColor: '#1A1200',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#C8860A33',
    marginBottom: 20,
  },
  infoTitle: { fontSize: 14, fontWeight: '800', color: '#C8860A', marginBottom: 12, letterSpacing: 1 },
  infoText: { fontSize: 13, color: '#AAA', lineHeight: 22 },
  logoutBtn: { alignItems: 'center', padding: 16 },
  logoutText: { fontSize: 14, color: '#666', textDecorationLine: 'underline' },
});
