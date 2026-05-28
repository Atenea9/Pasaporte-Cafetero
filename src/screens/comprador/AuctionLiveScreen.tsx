import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LOTES_SUBASTA, LoteSubasta, getMunicipio } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';

const C = { bg: '#0B1608', card: '#142210', card2: '#1C3018', gold: '#CFA020', goldLight: '#EAC040', text: '#F3EED6', muted: '#6A8060', danger: '#E05050', green: '#4CAF50' };

const MOCK_BID_HISTORY = [
  { bidder: '🇩🇪 Hamburger Kaffee', amount: 14500, time: '14:32' },
  { bidder: '🇯🇵 Tokyo Select', amount: 13800, time: '14:28' },
  { bidder: '🇺🇸 Blue Bottle NYC', amount: 13200, time: '14:15' },
  { bidder: '🇬🇧 Monmouth Coffee', amount: 12500, time: '13:58' },
];

export default function AuctionLiveScreen() {
  const { t } = useTranslation();
  const nav = useNavigation();
  const route = useRoute<any>();
  const { user } = useAuth();
  const lotId: string = route.params?.lotId ?? 'lot1';

  const [lot, setLot] = useState<LoteSubasta | null>(LOTES_SUBASTA.find(l => l.id === lotId) ?? LOTES_SUBASTA[0]);
  const [bidInput, setBidInput] = useState('');
  const [bidding, setBidding] = useState(false);
  const [bidSuccess, setBidSuccess] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (lot?.activa) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 800, useNativeDriver: true }),
      ])).start();
    }
  }, [lot]);

  if (!lot) return null;

  const mun = getMunicipio(lot.municipioId);

  const handleBid = () => {
    const amount = parseFloat(bidInput);
    if (isNaN(amount) || amount <= lot.puja_actual_usd) {
      Alert.alert('Puja inválida', t('auction.bid_min_error', 'Tu puja debe ser mayor a la puja actual.'));
      return;
    }
    setBidding(true);
    setTimeout(() => {
      setLot(prev => prev ? { ...prev, puja_actual_usd: amount, num_pujas: prev.num_pujas + 1 } : prev);
      setBidding(false);
      setBidSuccess(true);
      setBidInput('');
      Animated.spring(successAnim, { toValue: 1, useNativeDriver: true }).start(() => {
        setTimeout(() => { Animated.timing(successAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start(); setBidSuccess(false); }, 2500);
      });
    }, 1200);
  };

  return (
    <LinearGradient colors={[C.bg, '#0A180A', C.bg]} style={s.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => nav.goBack()} style={s.backBtn}>
            <Text style={s.backText}>‹ Volver</Text>
          </TouchableOpacity>
          {lot.activa ? (
            <Animated.View style={[s.liveChip, { transform: [{ scale: pulseAnim }] }]}>
              <View style={s.liveDot} />
              <Text style={s.liveText}>{t('auction.live_auction', 'SUBASTA EN VIVO')}</Text>
            </Animated.View>
          ) : (
            <View style={[s.liveChip, { backgroundColor: C.card2 }]}>
              <Text style={[s.liveText, { color: C.muted }]}>{t('auction.closed', 'CERRADA')}</Text>
            </View>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          {/* Lot Header */}
          <View style={s.lotHeader}>
            <View style={s.scaBadge}>
              <Text style={s.scaNum}>{lot.sca.toFixed(1)}</Text>
              <Text style={s.scaLabel}>SCA</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={s.lotName}>{lot.nombre}</Text>
              <Text style={s.farmName}>{lot.finca}</Text>
              {mun && <Text style={s.munName}>{mun.emoji}  {mun.nombre}, Tolima</Text>}
            </View>
          </View>

          {/* Current Bid */}
          <LinearGradient colors={lot.activa ? ['#7A5200', C.gold + '33', C.card] : [C.card2, C.card]} style={s.bidCard}>
            <Text style={s.bidLabel}>{t('auction.current_bid', 'PUJA ACTUAL')}</Text>
            <Text style={[s.bidAmount, { color: lot.activa ? C.gold : C.muted }]}>
              ${lot.puja_actual_usd.toLocaleString('en-US')} <Text style={s.usd}>USD</Text>
            </Text>
            <View style={s.bidMeta}>
              <Text style={s.bidCount}>{lot.num_pujas} {t('auction.bids', 'pujas')}</Text>
              <Text style={s.bidBase}>{t('auction.base_price', 'Base')}: ${lot.puja_base_usd.toLocaleString('en-US')}</Text>
            </View>
          </LinearGradient>

          {/* Lot Details */}
          <View style={s.detailsGrid}>
            {[
              { icon: '🌱', label: t('auction.variety', 'Variedad'), val: lot.variedad },
              { icon: '⚗️', label: t('auction.process', 'Proceso'), val: lot.proceso },
              { icon: '⛰️', label: t('auction.altitude', 'Altitud'), val: `${lot.altitud} m.s.n.m.` },
              { icon: '⚖️', label: t('auction.weight', 'Peso'), val: `${lot.peso_kg} kg` },
            ].map((item, i) => (
              <View key={i} style={s.detailCell}>
                <Text style={s.detailIcon}>{item.icon}</Text>
                <Text style={s.detailLabel}>{item.label}</Text>
                <Text style={s.detailVal}>{item.val}</Text>
              </View>
            ))}
          </View>

          {/* Cupping Notes */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>☕  {t('auction.notes', 'NOTAS DE CATA')}</Text>
            <View style={s.notesRow}>
              {lot.notas.map((nota, i) => (
                <View key={i} style={s.noteChip}>
                  <Text style={s.noteText}>{nota}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Farmer Profile */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>👨‍🌾  {t('auction.farmer', 'CAFICULTOR')}</Text>
            <View style={s.farmerCard}>
              <View style={s.farmerAvatar}>
                <Text style={s.farmerAvatarText}>{lot.caficultor.split(' ').map(w => w[0]).slice(0, 2).join('')}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.farmerName}>{lot.caficultor}</Text>
                <Text style={s.farmerFinca}>{lot.finca}</Text>
                {mun && <Text style={s.farmerLocation}>📍 {mun.nombre}, Tolima · {lot.altitud} m.s.n.m.</Text>}
              </View>
            </View>
          </View>

          {/* Farm History */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>📖  {t('auction.history', 'HISTORIA DE LA FINCA')}</Text>
            <Text style={s.historyText}>{lot.historia}</Text>
          </View>

          {/* Bid History */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>📊  HISTORIAL DE PUJAS</Text>
            {MOCK_BID_HISTORY.slice(0, lot.num_pujas > 3 ? 4 : lot.num_pujas).map((bid, i) => (
              <View key={i} style={s.bidHistRow}>
                <Text style={s.bidHistBidder}>{bid.bidder}</Text>
                <Text style={s.bidHistAmount}>${bid.amount.toLocaleString('en-US')} USD</Text>
                <Text style={s.bidHistTime}>{bid.time}</Text>
              </View>
            ))}
            {lot.num_pujas === 0 && <Text style={s.noBids}>Sé el primero en pujar por este lote.</Text>}
          </View>

          {/* Place Bid */}
          {lot.activa && (
            <View style={s.placeBidSection}>
              <Text style={s.placeBidTitle}>{t('auction.place_bid', 'REALIZAR PUJA')}</Text>
              <Text style={s.placeBidSub}>Puja mínima: ${(lot.puja_actual_usd + 100).toLocaleString('en-US')} USD</Text>

              {bidSuccess && (
                <Animated.View style={[s.successBanner, { transform: [{ scale: successAnim }] }]}>
                  <Text style={s.successText}>✅  {t('auction.bid_success', '¡Puja registrada exitosamente!')}</Text>
                </Animated.View>
              )}

              <View style={s.bidInputRow}>
                <View style={s.usdPrefix}><Text style={s.usdPrefixText}>$</Text></View>
                <TextInput
                  style={s.bidInput}
                  value={bidInput}
                  onChangeText={setBidInput}
                  placeholder={`Mín. ${lot.puja_actual_usd + 100}`}
                  placeholderTextColor={C.muted}
                  keyboardType="numeric"
                  editable={!bidding}
                />
                <Text style={s.usdSuffix}>USD</Text>
              </View>

              <TouchableOpacity onPress={handleBid} disabled={bidding || !bidInput} activeOpacity={0.8}>
                <LinearGradient
                  colors={bidding || !bidInput ? [C.card2, C.card2] : [C.gold, '#A07A00']}
                  style={s.bidBtn}
                >
                  <Text style={[s.bidBtnText, !bidInput && { color: C.muted }]}>
                    {bidding ? '⏳  Procesando...' : `🏷️  ${t('auction.place_bid', 'REALIZAR PUJA')} ${bidInput ? '— $' + parseFloat(bidInput || '0').toLocaleString('en-US') + ' USD' : ''}`}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {!lot.activa && (
            <View style={s.closedNotice}>
              <Text style={s.closedIcon}>🔒</Text>
              <Text style={s.closedText}>Esta subasta está cerrada. El lote fue adjudicado.</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 54, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.card2 },
  backBtn: {},
  backText: { fontSize: 16, color: C.gold, fontWeight: '700' },
  liveChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#C62828', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FF8080' },
  liveText: { fontSize: 10, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  scroll: { padding: 20, paddingBottom: 50 },
  lotHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  scaBadge: { alignItems: 'center', backgroundColor: C.gold, borderRadius: 14, padding: 12, minWidth: 64 },
  scaNum: { fontSize: 24, fontWeight: '900', color: C.bg },
  scaLabel: { fontSize: 9, fontWeight: '900', color: C.bg, letterSpacing: 1 },
  lotName: { fontSize: 16, fontWeight: '900', color: C.text, lineHeight: 22 },
  farmName: { fontSize: 13, color: C.gold, marginTop: 4, fontWeight: '700' },
  munName: { fontSize: 11, color: C.muted, marginTop: 3 },
  bidCard: { borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1.5, borderColor: C.gold + '44' },
  bidLabel: { fontSize: 10, color: C.muted, letterSpacing: 2, marginBottom: 6 },
  bidAmount: { fontSize: 38, fontWeight: '900' },
  usd: { fontSize: 18, color: C.goldLight },
  bidMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  bidCount: { fontSize: 11, color: C.muted },
  bidBase: { fontSize: 11, color: C.muted },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  detailCell: { width: '47.5%', backgroundColor: C.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.card2 },
  detailIcon: { fontSize: 20, marginBottom: 6 },
  detailLabel: { fontSize: 9, color: C.muted, letterSpacing: 1, marginBottom: 3 },
  detailVal: { fontSize: 13, fontWeight: '800', color: C.text },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 10, fontWeight: '900', color: C.muted, letterSpacing: 2, marginBottom: 10 },
  notesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  noteChip: { backgroundColor: C.gold + '22', borderRadius: 20, borderWidth: 1, borderColor: C.gold + '44', paddingHorizontal: 12, paddingVertical: 6 },
  noteText: { fontSize: 12, color: C.goldLight, fontWeight: '600' },
  farmerCard: { flexDirection: 'row', gap: 14, backgroundColor: C.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.card2 },
  farmerAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.gold + '33', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.gold },
  farmerAvatarText: { fontSize: 16, fontWeight: '900', color: C.gold },
  farmerName: { fontSize: 15, fontWeight: '900', color: C.text },
  farmerFinca: { fontSize: 12, color: C.gold, marginTop: 3 },
  farmerLocation: { fontSize: 11, color: C.muted, marginTop: 4 },
  historyText: { fontSize: 13, color: C.text, lineHeight: 21, backgroundColor: C.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.card2, opacity: 0.9 },
  bidHistRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.card2 },
  bidHistBidder: { flex: 1, fontSize: 12, color: C.text, fontWeight: '600' },
  bidHistAmount: { fontSize: 13, color: C.gold, fontWeight: '900' },
  bidHistTime: { fontSize: 10, color: C.muted, width: 38, textAlign: 'right' },
  noBids: { fontSize: 12, color: C.muted, textAlign: 'center', paddingVertical: 16 },
  placeBidSection: { backgroundColor: C.card, borderRadius: 18, padding: 18, borderWidth: 1.5, borderColor: C.gold + '44' },
  placeBidTitle: { fontSize: 13, fontWeight: '900', color: C.gold, letterSpacing: 1, marginBottom: 4 },
  placeBidSub: { fontSize: 11, color: C.muted, marginBottom: 14 },
  successBanner: { backgroundColor: '#1B5E20', borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#4CAF50' },
  successText: { fontSize: 13, color: '#A5D6A7', fontWeight: '700', textAlign: 'center' },
  bidInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card2, borderRadius: 12, borderWidth: 1, borderColor: C.gold + '44', marginBottom: 12, overflow: 'hidden' },
  usdPrefix: { padding: 14, backgroundColor: C.gold + '22' },
  usdPrefixText: { fontSize: 18, fontWeight: '900', color: C.gold },
  bidInput: { flex: 1, padding: 14, fontSize: 20, fontWeight: '900', color: C.text, textAlign: 'center' },
  usdSuffix: { paddingHorizontal: 14, fontSize: 12, color: C.muted, fontWeight: '700' },
  bidBtn: { borderRadius: 12, padding: 16, alignItems: 'center' },
  bidBtnText: { fontSize: 13, fontWeight: '900', color: C.bg, letterSpacing: 0.5 },
  closedNotice: { alignItems: 'center', padding: 30, backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.card2 },
  closedIcon: { fontSize: 40, marginBottom: 12 },
  closedText: { fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 20 },
});
