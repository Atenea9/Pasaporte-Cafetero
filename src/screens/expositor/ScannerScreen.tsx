import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';

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
    // Asumimos que el QR contiene el UID del visitante
    navigation.navigate('Sale', { visitorUid: data });
  };

  const simulateScan = () => {
    // Para probar en la web de Replit sin cámara
    navigation.navigate('Sale', { visitorUid: 'mock-visitor-123' });
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Solicitando permiso de cámara...</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Sin acceso a la cámara</Text>
        <TouchableOpacity style={styles.simulateBtn} onPress={simulateScan}>
          <Text style={styles.simulateText}>Simular Escaneo (Modo Web)</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escanea el QR del Visitante</Text>

      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />
      </View>

      {scanned && (
        <Button title="Toca para escanear de nuevo" onPress={() => setScanned(false)} />
      )}

      <TouchableOpacity style={styles.simulateBtn} onPress={simulateScan}>
        <Text style={styles.simulateText}>Simular Escaneo (Modo Web)</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ScannerScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#FFF', fontSize: 18, marginBottom: 20, fontWeight: 'bold' },
  permissionText: { color: '#FFF', fontSize: 16, marginBottom: 20 },
  cameraContainer: {
    width: 300,
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  simulateBtn: { marginTop: 40, backgroundColor: '#E07A5F', padding: 15, borderRadius: 10 },
  simulateText: { color: '#FFF', fontWeight: 'bold' },
});
