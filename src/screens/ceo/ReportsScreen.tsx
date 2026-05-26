import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ReportsScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>‹ Volver</Text>
      </TouchableOpacity>
      <View style={styles.center}>
        <Text style={styles.icon}>📄</Text>
        <Text style={styles.title}>REPORTES</Text>
        <Text style={styles.subtitle}>Módulo en desarrollo</Text>
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
  title: { fontSize: 20, fontWeight: '900', color: '#C8860A', letterSpacing: 2 },
  subtitle: { fontSize: 14, color: '#888', marginTop: 8 },
});
