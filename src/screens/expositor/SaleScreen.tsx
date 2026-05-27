import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';
import { PremiumTheme } from '../../theme/PremiumTheme';

export const SaleScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const visitorUid = route.params?.visitorUid || 'Desconocido';
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const pointsCalculated = amount ? Math.floor(parseInt(amount) / 1000) : 0;

  const handleSale = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido en COP');
      return;
    }

    setLoading(true);
    try {
      const result = await mockDbService.registerSale(user!.uid, visitorUid, Number(amount));
      Alert.alert('¡Éxito!', result.message, [
        { text: 'OK', onPress: () => navigation.navigate('Dashboard') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar la venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[PremiumTheme.colors.bgDark, PremiumTheme.colors.bgMedium]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>

        <Text style={styles.title}>NUEVA TRANSACCIÓN</Text>
        <Text style={styles.subtitle}>ID Visitante: {visitorUid.split('-')[2] || visitorUid}</Text>

        <View style={styles.glassCard}>
          <Text style={styles.label}>Monto de compra (COP)</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySign}>$</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={PremiumTheme.colors.textMuted}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              selectionColor={PremiumTheme.colors.goldPrimary}
            />
          </View>

          <View style={styles.pointsPreview}>
            <Text style={styles.pointsText}>Puntos a otorgar:</Text>
            <Text style={styles.pointsValue}>{pointsCalculated} <Text style={styles.pts}>PTS</Text></Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSale}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient colors={[PremiumTheme.colors.goldPrimary, PremiumTheme.colors.goldDark]} style={styles.btnGradient}>
            {loading ? <ActivityIndicator color="#1A110A" /> : <Text style={styles.buttonText}>Confirmar y Otorgar Sello</Text>}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancelar Transacción</Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default SaleScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1, padding: 25, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: PremiumTheme.colors.goldPrimary, textAlign: 'center', letterSpacing: 2 },
  subtitle: { fontSize: 12, color: PremiumTheme.colors.textMuted, textAlign: 'center', marginBottom: 40, letterSpacing: 1 },
  glassCard: { backgroundColor: PremiumTheme.colors.glassBg, padding: 25, borderRadius: 20, borderWidth: 1, borderColor: PremiumTheme.colors.glassBorder, marginBottom: 30, ...PremiumTheme.shadows.card },
  label: { fontSize: 14, color: PremiumTheme.colors.textLight, marginBottom: 15, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: PremiumTheme.colors.goldPrimary, paddingBottom: 5, marginBottom: 25 },
  currencySign: { fontSize: 32, color: PremiumTheme.colors.goldPrimary, fontWeight: 'bold', marginRight: 10 },
  input: { flex: 1, fontSize: 36, fontWeight: 'bold', color: PremiumTheme.colors.textLight },
  pointsPreview: { backgroundColor: 'rgba(0,0,0,0.3)', padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pointsText: { fontSize: 14, color: PremiumTheme.colors.textMuted },
  pointsValue: { fontSize: 20, fontWeight: 'bold', color: PremiumTheme.colors.textLight },
  pts: { fontSize: 12, color: PremiumTheme.colors.goldPrimary },
  button: { borderRadius: 15, overflow: 'hidden', ...PremiumTheme.shadows.glow },
  btnGradient: { padding: 20, alignItems: 'center' },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: PremiumTheme.colors.bgDark, fontWeight: 'bold', fontSize: 15, textTransform: 'uppercase', letterSpacing: 1 },
  cancelBtn: { marginTop: 25, alignItems: 'center', padding: 10 },
  cancelText: { color: PremiumTheme.colors.textMuted, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }
});
