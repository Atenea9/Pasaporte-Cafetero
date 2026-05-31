import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { CompradorNavProp } from '../../navigation/types';
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
};

export default function CompradorHomeScreen() {
  const navigation = useNavigation<CompradorNavProp>();
  const { logout } = useAuth();
  const { t } = useTranslation();

  const MENU_ITEMS = [
    { icon: '☕', tKey: 'comprador.catalog',   screen: 'Catalog'   as const, sub: t('welcomeScreen.feature_2', 'Explora los cafés disponibles'),  bg1: '#2C3A10', bg2: '#4A5E20' },
    { icon: '🏷️', tKey: 'comprador.auctions',  screen: 'Auctions'  as const, sub: t('auction.subtitle', 'Lotes especiales · Pujas en USD'),      bg1: '#7A5000', bg2: '#C8960C' },
    { icon: '📦', tKey: 'comprador.my_orders', screen: 'MyOrders'  as const, sub: t('comprador.order_confirmed', 'Gestiona tus órdenes'),          bg1: '#3D2008', bg2: '#5C3218' },
  ];

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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <View style={s.hero}>
          <View style={s.badge}>
            <Text style={s.badgeText}>✦ {t('welcomeScreen.comprador_title', 'COMPRADOR INTERNACIONAL')} ✦</Text>
          </View>
          <Text style={s.title}>{t('comprador.home', 'PORTAL COMPRADOR')}</Text>
          <Text style={s.subtitle}>{t('welcomeScreen.comprador_sub', 'Feria del Café · Chaparral, Tolima · Colombia 2026')}</Text>
        </View>

        {/* Menu cards */}
        <View style={s.cards}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.screen}
              style={s.card}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.85}
            >
              <LinearGradient colors={[item.bg1, item.bg2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.cardGrad}>
                <View style={[s.iconBox, { backgroundColor: 'rgba(0,0,0,0.2)' }]}>
                  <Text style={s.cardIcon}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardLabel}>{t(item.tKey)}</Text>
                  <Text style={s.cardSub}>{item.sub}</Text>
                </View>
                <Text style={s.cardArrow}>›</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info card */}
        <View style={s.infoCard}>
          <Text style={s.infoTitle}>🔧 {t('expositor.in_development', 'MÓDULO EN DESARROLLO')}</Text>
          <Text style={s.infoText}>
            {t('welcomeScreen.feature_1', '🏆 Catálogo de microlotes y análisis SCA')}{'\n'}
            {t('welcomeScreen.feature_2', '💰 Subasta en tiempo real con pujas en USD')}{'\n'}
            {t('welcomeScreen.feature_3', '📊 Perfiles detallados de cada finca cafetera')}{'\n'}
            {t('comprador.certification', '🌿 Certificación de origen')}
          </Text>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <View style={s.footerDivider} />
          <Text style={s.footerText}>© 2026 Gobernación del Tolima</Text>
          <Text style={s.footerSub}>Comité de Cafeteros del Tolima · Alcaldía de Chaparral</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  decoTopRight:  { position: 'absolute', top: -10, right: -20, transform: [{ rotate: '30deg' }, { scaleX: -1 }], opacity: 0.15 },
  decoBottomLeft:{ position: 'absolute', bottom: 80, left: -24, transform: [{ rotate: '-20deg' }], opacity: 0.12 },
  decoText:      { fontSize: 120 },

  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },

  logoutBtn:  { backgroundColor: 'rgba(255,255,255,0.65)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: C.border },
  logoutText: { fontSize: 12, color: '#C0392B', fontWeight: '700' },

  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  hero:      { alignItems: 'center', paddingVertical: 24 },
  badge:     { borderRadius: 30, paddingHorizontal: 16, paddingVertical: 5, borderWidth: 1, borderColor: C.gold + '60', backgroundColor: C.gold + '18', marginBottom: 12 },
  badgeText: { fontSize: 8, fontWeight: '900', color: C.gold, letterSpacing: 2.5 },
  title:     { fontSize: 26, fontWeight: '900', color: C.dark, letterSpacing: 1.5, textAlign: 'center', marginBottom: 4 },
  subtitle:  { fontSize: 12, color: C.muted, textAlign: 'center' },

  cards:    { marginBottom: 16 },
  card:     { borderRadius: 18, overflow: 'hidden', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 6 },
  cardGrad: { flexDirection: 'row', alignItems: 'center', paddingRight: 20, minHeight: 88 },
  iconBox:  { width: 88, height: 88, alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: 18, borderBottomLeftRadius: 18, marginRight: 16 },
  cardIcon: { fontSize: 32 },
  cardLabel:{ fontSize: 18, fontWeight: '900', color: '#F5EDD8', letterSpacing: 2, marginBottom: 3 },
  cardSub:  { fontSize: 11, color: 'rgba(245,237,216,0.75)' },
  cardArrow:{ fontSize: 28, color: 'rgba(245,237,216,0.5)', fontWeight: '200' },

  infoCard:  { borderRadius: 16, padding: 18, borderWidth: 1, borderColor: C.border, backgroundColor: 'rgba(255,255,255,0.6)', marginBottom: 24 },
  infoTitle: { fontSize: 11, fontWeight: '800', color: C.gold, marginBottom: 10, letterSpacing: 1 },
  infoText:  { fontSize: 12, color: C.muted, lineHeight: 22 },

  footer:        { alignItems: 'center', gap: 4 },
  footerDivider: { width: 40, height: 1, backgroundColor: C.border, marginBottom: 6, opacity: 0.5 },
  footerText:    { fontSize: 11, color: C.muted, opacity: 0.85 },
  footerSub:     { fontSize: 9, color: C.muted, opacity: 0.55, textAlign: 'center' },
});
