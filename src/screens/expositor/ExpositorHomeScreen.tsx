import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { ExpositorNavProp } from '../../navigation/types';
import { useAuth } from '../../contexts/AuthContext';
import LangSelector from '../../components/LangSelector';

const C = {
  bg:     '#F5E8C0',
  card:   '#FFFDF4',
  dark:   '#2C1A0E',
  body:   '#4A2E12',
  muted:  '#8B6640',
  gold:   '#C8960C',
  border: '#D4B060',
  amber:  '#7A5000',
};

export default function ExpositorHomeScreen() {
  const navigation = useNavigation<ExpositorNavProp>();
  const { logout } = useAuth();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <LinearGradient
        colors={['#F5E8C0', '#E8D5A3', '#D4BC7A']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative leaves */}
      <View style={s.decoTopRight} pointerEvents="none">
        <Text style={s.decoText}>🌿</Text>
      </View>
      <View style={s.decoBottomLeft} pointerEvents="none">
        <Text style={s.decoText}>🌿</Text>
      </View>

      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={logout} style={s.logoutBtn} activeOpacity={0.75}>
          <Text style={s.logoutText}>{t('common.logout', 'Salir')}</Text>
        </TouchableOpacity>
        <LangSelector light />
      </View>

      {/* Header */}
      <View style={s.hero}>
        <View style={s.badgeRow}>
          <View style={s.badge}>
            <Text style={s.badgeText}>✦ EXPOSITOR ✦</Text>
          </View>
        </View>
        <Text style={s.title}>{t('expositor.panel_title', '☕ PANEL EXPOSITOR')}</Text>
        <Text style={s.subtitle}>{t('expositor.manage_stand_sub', 'Gestiona tu stand')}</Text>
      </View>

      {/* Stats */}
      <View style={s.statsStrip}>
        {[
          { val: '0', lbl: t('expositor.sales_today_label', 'VENTAS HOY') },
          { val: '0', lbl: t('expositor.customers_label', 'CLIENTES') },
          { val: '0', lbl: t('expositor.points_given_label', 'PUNTOS DADOS') },
        ].map((item, i, arr) => (
          <React.Fragment key={i}>
            {i > 0 && <View style={s.statDiv} />}
            <View style={s.statItem}>
              <Text style={s.statNum}>{item.val}</Text>
              <Text style={s.statLbl}>{item.lbl}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>

      {/* Scan CTA */}
      <TouchableOpacity
        style={s.scanCard}
        onPress={() => navigation.navigate('Scanner')}
        activeOpacity={0.85}
      >
        <LinearGradient colors={['#7A5000', '#C8960C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.scanGrad}>
          <View style={s.scanIconBox}>
            <Text style={s.scanIcon}>📷</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.scanTitle}>{t('expositor.scan_customer_btn', 'ESCANEAR CLIENTE')}</Text>
            <Text style={s.scanSub}>{t('expositor.scan_customer_sub_text', 'Registra compras y otorga puntos')}</Text>
          </View>
          <Text style={s.scanArrow}>›</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Info card */}
      <View style={s.infoCard}>
        <Text style={s.infoTitle}>{t('expositor.in_development', '🔧 MÓDULO EN DESARROLLO')}</Text>
        <Text style={s.infoText}>
          {t('expositor.my_stand', 'Mi Stand')} · {t('expositor.my_products', 'Mis Productos')}
          {'\n'}{t('expositor.stand_stats', 'Estadísticas del Stand')} · {t('expositor.scan_to_register', 'Escanea el QR del cliente')}
        </Text>
      </View>

      {/* Footer */}
      <View style={s.footer}>
        <View style={s.footerDivider} />
        <Text style={s.footerText}>© 2026 Gobernación del Tolima</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  decoTopRight:  { position: 'absolute', top: -10, right: -20, transform: [{ rotate: '30deg' }, { scaleX: -1 }], opacity: 0.15 },
  decoBottomLeft:{ position: 'absolute', bottom: 60, left: -24, transform: [{ rotate: '-20deg' }], opacity: 0.12 },
  decoText:      { fontSize: 120 },

  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },

  logoutBtn:  { backgroundColor: 'rgba(255,255,255,0.65)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: C.border },
  logoutText: { fontSize: 12, color: '#C0392B', fontWeight: '700' },

  hero:      { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20 },
  badgeRow:  { marginBottom: 10 },
  badge:     { borderRadius: 30, paddingHorizontal: 16, paddingVertical: 5, borderWidth: 1, borderColor: C.gold + '60', backgroundColor: C.gold + '18' },
  badgeText: { fontSize: 9, fontWeight: '900', color: C.gold, letterSpacing: 3 },
  title:     { fontSize: 26, fontWeight: '900', color: C.dark, letterSpacing: 1.5, textAlign: 'center', marginBottom: 4 },
  subtitle:  { fontSize: 13, color: C.muted, textAlign: 'center' },

  statsStrip: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 14, marginHorizontal: 20, padding: 14, marginBottom: 18, borderWidth: 1, borderColor: C.border },
  statItem:   { flex: 1, alignItems: 'center' },
  statNum:    { fontSize: 24, fontWeight: '900', color: C.gold },
  statLbl:    { fontSize: 8, color: C.muted, marginTop: 2, textTransform: 'uppercase', textAlign: 'center', letterSpacing: 0.5 },
  statDiv:    { width: 1, backgroundColor: C.border },

  scanCard:  { marginHorizontal: 20, marginBottom: 16, borderRadius: 18, overflow: 'hidden', shadowColor: C.dark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 10, elevation: 6 },
  scanGrad:  { flexDirection: 'row', alignItems: 'center', paddingRight: 20, paddingLeft: 0, minHeight: 90 },
  scanIconBox:{ width: 90, height: 90, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.15)', borderTopLeftRadius: 18, borderBottomLeftRadius: 18, marginRight: 16 },
  scanIcon:  { fontSize: 36 },
  scanTitle: { fontSize: 17, fontWeight: '900', color: '#F5EDD8', letterSpacing: 2, marginBottom: 3 },
  scanSub:   { fontSize: 11, color: 'rgba(245,237,216,0.8)' },
  scanArrow: { fontSize: 28, color: 'rgba(245,237,216,0.6)', fontWeight: '200' },

  infoCard:  { marginHorizontal: 20, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: C.border, backgroundColor: 'rgba(255,255,255,0.6)' },
  infoTitle: { fontSize: 12, fontWeight: '800', color: C.gold, marginBottom: 8, letterSpacing: 1 },
  infoText:  { fontSize: 12, color: C.muted, lineHeight: 20 },

  footer:        { alignItems: 'center', marginTop: 'auto', paddingBottom: 24, paddingTop: 16 },
  footerDivider: { width: 40, height: 1, backgroundColor: C.border, marginBottom: 8, opacity: 0.5 },
  footerText:    { fontSize: 10, color: C.muted, opacity: 0.7 },
});
