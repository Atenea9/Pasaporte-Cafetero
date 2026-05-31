import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  Animated, Dimensions, Modal, SafeAreaView,
  StatusBar, Platform, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { changeAndSaveLanguage } from '../../i18n';

const { width } = Dimensions.get('window');
const CARD_W = Math.min(width - 40, 420);

// ── Colour palette (matches reference design) ──────────────────────────────────
const C = {
  bg:          '#E8D5A3',
  bgLight:     '#F2E4BA',
  bgDark:      '#C9B078',
  dark:        '#2C1A0E',
  body:        '#4A2E12',
  muted:       '#8B6640',
  gold:        '#C8960C',
  goldLight:   '#E8B820',
  goldDark:    '#8B6308',
  brown1:      '#3D2008',
  brown2:      '#5C3218',
  amber1:      '#7A5000',
  amber2:      '#C8960C',
  border:      '#B89040',
  borderLight: '#D4B060',
  white:       '#FFFFFF',
  cardText:    '#F5EDD8',
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

const LOGO_IMG = require('../../../assets/logo-feria.png');

const ANIMAL_IMAGES = {
  visitor:   require('../../../assets/animal-visitante.png'),
  expositor: require('../../../assets/animal-expositor.png'),
  buyer:     require('../../../assets/animal-comprador.png'),
};

const ROLE_CONFIGS = [
  {
    key:        'visitor',
    credential: 'visitor@demo.com',
    tKey:       'login.roles.visitor.title',
    cardBg1:    '#3D2008',
    cardBg2:    '#5C3218',
    animalBg:   '#4A2810',
  },
  {
    key:        'expositor',
    credential: 'expositor@demo.com',
    tKey:       'login.roles.expositor.title',
    cardBg1:    '#7A5000',
    cardBg2:    '#C8960C',
    animalBg:   '#6B4400',
  },
  {
    key:        'buyer',
    credential: 'buyer@demo.com',
    tKey:       'login.roles.buyer.title',
    cardBg1:    '#2C3A10',
    cardBg2:    '#4A5E20',
    animalBg:   '#304018',
  },
];

// ── Language selector ──────────────────────────────────────────────────────────
function LangDropdown() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find(l => l.code === i18n.language) ?? LANGUAGES[0];
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
                const active = l.code === i18n.language;
                return (
                  <TouchableOpacity
                    key={l.code}
                    style={[dd.option, active && dd.optionActive]}
                    onPress={() => { changeAndSaveLanguage(l.code); setOpen(false); }}
                    activeOpacity={0.75}
                  >
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

// ── Role card ──────────────────────────────────────────────────────────────────
type RoleItem = {
  key: string; credential: string; tKey: string;
  cardBg1: string; cardBg2: string;
  animalBg: string;
  label: string;
};

function RoleCard({ role, loading, disabled, onPress, delay }: {
  role: RoleItem; loading: boolean; disabled: boolean; onPress: () => void; delay: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn  = () => Animated.spring(scale, { toValue: 0.972, useNativeDriver: false, friction: 8 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1,     useNativeDriver: false, friction: 6 }).start();

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
        marginBottom: 14,
        width: CARD_W,
        alignSelf: 'center',
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.28,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
        disabled={disabled}
      >
        <LinearGradient
          colors={[role.cardBg1, role.cardBg2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.cardGrad}
        >
          {/* Animal thumbnail */}
          <View style={[s.animalBox, { backgroundColor: role.animalBg }]}>
            <Image
              source={ANIMAL_IMAGES[role.key as keyof typeof ANIMAL_IMAGES]}
              style={s.animalImage}
              resizeMode="cover"
            />
          </View>

          {/* Role label */}
          <Text style={s.cardTitle}>{role.label.toUpperCase()}</Text>

          {/* Arrow */}
          <View style={s.cardArrowBox}>
            {loading
              ? <ActivityIndicator color="rgba(255,255,255,0.85)" size="small" />
              : <Text style={s.cardArrow}>›</Text>
            }
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────
export const LoginScreen = () => {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const [isLoading,   setIsLoading]   = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [showAdmin,   setShowAdmin]   = useState(false);

  const fadeIn = useRef(new Animated.Value(1)).current;
  const heroY  = useRef(new Animated.Value(0)).current;

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

      {/* Sandy background gradient */}
      <LinearGradient
        colors={['#F5E8C0', '#E8D5A3', '#D4BC7A', '#C9B070']}
        locations={[0, 0.35, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative coffee branch — top right */}
      <View style={s.decoTopRight} pointerEvents="none">
        <Text style={s.decoText}>🌿</Text>
      </View>
      {/* Decorative branch — bottom left */}
      <View style={s.decoBottomLeft} pointerEvents="none">
        <Text style={s.decoText}>🌿</Text>
      </View>

      {/* Language selector — top right */}
      <View style={s.topBar}>
        <TouchableOpacity
          onLongPress={() => setShowAdmin(v => !v)}
          activeOpacity={1}
          style={{ padding: 8 }}
        >
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.gold, opacity: 0.4 }} />
        </TouchableOpacity>
        <LangDropdown />
      </View>

      {/* Content */}
      <Animated.ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeIn }}
      >
        {/* ── HERO ── */}
        <Animated.View style={[s.hero, { transform: [{ translateY: heroY }] }]}>

          {/* Official Feria logo */}
          <View style={s.logoWrap}>
            <Image source={LOGO_IMG} style={s.logoImg} resizeMode="contain" />
          </View>

          <Text style={s.heroTitle}>FERIA INTERNACIONAL{'\n'}DE CAFÉ</Text>
          <Text style={s.heroSub}>Tolima Corazón Cafetero de Colombia</Text>
          <Text style={s.heroYear}>Chaparral - 2026</Text>

          <Text style={s.heroPasaporte}>PASAPORTE CAFETERO</Text>
        </Animated.View>

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
                delay={i * 90}
                onPress={() => handleLogin(r.credential, r.key)}
              />
            );
          })}
        </View>

        {/* ── ADMIN ACCESS ── */}
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
          <TouchableOpacity
            style={s.adminTrigger}
            onPress={() => setShowAdmin(true)}
            activeOpacity={0.6}
          >
            <Text style={s.adminTriggerText}>
              {t('login.admin_access', 'ACCESO ADMINISTRATIVO')}
            </Text>
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

// ── Language dropdown styles ───────────────────────────────────────────────────
const dd = StyleSheet.create({
  trigger:         { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.65)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: C.border },
  triggerText:     { color: C.dark, fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  chevron:         { color: C.gold, fontSize: 10 },
  backdrop:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 80, paddingRight: 20 },
  menu:            { width: 200, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  menuInner:       { backgroundColor: '#FFFDF4', paddingVertical: 8 },
  menuTitle:       { fontSize: 9, fontWeight: '900', color: C.muted, letterSpacing: 2.5, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  option:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, gap: 10 },
  optionActive:    { backgroundColor: '#FBF0C8' },
  optNative:       { fontSize: 13, fontWeight: '800', color: C.muted, width: 36 },
  optNativeActive: { color: C.gold },
  optLabel:        { flex: 1, fontSize: 13, color: C.muted, fontWeight: '500' },
  optLabelActive:  { color: C.dark },
  check:           { color: C.gold, fontSize: 14, fontWeight: '900' },
});

// ── Main styles ────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  decoTopRight: {
    position: 'absolute', top: -10, right: -20,
    transform: [{ rotate: '30deg' }, { scaleX: -1 }],
    opacity: 0.18,
  },
  decoBottomLeft: {
    position: 'absolute', bottom: 60, left: -24,
    transform: [{ rotate: '-20deg' }],
    opacity: 0.14,
  },
  decoText: { fontSize: 120 },

  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 40,
    left: 20, right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 110 : 90,
    paddingBottom: 48,
    alignItems: 'center',
  },

  // ── Hero ────────────────────────────────────────────────────────────────────
  hero: { alignItems: 'center', marginBottom: 32, width: '100%' },

  // Official Feria logo
  logoWrap: {
    width: 100, height: 106,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  logoImg: {
    width: 100,
    height: 106,
  },

  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: C.dark,
    letterSpacing: 0.5,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 14,
    fontWeight: '400',
    color: C.body,
    textAlign: 'center',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  heroYear: {
    fontSize: 13,
    fontWeight: '500',
    color: C.body,
    textAlign: 'center',
    marginBottom: 10,
    opacity: 0.8,
  },
  heroPasaporte: {
    fontSize: 22,
    fontWeight: '900',
    color: C.gold,
    letterSpacing: 1.5,
    textAlign: 'center',
  },

  // ── Role cards ──────────────────────────────────────────────────────────────
  cards: { width: '100%', alignItems: 'center', marginBottom: 8 },

  cardGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 0,
    paddingRight: 20,
    paddingLeft: 0,
    minHeight: 92,
  },
  animalBox: {
    width: 100,
    height: 92,
    overflow: 'hidden',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    marginRight: 18,
  },
  animalImage: {
    width: 100,
    height: 92,
  },
  cardTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '900',
    color: '#F5EDD8',
    letterSpacing: 2.5,
  },
  cardArrowBox: { width: 32, alignItems: 'center' },
  cardArrow: { fontSize: 30, color: 'rgba(255,255,255,0.55)', fontWeight: '200' },

  // ── Admin ────────────────────────────────────────────────────────────────────
  adminRow:         { flexDirection: 'row', gap: 12, justifyContent: 'center', marginBottom: 24, width: CARD_W, alignSelf: 'center' },
  adminBtn:         { flex: 1, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  adminBtnInner:    { paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)' },
  adminBtnText:     { color: C.dark, fontSize: 11, fontWeight: '900', letterSpacing: 2.5 },
  adminTrigger:     { alignSelf: 'center', marginBottom: 24, paddingHorizontal: 22, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(180,130,50,0.45)', backgroundColor: 'rgba(255,255,255,0.2)' },
  adminTriggerText: { color: C.muted, fontSize: 10, fontWeight: '700', letterSpacing: 2 },

  // ── Footer ───────────────────────────────────────────────────────────────────
  footer:        { alignItems: 'center', gap: 5, marginTop: 8 },
  footerDivider: { width: 40, height: 1, backgroundColor: C.border, marginBottom: 6, opacity: 0.5 },
  footerText:    { fontSize: 11, color: C.muted, opacity: 0.85 },
  footerSub:     { fontSize: 9, color: C.muted, opacity: 0.55, textAlign: 'center' },
});
