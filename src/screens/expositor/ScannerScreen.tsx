import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { ExpositorNavProp } from '../../navigation/types';

export default function ScannerScreen() {
  const navigation = useNavigation<ExpositorNavProp>();

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>‹ Volver</Text>
      </TouchableOpacity>

      <View style={styles.center}>
        <Text style={styles.icon}>📷</Text>
        <Text style={styles.title}>ESCÁNER QR</Text>
        <Text style={styles.subtitle}>
          Aquí se integrará la cámara para escanear{'\n'}
          el código QR del pasaporte del visitante.
        </Text>
        <View style={styles.placeholder}>
          <View style={styles.corner} />
          <Text style={styles.placeholderText}>VISOR DE CÁMARA</Text>
        </View>
        <Text style={styles.note}>📦 Módulo en desarrollo</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0800', padding: 20 },
  backBtn: { paddingVertical: 8 },
  backText: { fontSize: 16, color: '#C8860A', fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 60, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '900', color: '#C8860A', letterSpacing: 2, marginBottom: 12 },
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  placeholder: {
    width: 240,
    height: 240,
    borderWidth: 2,
    borderColor: '#C8860A',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  corner: {},
  placeholderText: { fontSize: 12, color: '#C8860A66', letterSpacing: 2 },
  note: { fontSize: 13, color: '#666' },
});
