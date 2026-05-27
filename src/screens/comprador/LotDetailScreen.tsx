import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { mockDbService } from '../../services/mockDb.service';
import { PremiumTheme } from '../../theme/PremiumTheme';

export const LotDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const lotId = route.params?.lotId;
  const [lot, setLot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bidInput, setBidInput] = useState('');
  const [bidding, setBidding] = useState(false);

  const loadLotDetails = async () => {
    const data = await mockDbService.getLotDetails(lotId);
    setLot(data);
    setBidInput((data.currentBidUSD + 0.50).toFixed(2));
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { loadLotDetails(); }, [lotId]));

  const handleBid = async () => {
    const amount = parseFloat(bidInput);
    if (isNaN(amount) || amount <= lot.currentBidUSD) {
      Alert.alert('Error', 'La puja debe ser mayor a la puja actual.');
      return;
    }

    setBidding(true);
    try {
      const result = await mockDbService.placeBid(lot.id, user!.uid, amount);
      Alert.alert('¡Éxito!', result.message);
      loadLotDetails();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setBidding(false);
    }
  };

  if (loading || !lot) return <ActivityIndicator style={styles.loader} color={PremiumTheme.colors.goldPrimary} />;

  return (
    <LinearGradient colors={[PremiumTheme.colors.bgDark, PremiumTheme.colors.bgMedium]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Volver al Catálogo</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.farmName}>{lot.farmName}</Text>
            <Text style={styles.subtitle}>{lot.variety} • {lot.process}</Text>
          </View>

          <View style={styles.glassCard}>
            <Text style={styles.sectionTitle}>Ficha Técnica</Text>
            <Text style={styles.detail}>Productor: <Text style={styles.bold}>{lot.owner}</Text></Text>
            <Text style={styles.detail}>Origen: <Text style={styles.bold}>{lot.municipality}</Text></Text>
            <Text style={styles.detail}>Altitud: <Text style={styles.bold}>{lot.altitude} msnm</Text></Text>
            <Text style={styles.detail}>Tamaño Lote: <Text style={styles.bold}>{lot.lotSizeKg} Kg</Text></Text>
          </View>

          <View style={styles.glassCard}>
            <Text style={styles.sectionTitle}>Puntaje SCA: <Text style={styles.goldText}>{lot.scaScore}</Text></Text>
            <View style={styles.scaGrid}>
              {Object.entries(lot.scaDetails).map(([key, value]: any) => (
                <View key={key} style={styles.scaItem}>
                  <Text style={styles.scaKey}>{key.toUpperCase()}</Text>
                  <Text style={styles.scaValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.bidSection}>
            <Text style={styles.currentBidText}>Puja Actual: <Text style={styles.bidValueHighlight}>${lot.currentBidUSD.toFixed(2)} USD</Text> / lb</Text>

            <Text style={styles.inputLabel}>Tu Oferta (USD / lb):</Text>
            <View style={styles.bidInputRow}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={bidInput}
                onChangeText={setBidInput}
                selectionColor={PremiumTheme.colors.goldPrimary}
              />
            </View>

            <TouchableOpacity style={[styles.bidButton, bidding && styles.disabled]} onPress={handleBid} disabled={bidding} activeOpacity={0.8}>
              <LinearGradient colors={[PremiumTheme.colors.goldPrimary, PremiumTheme.colors.goldDark]} style={styles.btnGradient}>
                {bidding ? <ActivityIndicator color="#1A110A" /> : <Text style={styles.bidButtonText}>Colocar Puja</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default LotDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 25, paddingTop: 50 },
  loader: { flex: 1, justifyContent: 'center', backgroundColor: PremiumTheme.colors.bgDark },
  backBtn: { marginBottom: 20 },
  backText: { color: PremiumTheme.colors.goldPrimary, fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  header: { marginBottom: 30 },
  farmName: { fontSize: 28, fontWeight: 'bold', color: PremiumTheme.colors.textLight },
  subtitle: { fontSize: 16, color: PremiumTheme.colors.textMuted, marginTop: 5, letterSpacing: 1 },
  glassCard: { backgroundColor: PremiumTheme.colors.glassBg, padding: 20, borderRadius: 15, borderWidth: 1, borderColor: PremiumTheme.colors.glassBorder, marginBottom: 20, ...PremiumTheme.shadows.card },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: PremiumTheme.colors.goldPrimary, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: PremiumTheme.colors.glassBorder, paddingBottom: 10, letterSpacing: 1, textTransform: 'uppercase' },
  detail: { fontSize: 14, color: PremiumTheme.colors.textMuted, marginBottom: 8 },
  bold: { color: PremiumTheme.colors.textLight, fontWeight: 'bold' },
  goldText: { color: PremiumTheme.colors.goldPrimary },
  scaGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  scaItem: { width: '48%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  scaKey: { fontSize: 11, color: PremiumTheme.colors.textMuted, letterSpacing: 1 },
  scaValue: { fontSize: 12, fontWeight: 'bold', color: PremiumTheme.colors.textLight },
  bidSection: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 25, borderRadius: 15, marginTop: 10, marginBottom: 40, borderWidth: 1, borderColor: PremiumTheme.colors.goldDark },
  currentBidText: { color: PremiumTheme.colors.textLight, fontSize: 16, textAlign: 'center', marginBottom: 25 },
  bidValueHighlight: { fontSize: 24, fontWeight: 'bold', color: PremiumTheme.colors.success },
  inputLabel: { color: PremiumTheme.colors.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  bidInputRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: PremiumTheme.colors.goldPrimary, paddingBottom: 5 },
  dollarSign: { fontSize: 24, fontWeight: 'bold', color: PremiumTheme.colors.goldPrimary, marginRight: 10 },
  input: { flex: 1, fontSize: 28, fontWeight: 'bold', color: PremiumTheme.colors.textLight },
  bidButton: { borderRadius: 12, overflow: 'hidden', marginTop: 30, ...PremiumTheme.shadows.glow },
  btnGradient: { padding: 18, alignItems: 'center' },
  disabled: { opacity: 0.6 },
  bidButtonText: { color: PremiumTheme.colors.bgDark, fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }
});
