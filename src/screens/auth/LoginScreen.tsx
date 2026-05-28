import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  Animated, Easing, Dimensions, Modal, Image, SafeAreaView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const T = {
  bg:        '#FAF7F0',
  card:      '#FFFFFF',
  dark:      '#2C1810',
  body:      '#4A3728',
  muted:     '#8A7060',
  gold:      '#B8860B',
  goldDark:  '#8B6308',
  goldLight: '#D4A520',
  goldPale:  '#F5E6B0',
  green:     '#2D5A1E',
  greenLight:'#4A8030',
  greenPale: '#E8F2E4',
  border:    '#E8D5B0',
  borderMed: '#D4B896',
};

const LANGUAGES = [
  { code: 'es', label: 'Español',   native: 'ES' },
  { code: 'en', label: 'English',   native: 'EN' },
  { code: 'fr', label: 'Français',  native: 'FR' },
  { code: 'de', label: 'Deutsch',   native: 'DE' },
  { code: 'zh', label: '中文',       native: '中文' },
  { code: 'pt', label: 'Português', native: 'PT' },
  { code: 'it', label: 'Italiano',  native: 'IT' },
];

const ROLES = [
  { num: '01', key: 'visitor',   credential: 'visitor@demo.com',   color: T.green,     colorLight: T.greenLight },
  { num: '02', key: 'expositor', credential: 'expositor@demo.com', color: T.gold,      colorLight: T.goldLight  },
  { num: '03', key: 'buyer',     credential: 'buyer@demo.com',     color: '#1565C0',   colorLight: '#1976D2'    },
];

function LangDropdown({ lang, onSelect }: { lang: string; onSelect: (l: string) => void }) {
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0];
  return (
    <View>
      <TouchableOpacity style={dd.trigger} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={dd.triggerText}>{current.native}</Text>
        <Text style={dd.chevron}>▾</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={dd.backdrop} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={dd.menu}>
            <View style={dd.menuInner}>
              <Text style={dd.menuTitle}>IDIOMA / LANGUAGE</Text>
              {LANGUAGES.map(l => {
                const active = l.code === lang;
                return (
                  <TouchableOpacity key={l.code} style={[dd.option, active && dd.optionActive]} onPress={() => { onSelect(l.code); setOpen(false); }} activeOpacity={0.75}>
                    <Text style={[dd.optNative, active && dd.optNativeActive]}>{l.native}</Text>
                    <Text style={[dd.optLabel, active && dd.optLabelActive]}>{l.label}</Text>
                    {active && <Text style={dd.check}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function RoleCard({ role, loading, disabled, label, onPress }: {
  role: typeof ROLES[0]; loading: boolean; disabled: boolean; label: string; onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (_) {}
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, friction: 8 }).start();
  };
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();

  return (
    <Animated.View style={[s.card, { transform: [{ scale }], borderColor: role.color + '40' }]}>
      <TouchableOpacity onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1} disabled={disabled} style={{ flex: 1 }}>
        <LinearGradient colors={[role.color, role.colorLight]} style={s.cardGrad}>
          <View style={s.cardIconBox}>
            <Text style={s.cardIcon}>{role.key === 'visitor' ? '🌿' : role.key === 'expositor' ? '🏪' : '🌍'}</Text>
          </View>
          <View style={s.cardBody}>
            <Text style={s.cardTitle}>{label}</Text>
            <Text style={s.cardNum}>{role.num}</Text>
          </View>
          {loading
            ? <ActivityIndicator color="rgba(255,255,255,0.8)" size="small" />
            : <Text style={s.cardArrow}>›</Text>
          }
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export const LoginScreen = () => {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 650, easing: Easing.out(Easing.exp), useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async (credential: string, roleKey: string) => {
    setIsLoading(true);
    setLoadingRole(roleKey);
    try {
      const type = credential.includes('@') ? 'email' : 'phone';
      await login(credential, type);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setLoadingRole(null);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity onLongPress={() => setShowAdmin(v => !v)} activeOpacity={1} style={s.topBarLeft}>
          <View style={s.coffeeDot} />
        </TouchableOpacity>
        <LangDropdown lang={i18n.language} onSelect={lng => i18n.changeLanguage(lng)} />
      </View>

      <Animated.ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeText}>✦ EDICIÓN 2026 ✦</Text>
          </View>

          <LinearGradient colors={[T.green, T.greenLight, T.green]} style={s.heroLogoWrap}>
            <Text style={s.heroLogoEmoji}>☕</Text>
          </LinearGradient>

          <Text style={s.heroTitle}>PASAPORTE</Text>
          <Text style={s.heroGold}>CAFETERO</Text>

          <View style={s.heroDivider}>
            <View style={s.heroDivLine} />
            <Image source={require('../../../assets/coffee-bag.png')} style={s.heroDivIcon} />
            <View style={s.heroDivLine} />
          </View>

          <Text style={s.heroFair}>{t('login.fair_name', 'Feria Internacional del Café')}</Text>
          <Text style={s.heroCity}>CHAPARRAL · TOLIMA</Text>
          <Text style={s.heroYear}>14 · 15 · 16 DE AGOSTO 2026</Text>
        </View>

        {/* Role Cards */}
        <View style={s.sectionLabel_}>
          <View style={s.sectionLine_} />
          <Text style={s.sectionText_}>SELECCIONA TU PERFIL</Text>
          <View style={s.sectionLine_} />
        </View>

        <View style={s.cards}>
          {ROLES.map(r => (
            <RoleCard
              key={r.key}
              role={r}
              loading={loadingRole === r.key}
              disabled={isLoading}
              label={t(`login.roles.${r.key}.title`, r.key === 'visitor' ? 'Visitante' : r.key === 'expositor' ? 'Expositor' : 'Comprador')}
              onPress={() => handleLogin(r.credential, r.key)}
            />
          ))}
        </View>

        {/* Admin access */}
        {showAdmin ? (
          <View style={s.adminRow}>
            {['admin', 'ceo'].map(role => (
              <TouchableOpacity key={role} style={s.adminBtn} onPress={() => handleLogin(`${role}@demo.com`, role)} disabled={isLoading} activeOpacity={0.75}>
                <View style={s.adminBtnInner}>
                  {loadingRole === role
                    ? <ActivityIndicator color={T.dark} size="small" />
                    : <Text style={s.adminBtnText}>{role.toUpperCase()}</Text>
                  }
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <TouchableOpacity style={s.adminTrigger} onPress={() => setShowAdmin(true)} activeOpacity={0.6}>
            <Text style={s.adminTriggerText}>ACCESO ADMINISTRATIVO</Text>
          </TouchableOpacity>
        )}

        <View style={s.footer}>
          <Text style={s.footerText}>© 2026 Gobernación del Tolima</Text>
          <Text style={s.footerSub}>Comité de Cafeteros del Tolima · Alcaldía de Chaparral</Text>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const dd = StyleSheet.create({
  trigger:        { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: T.card, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: T.borderMed },
  triggerText:    { color: T.dark, fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  chevron:        { color: T.gold, fontSize: 10 },
  backdrop:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 80, paddingRight: 20 },
  menu:           { width: 200, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: T.border, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 12 },
  menuInner:      { backgroundColor: T.card, paddingVertical: 8 },
  menuTitle:      { fontSize: 9, fontWeight: '900', color: T.muted, letterSpacing: 2.5, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: T.border },
  option:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 11, gap: 10 },
  optionActive:   { backgroundColor: T.greenPale },
  optNative:      { fontSize: 13, fontWeight: '800', color: T.muted, width: 32 },
  optNativeActive:{ color: T.green },
  optLabel:       { flex: 1, fontSize: 13, color: T.muted, fontWeight: '500' },
  optLabelActive: { color: T.dark },
  check:          { color: T.green, fontSize: 14, fontWeight: '900' },
});

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: T.bg },
  topBar:         { position: 'absolute', top: 52, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 },
  topBarLeft:     { padding: 8 },
  coffeeDot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: T.gold, opacity: 0.5 },
  scroll:         { flexGrow: 1, paddingHorizontal: 22, paddingTop: 110, paddingBottom: 40 },

  hero:           { alignItems: 'center', marginBottom: 32 },
  heroBadge:      { backgroundColor: T.goldPale, borderRadius: 30, paddingHorizontal: 18, paddingVertical: 6, borderWidth: 1, borderColor: T.border, marginBottom: 20 },
  heroBadgeText:  { color: T.gold, fontSize: 10, fontWeight: '900', letterSpacing: 3.5 },
  heroLogoWrap:   { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', marginBottom: 18, shadowColor: T.green, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  heroLogoEmoji:  { fontSize: 44 },
  heroTitle:      { fontSize: 40, fontWeight: '900', color: T.dark, letterSpacing: -1, lineHeight: 42, textAlign: 'center' },
  heroGold:       { fontSize: 40, fontWeight: '900', color: T.gold, letterSpacing: -1, lineHeight: 44, textAlign: 'center', marginBottom: 18 },
  heroDivider:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, width: '70%' },
  heroDivLine:    { flex: 1, height: 1, backgroundColor: T.borderMed },
  heroDivIcon:    { width: 36, height: 36, resizeMode: 'contain' },
  heroFair:       { fontSize: 12, fontWeight: '700', color: T.body, letterSpacing: 0.5, textAlign: 'center', marginBottom: 4 },
  heroCity:       { fontSize: 20, fontWeight: '900', color: T.dark, letterSpacing: 3, textAlign: 'center', marginBottom: 4, textTransform: 'uppercase' },
  heroYear:       { fontSize: 11, color: T.muted, letterSpacing: 2, textAlign: 'center', marginBottom: 4 },

  sectionLabel_:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionLine_:   { flex: 1, height: 1, backgroundColor: T.border },
  sectionText_:   { fontSize: 9, fontWeight: '900', color: T.muted, letterSpacing: 2 },

  cards:          { gap: 12, marginBottom: 24 },
  card:           { borderRadius: 18, overflow: 'hidden', borderWidth: 1, shadowColor: T.dark, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 4 },
  cardGrad:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, paddingHorizontal: 20, gap: 14 },
  cardIconBox:    { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  cardIcon:       { fontSize: 26 },
  cardBody:       { flex: 1 },
  cardTitle:      { fontSize: 20, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  cardNum:        { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2, letterSpacing: 2 },
  cardArrow:      { fontSize: 30, color: 'rgba(255,255,255,0.7)', fontWeight: '300' },

  adminRow:       { flexDirection: 'row', gap: 12, justifyContent: 'center', marginBottom: 24 },
  adminBtn:       { flex: 1, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: T.border },
  adminBtnInner:  { paddingVertical: 13, alignItems: 'center', backgroundColor: T.card },
  adminBtnText:   { color: T.dark, fontSize: 11, fontWeight: '900', letterSpacing: 2.5 },

  adminTrigger:   { alignSelf: 'center', marginBottom: 24, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: T.border },
  adminTriggerText: { color: T.muted, fontSize: 10, fontWeight: '700', letterSpacing: 2 },

  footer:         { alignItems: 'center', marginTop: 8, gap: 4 },
  footerText:     { fontSize: 11, color: T.muted },
  footerSub:      { fontSize: 9, color: T.muted, opacity: 0.6, textAlign: 'center' },
});
