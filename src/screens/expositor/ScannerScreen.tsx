import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { PremiumTheme } from '../../theme/PremiumTheme';

export const ScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    navigation.navigate('Sale', { visitorUid: data });
  };

  const simulateScan = () => {
    navigation.navigate('Sale', { visitorUid: 'mock-visitor-123' });
  };

  if (hasPermission === null) return (
    <LinearGradient colors={[PremiumTheme.colors.bgDark, '#000000']} style={[styles.container, styles.center]}>
      <Text style={styles.text}>Solicitando permiso...</Text>
    </LinearGradient>
  );
  if (hasPermission === false) return (
    <LinearGradient colors={[PremiumTheme.colors.bgDark, '#000000']} style={[styles.container, styles.center]}>
      <Text style={styles.text}>Sin acceso a la cámara</Text>
      <TouchableOpacity style={styles.simulateBtn} onPress={simulateScan}>
        <Text style={styles.simulateText}>Simular Escaneo (Web)</Text>
      </TouchableOpacity>
    </LinearGradient>
  );

  return (
    <LinearGradient colors={[PremiumTheme.colors.bgDark, '#000000']} style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Cancelar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>ESCANEAR PASAPORTE</Text>
      <Text style={styles.subtitle}>Apunta la cámara al QR del visitante</Text>

      <View style={styles.cameraFrame}>
        <View style={styles.cameraContainer}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          />
        </View>
      </View>

      {scanned && (
        <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}>
          <Text style={styles.rescanText}>Volver a Escanear</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.simulateBtn} onPress={simulateScan}>
        <Text style={styles.simulateText}>Simular Escaneo (Web)</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default ScannerScreen;

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  center: { justifyContent: 'center', alignItems: 'center' },
  text: { color: PremiumTheme.colors.textMuted },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10, padding: 10 },
  backText: { color: PremiumTheme.colors.goldPrimary, fontWeight: 'bold' },
  title: { color: PremiumTheme.colors.goldPrimary, fontSize: 18, fontWeight: 'bold', letterSpacing: 2, marginBottom: 10 },
  subtitle: { color: PremiumTheme.colors.textMuted, fontSize: 14, marginBottom: 40 },
  cameraFrame: { padding: 4, borderRadius: 24, backgroundColor: PremiumTheme.colors.goldPrimary, ...PremiumTheme.shadows.glow },
  cameraContainer: { width: 280, height: 280, borderRadius: 20, overflow: 'hidden', backgroundColor: '#000' },
  rescanBtn: { marginTop: 30, padding: 15, borderRadius: 10, borderWidth: 1, borderColor: PremiumTheme.colors.goldPrimary },
  rescanText: { color: PremiumTheme.colors.goldPrimary, fontWeight: 'bold' },
  simulateBtn: { marginTop: 40, backgroundColor: PremiumTheme.colors.glassBg, padding: 15, borderRadius: 10, borderWidth: 1, borderColor: PremiumTheme.colors.glassBorder },
  simulateText: { color: PremiumTheme.colors.textLight, fontWeight: 'bold' }
});
