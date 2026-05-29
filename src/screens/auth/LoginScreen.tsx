import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  Animated, Easing, Dimensions, Modal, SafeAreaView, StatusBar, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

const C = {
  bg:         '#FBF0C8',
  bgWarm:     '#F5E4A0',
  card:       '#FFFDF4',
  dark:       '#2C1A0E',
  body:       '#5C3520',
  muted:      '#9B7B5A',
  gold:       '#C8960C',
  goldLight:  '#E8B820',
  goldDark:   '#8B6308',
  goldPale:   '#FBF0C8',
  coffee:     '#7B4A2A',
  coffeeDark: '#5C3520',
  border:     '#E0C880',
  borderMed:  '#C8A840',
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

const ROLE_CONFIGS = [
  { key: 'visitor',   credential: 'visitor@demo.com',   tKey: 'login.roles.visitor.title',   c1: '#5C3520', c2: '#7B4A2A' },
  { key: 'expositor', credential: 'expositor@demo.com', tKey: 'login.roles.expositor.title', c1: '#8B6308', c2: '#C8960C' },
  { key: 'buyer',     credential: 'buyer@demo.com',     tKey: 'login.roles.buyer.title',     c1: '#3D2000', c2: '#5C3520' },
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
                  <TouchableOpacity
                    key={l.code}
                    style={[dd.option, active && dd.optionActive]}
                    onPress={() => { onSelect(l.code); setOpen(false); }}
                    activeOpacity={0.75}
                  >
                    <Text style={[dd.optNative, active && dd.optNativeActive]}>{l.native}</Text>
                    <Text style={[dd.optLabel,  active && dd.optLabelActive]}>{l.label}</Text>
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

type RoleItem = { key: string; credential: string; tKey: string; c1: string; c2: string; label: string };
function RoleCard({ role, loading, disabled, onPress, delay }: {
  role: RoleItem; loading: boolean; disabled: boolean; onPress: () => void; delay: number;
}) {
  const scale    = useRef(new Animated.Value(1)).current;
  const entrance = useRef(new Animated.Value(1)).current;
  const entranceY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entrance,  { toValue: 1, duration: 420, delay, easing: Easing.out(Easing.exp), useNativeDriver: false }),
      Animated.timing(entranceY, { toValue: 0, duration: 420, delay, easing: Easing.out(Easing.exp), useNativeDriver: false }),
    ]).start();
  }, []);

  const pressIn  = () => Animated.spring(scale, { toValue: 0.975, useNativeDriver: false, friction: 10 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1,     useNativeDriver: false, friction: 7  }).start();

  return (
    <Animated.View style={{ opacity: entrance, transform: [{ scale }, { translateY: entranceY }] }}>
      <View style={[s.card, { borderColor: role.c2 + '60' }]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={pressIn}
          onPressOut={pressOut}
          activeOpacity={1}
          disabled={disabled}
        >
          <LinearGradient colors={[role.c1, role.c2]} style={s.cardGrad}>
            {/* Left gold accent bar */}
            <View style={[s.cardAccent, { backgroundColor: C.goldLight }]} />

            <Text style={s.cardTitle}>{role.label.toUpperCase()}</Text>

            <View style={s.cardRight}>
              {loading
                ? <ActivityIndicator color="rgba(255,255,255,0.85)" size="small" />
                : <Text style={s.cardArrow}>›</Text>
              }
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export const LoginScreen = () => {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const [isLoading,   setIsLoading]   = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [showAdmin,   setShowAdmin]   = useState(false);

  const fadeAnim    = useRef(new Animated.Value(1)).current;
  const heroOpacity = useRef(new Animated.Value(1)).current;
  const heroY       = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,    { toValue: 1, duration: 500, useNativeDriver: false }),
      Animated.timing(heroOpacity, { toValue: 1, duration: 600, easing: Easing.out(Easing.exp), useNativeDriver: false }),
      Animated.timing(heroY,       { toValue: 0, duration: 600, easing: Easing.out(Easing.exp), useNativeDriver: false }),
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
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Background warm honey gradient */}
      <LinearGradient
        colors={['#FBF0C8', '#F5E4A0', '#EDD480']}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative orbs */}
      <View style={s.orbTopRight} pointerEvents="none" />
      <View style={s.orbBottomLeft} pointerEvents="none" />

      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity onLongPress={() => setShowAdmin(v => !v)} activeOpacity={1} style={s.topBarLeft}>
          <View style={s.amberDot} />
        </TouchableOpacity>
        <LangDropdown lang={i18n.language} onSelect={(lng: string) => { const { changeAndSaveLanguage } = require('../../i18n'); changeAndSaveLanguage(lng); }} />
      </View>

      <Animated.ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim }}
      >
        {/* ── HERO ── */}
        <Animated.View style={[s.hero, { opacity: heroOpacity, transform: [{ translateY: heroY }] }]}>
          {/* Edition badge */}
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeText}>✦ EDICIÓN 2026 ✦</Text>
          </View>

          {/* Logo circle */}
          <LinearGradient colors={['#5C3520', '#7B4A2A', '#5C3520']} style={s.heroLogoWrap}>
            <Text style={s.heroLogoEmoji}>☕</Text>
          </LinearGradient>
          <View style={s.heroLogoRing} />

          <Text style={s.heroTitle}>PASAPORTE</Text>
          <Text style={s.heroAmber}>CAFETERO</Text>

          {/* Ornamental divider */}
          <View style={s.heroDivider}>
            <View style={s.heroDivLine} />
            <Text style={s.heroDivStar}>✦</Text>
            <View style={s.heroDivLine} />
          </View>

          <Text style={s.heroFair}>{t('login.fair_name', 'Feria Internacional del Café')}</Text>
          <Text style={s.heroCity}>CHAPARRAL · TOLIMA</Text>
          <Text style={s.heroYear}>14 · 15 · 16 DE AGOSTO 2026</Text>
        </Animated.View>

        {/* ── SECTION DIVIDER ── */}
        <View style={s.sectionRow}>
          <View style={s.sectionLine} />
          <Text style={s.sectionText}>{t('login.select_profile', 'SELECCIONA TU PERFIL')}</Text>
          <View style={s.sectionLine} />
        </View>

        {/* ── ROLE CARDS ── */}
        <View style={s.cards}>
          {ROLE_CONFIGS.map((r, i) => {
            const role: RoleItem = { ...r, label: t(r.tKey) };
            return (
              <RoleCard
                key={r.key}
                role={role}
                loading={loadingRole === r.key}
                disabled={isLoading}
                delay={i * 80}
                onPress={() => handleLogin(r.credential, r.key)}
              />
            );
          })}
        </View>

        {/* ── ADMIN TRIGGER ── */}
        {showAdmin ? (
          <View style={s.adminRow}>
            {['admin', 'ceo'].map(role => (
              <TouchableOpacity
                key={role}
                style={s.adminBtn}
                onPress={() => handleLogin(`${role}@demo.com`, role)}
                disabled={isLoading}
                activeOpacity={0.75}
              >
                <View style={s.adminBtnInner}>
                  {loadingRole === role
                    ? <ActivityIndicator color={C.dark} size="small" />
                    : <Text style={s.adminBtnText}>{role.toUpperCase()}</Text>
                  }
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <TouchableOpacity style={s.adminTrigger} onPress={() => setShowAdmin(true)} activeOpacity={0.6}>
            <Text style={s.adminTriggerText}>{t('login.admin_access', 'ACCESO ADMINISTRATIVO')}</Text>
          </TouchableOpacity>
        )}

        {/* ── FOOTER ── */}
        <View style={s.footer}>
          <View style={s.footerDivider} />
          <Text style={s.footerText}>© 2026 Gobernación del Tolima</Text>
          <Text style={s.footerSub}>Comité de Cafeteros del Tolima · Alcaldía de Chaparral</Text>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;

// ── Language dropdown styles ─────────────────────────────────────────────────
const dd = StyleSheet.create({
  trigger:         { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: C.border },
  triggerText:     { color: C.dark, fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  chevron:         { color: C.gold, fontSize: 10 },
  backdrop:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 80, paddingRight: 20 },
  menu:            { width: 200, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  menuInner:       { backgroundColor: '#FFFDF4', paddingVertical: 8 },
  menuTitle:       { fontSize: 9, fontWeight: '900', color: C.muted, letterSpacing: 2.5, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  option:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 11, gap: 10 },
  optionActive:    { backgroundColor: C.goldPale },
  optNative:       { fontSize: 13, fontWeight: '800', color: C.muted, width: 32 },
  optNativeActive: { color: C.gold },
  optLabel:        { flex: 1, fontSize: 13, color: C.muted, fontWeight: '500' },
  optLabelActive:  { color: C.dark },
  check:           { color: C.gold, fontSize: 14, fontWeight: '900' },
});

// ── Main styles ───────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: C.bg },

  orbTopRight: {
    position: 'absolute', top: -80, right: -80,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: C.goldLight, opacity: 0.12,
  },
  orbBottomLeft: {
    position: 'absolute', bottom: -60, left: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: C.coffee, opacity: 0.08,
  },

  topBar:     { position: 'absolute', top: Platform.OS === 'ios' ? 56 : 36, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 },
  topBarLeft: { padding: 8 },
  amberDot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: C.gold, opacity: 0.5 },

  scroll:     { flexGrow: 1, paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 120 : 100, paddingBottom: 48 },

  // Hero
  hero:           { alignItems: 'center', marginBottom: 36 },
  heroBadge:      { borderRadius: 30, paddingHorizontal: 20, paddingVertical: 7, borderWidth: 1, borderColor: C.borderMed, backgroundColor: 'rgba(255,255,255,0.5)', marginBottom: 24 },
  heroBadgeText:  { color: C.goldDark, fontSize: 10, fontWeight: '900', letterSpacing: 4 },

  heroLogoWrap:   { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 20, shadowColor: C.coffeeDark, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 8 },
  heroLogoEmoji:  { fontSize: 46 },
  heroLogoRing:   { position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, width: 104, height: 104, borderRadius: 52, borderWidth: 1.5, borderColor: C.gold + '60' },

  heroTitle:      { fontSize: 44, fontWeight: '900', color: C.dark, letterSpacing: 0, lineHeight: 46, textAlign: 'center' },
  heroAmber:      { fontSize: 44, fontWeight: '900', color: C.gold, letterSpacing: 0, lineHeight: 50, textAlign: 'center', marginBottom: 22 },

  heroDivider:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18, width: '60%' },
  heroDivLine:    { flex: 1, height: 1, backgroundColor: C.borderMed },
  heroDivStar:    { color: C.gold, fontSize: 11 },

  heroFair:       { fontSize: 12, fontWeight: '700', color: C.body, letterSpacing: 0.5, textAlign: 'center', marginBottom: 4 },
  heroCity:       { fontSize: 21, fontWeight: '900', color: C.dark, letterSpacing: 3, textAlign: 'center', marginBottom: 4 },
  heroYear:       { fontSize: 11, color: C.muted, letterSpacing: 2, textAlign: 'center' },

  // Section divider
  sectionRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  sectionLine:    { flex: 1, height: 1, backgroundColor: C.border },
  sectionText:    { fontSize: 9, fontWeight: '900', color: C.muted, letterSpacing: 3 },

  // Role cards
  cards:          { gap: 14, marginBottom: 28 },
  card:           {
    borderRadius: 16, overflow: 'hidden', borderWidth: 1,
    shadowColor: C.coffeeDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 10, elevation: 5,
  },
  cardGrad:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 22, paddingHorizontal: 22, gap: 0 },
  cardAccent:     { width: 3, height: 28, borderRadius: 2, marginRight: 18, opacity: 0.8 },
  cardTitle:      { flex: 1, fontSize: 22, fontWeight: '900', color: '#FFFFFF', letterSpacing: 3 },
  cardRight:      { width: 36, alignItems: 'center' },
  cardArrow:      { fontSize: 32, color: 'rgba(255,255,255,0.6)', fontWeight: '200' },

  // Admin
  adminRow:       { flexDirection: 'row', gap: 12, justifyContent: 'center', marginBottom: 28 },
  adminBtn:       { flex: 1, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  adminBtnInner:  { paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.6)' },
  adminBtnText:   { color: C.dark, fontSize: 11, fontWeight: '900', letterSpacing: 2.5 },
  adminTrigger:   { alignSelf: 'center', marginBottom: 28, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: C.border + '80', backgroundColor: 'rgba(255,255,255,0.3)' },
  adminTriggerText:{ color: C.muted, fontSize: 10, fontWeight: '700', letterSpacing: 2 },

  // Footer
  footer:         { alignItems: 'center', gap: 5, marginTop: 4 },
  footerDivider:  { width: 40, height: 1, backgroundColor: C.border, marginBottom: 8 },
  footerText:     { fontSize: 11, color: C.muted },
  footerSub:      { fontSize: 9, color: C.muted, opacity: 0.6, textAlign: 'center' },
});
