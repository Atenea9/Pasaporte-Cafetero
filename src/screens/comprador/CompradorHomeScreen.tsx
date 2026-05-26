import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompradorNavProp } from '../../navigation/types';
import { useApp } from '../../context/AppContext';

const MENU_ITEMS = [
  { icon: '☕', label: 'Catálogo', screen: 'Catalog' as const, sub: 'Explora los cafés disponibles' },
  { icon: '🏷️', label: 'Subastas', screen: 'Auctions' as const, sub: 'Participa en subastas de lotes' },
  { icon: '📦', label: 'Mis Pedidos', screen: 'MyOrders' as const, sub: 'Gestiona tus órdenes' },
];

export default function CompradorHomeScreen() {
  const navigation = useNavigation<CompradorNavProp>();
  const { dispatch } = useApp();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.badge}>COMPRADOR CERTIFICADO</Text>
          <Text style={styles.title}>☕ PORTAL COMPRADOR</Text>
          <Text style={styles.subtitle}>Feria del Café Colombiano</Text>
        </View>

        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.screen}
            style={styles.menuCard}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuSub}>{item.sub}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🔧 MÓDULO EN DESARROLLO</Text>
          <Text style={styles.infoText}>
            Este portal incluirá:{'\n'}
            • Catálogo de cafés con certificaciones{'\n'}
            • Sistema de subastas en tiempo real{'\n'}
            • Gestión de órdenes y contratos{'\n'}
            • Trazabilidad de origen{'\n'}
            • Exportación de datos XLSX
          </Text>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => dispatch({ type: 'LOGOUT' } as any)}
        >
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0800' },
  header: { alignItems: 'center', padding: 30, paddingBottom: 20 },
  badge: {
    fontSize: 10,
    color: '#C8860A',
    letterSpacing: 2,
    backgroundColor: '#C8860A22',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
  },
  title: { fontSize: 22, fontWeight: '900', color: '#C8860A', letterSpacing: 2 },
  subtitle: { fontSize: 13, color: '#888', marginTop: 4 },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1200',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#C8860A33',
  },
  menuIcon: { fontSize: 32, marginRight: 16 },
  menuTextWrap: { flex: 1 },
  menuLabel: { fontSize: 16, fontWeight: '800', color: '#F5E6C8', letterSpacing: 1 },
  menuSub: { fontSize: 12, color: '#888', marginTop: 2 },
  arrow: { fontSize: 22, color: '#C8860A', fontWeight: '300' },
  infoCard: {
    backgroundColor: '#1A1200',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    borderWidth: 1,
    borderColor: '#C8860A33',
  },
  infoTitle: { fontSize: 13, fontWeight: '800', color: '#C8860A', marginBottom: 10, letterSpacing: 1 },
  infoText: { fontSize: 13, color: '#AAA', lineHeight: 22 },
  logoutBtn: { alignItems: 'center', padding: 16, marginBottom: 20 },
  logoutText: { fontSize: 14, color: '#666', textDecorationLine: 'underline' },
});
