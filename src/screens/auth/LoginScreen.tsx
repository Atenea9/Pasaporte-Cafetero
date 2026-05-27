import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  Animated, Easing, Dimensions, Modal, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const G = {
  bg:           '#0B1608',
  bgDeep:       '#060F04',
  card:         '#142210',
  cardHover:    '#1C3018',
  gold:         '#CFA020',
  goldLight:    '#EAC040',
  goldDim:      '#7A6210',
  goldGlow:     '#CFA02028',
  cream:        '#F3EED6',
  muted:        '#6A8060',
  border:       '#CFA02022',
  borderBright: '#CFA02055',
  separator:    '#1C3018',
};

const LANGUAGES: { code: string; label: string; native: string }[] = [
  { code: 'es', label: 'Español',    native: 'ES' },
  { code: 'en', label: 'English',    native: 'EN' },
  { code: 'fr', label: 'Français',   native: 'FR' },
  { code: 'de', label: 'Deutsch',    native: 'DE' },
  { code: 'zh', label: '中文',        native: '中文' },
  { code: 'pt', label: 'Português',  native: 'PT' },
  { code: 'it', label: 'Italiano',   native: 'IT' },
];

const ROLES = [
  { num: '01', key: 'visitor',   credential: 'visitor@demo.com',  color: '#C8860A' },
  { num: '02', key: 'expositor', credential: 'expositor@demo.com', color: '#8B6914' },
  { num: '03', key: 'buyer',     credential: 'buyer@demo.com',    color: '#6B5012' },
];

function CoffeeOrb() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width * 1.2} height={width * 1.2} style={{ position: 'absolute', top: -width * 0.3, left: -width * 0.1, opacity: 0.12 }}>
        <Defs>
          <RadialGradient id="orb1" cx="50%" cy="50%" r="50%">
            <Stop offset="0%"   stopColor="#E8A830" stopOpacity="1" />
            <Stop offset="60%"  stopColor="#C8860A" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#C8860A" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={width * 0.6} cy={width * 0.6} r={width * 0.6} fill="url(#orb1)" />
      </Svg>
      <Svg width={200} height={200} style={{ position: 'absolute', bottom: height * 0.18, right: -40, opacity: 0.06 }}>
        <Defs>
          <RadialGradient id="orb2" cx="50%" cy="50%" r="50%">
            <Stop offset="0%"   stopColor="#C8860A" stopOpacity="1" />
            <Stop offset="100%" stopColor="#C8860A" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={100} cy={100} r={100} fill="url(#orb2)" />
      </Svg>
    </View>
  );
}

function LangDropdown({ lang, onSelect }: { lang: string; onSelect: (l: string) => void }) {
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0];

  return (
    <View style={dd.wrap}>
      <TouchableOpacity style={dd.trigger} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={dd.triggerNative}>{current.native}</Text>
        <Text style={dd.chevron}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={dd.backdrop} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={dd.menu}>
            <LinearGradient colors={['#2C1A00', '#1A0E00']} style={dd.menuInner}>
              <Text style={dd.menuTitle}>IDIOMA / LANGUAGE</Text>
              {LANGUAGES.map((l) => {
                const active = l.code === lang;
                return (
                  <TouchableOpacity
                    key={l.code}
                    style={[dd.option, active && dd.optionActive]}
                    onPress={() => { onSelect(l.code); setOpen(false); }}
                    activeOpacity={0.75}
                  >
                    <Text style={[dd.optionNative, active && dd.optionNativeActive]}>{l.native}</Text>
                    <Text style={[dd.optionLabel, active && dd.optionLabelActive]}>{l.label}</Text>
                    {active && <Text style={dd.check}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

type RoleItem = { key: string; credential: string; color: string; num: string };

function AnimatedCard({ role, loading, disabled, label, onPress }: {
  role: RoleItem; loading: boolean; disabled: boolean; label: string; onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow  = useRef(new Animated.Value(0)).current;

  const onPressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, friction: 8 }),
      Animated.timing(glow,  { toValue: 1, duration: 150, useNativeDriver: false }),
    ]).start();
  };

  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }),
      Animated.timing(glow,  { toValue: 0, duration: 300, useNativeDriver: false }),
    ]).start();
  };

  const borderColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [G.borderBright, role.color],
  });

  const shadowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.55],
  });

  return (
    <Animated.View style={[
      s.card,
      { transform: [{ scale }], borderColor, shadowColor: role.color, shadowOpacity },
    ]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        disabled={disabled}
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.02)']}
          style={s.cardGrad}
        >
          <View style={s.cardBody}>
            <Text style={[s.cardTitle, { color: role.color }]}>{label}</Text>
          </View>
          <View style={s.cardArrow}>
            {loading
              ? <ActivityIndicator color={G.goldLight} size="small" />
              : <Text style={[s.arrow, { color: role.color }]}>›</Text>
            }
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export const LoginScreen = () => {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const [isLoading, setIsLoading]   = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [showAdmin, setShowAdmin]   = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 750, easing: Easing.out(Easing.exp), useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 7, useNativeDriver: true }),
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
    <View style={s.root}>
      <LinearGradient colors={[G.bgDeep, G.bg, '#110700']} style={StyleSheet.absoluteFill} />
      <CoffeeOrb />

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
        {/* ── Logo / Hero ── */}
        <Animated.View style={[s.hero, { transform: [{ scale: logoScale }] }]}>
          <View style={s.badgeRow}>
            <View style={s.editionBadge}>
              <Text style={s.editionText}>✦ EDICIÓN 2026 ✦</Text>
            </View>
          </View>

          <Text style={s.title}>PASAPORTE</Text>
          <Text style={s.titleGold}>CAFETERO</Text>

          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Image source={require('../../../assets/coffee-bag.png')} style={s.dividerIcon} />
            <View style={s.dividerLine} />
          </View>

          <Text style={s.fairName}>{t('login.fair_name')}</Text>
          <Text style={s.fairCity}>Chaparral</Text>
          <Text style={s.fairYear}>2026</Text>
        </Animated.View>

        {/* ── Role Cards ── */}
        <View style={s.cards}>
          {ROLES.map((r) => (
            <AnimatedCard
              key={r.key}
              role={r}
              loading={loadingRole === r.key}
              disabled={isLoading}
              label={t(`login.roles.${r.key}.title`)}
              onPress={() => handleLogin(r.credential, r.key)}
            />
          ))}
        </View>

        {/* ── ADMIN access ── */}
        {showAdmin ? (
          <View style={s.adminRow}>
            <TouchableOpacity
              style={s.adminBtn}
              onPress={() => handleLogin('admin@demo.com', 'admin')}
              disabled={isLoading}
              activeOpacity={0.75}
            >
              <LinearGradient colors={['#2C1A00', '#1A0E00']} style={s.adminGrad}>
                {loadingRole === 'admin'
                  ? <ActivityIndicator color={G.goldLight} size="small" />
                  : <Text style={s.adminText}>ADMIN</Text>
                }
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.adminBtn}
              onPress={() => handleLogin('ceo@demo.com', 'ceo')}
              disabled={isLoading}
              activeOpacity={0.75}
            >
              <LinearGradient colors={['#2C1A00', '#1A0E00']} style={s.adminGrad}>
                {loadingRole === 'ceo'
                  ? <ActivityIndicator color={G.goldLight} size="small" />
                  : <Text style={s.adminText}>CEO</Text>
                }
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={s.adminTrigger} onPress={() => setShowAdmin(true)} activeOpacity={0.6}>
            <Text style={s.adminTriggerText}>ADMIN</Text>
          </TouchableOpacity>
        )}

        <View style={s.footer}>
          <Text style={s.footerText}>© 2026 Gobernación del Tolima</Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default LoginScreen;

// ── Dropdown styles ────────────────────────────────────────────────────────────
const dd = StyleSheet.create({
  wrap:             { position: 'relative' },
  trigger:          { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: G.goldGlow, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: G.borderBright },
  triggerNative:    { color: G.goldLight, fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  chevron:          { color: G.gold, fontSize: 10 },
  backdrop:         { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 80, paddingRight: 20 },
  menu:             { width: 200, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: G.borderBright, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 12 },
  menuInner:        { paddingVertical: 8 },
  menuTitle:        { fontSize: 9, fontWeight: '900', color: G.muted, letterSpacing: 2.5, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: G.border },
  option:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 11, gap: 10 },
  optionActive:     { backgroundColor: G.goldGlow },
  optionNative:     { fontSize: 13, fontWeight: '800', color: G.muted, width: 32 },
  optionNativeActive: { color: G.goldLight },
  optionLabel:      { flex: 1, fontSize: 13, color: G.muted, fontWeight: '500' },
  optionLabelActive:{ color: G.cream },
  check:            { color: G.gold, fontSize: 14, fontWeight: '900' },
});

// ── Screen styles ──────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: G.bg },

  topBar:       { position: 'absolute', top: 52, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 },
  topBarLeft:   { padding: 8 },
  coffeeDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: G.gold, opacity: 0.4 },

  scroll:       { flexGrow: 1, paddingHorizontal: 22, paddingTop: 110, paddingBottom: 40 },

  hero:         { alignItems: 'center', marginBottom: 40 },
  badgeRow:     { marginBottom: 18 },
  editionBadge: { backgroundColor: G.goldGlow, borderRadius: 30, paddingHorizontal: 18, paddingVertical: 6, borderWidth: 1, borderColor: G.borderBright },
  editionText:  { color: G.gold, fontSize: 10, fontWeight: '900', letterSpacing: 3.5 },

  title:        { fontSize: 46, fontWeight: '900', color: G.cream, letterSpacing: -1, lineHeight: 48, textAlign: 'center' },
  titleGold:    { fontSize: 46, fontWeight: '900', color: G.gold, letterSpacing: -1, lineHeight: 50, textAlign: 'center', marginBottom: 18 },

  dividerRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, width: '70%' },
  dividerLine:  { flex: 1, height: 1, backgroundColor: G.borderBright },
  dividerIcon:  { width: 36, height: 36, resizeMode: 'contain' },

  fairName:     { fontSize: 13, fontWeight: '700', color: G.goldLight, letterSpacing: 1, textAlign: 'center', marginBottom: 2 },
  fairCity:     { fontSize: 22, fontWeight: '900', color: G.cream, letterSpacing: 3, textAlign: 'center', marginBottom: 2, textTransform: 'uppercase' },
  fairYear:     { fontSize: 11, color: G.muted, letterSpacing: 5, textAlign: 'center', marginBottom: 2 },
  subtitle:     { fontSize: 11, color: G.muted, letterSpacing: 2, textAlign: 'center', textTransform: 'uppercase' },

  cards:        { gap: 14, marginBottom: 28 },

  card:         { borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: G.borderBright, shadowColor: '#C8860A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 14, elevation: 8 },
  cardGrad:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 22, paddingHorizontal: 20 },
  cardAccent:   { width: 3, alignSelf: 'stretch', marginRight: 16, borderRadius: 2, opacity: 0.8 },
  cardNumWrap:  { marginRight: 14 },
  cardNum:      { fontSize: 30, fontWeight: '900', letterSpacing: -1, lineHeight: 34 },
  cardBody:     { flex: 1, alignItems: 'center' },
  cardTitle:    { fontSize: 24, fontWeight: '900', letterSpacing: 2, textAlign: 'center', textTransform: 'uppercase' },
  cardDesc:     { fontSize: 11, color: G.muted, lineHeight: 16, marginBottom: 9 },
  credBadge:    { alignSelf: 'flex-start', backgroundColor: 'rgba(200,134,10,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: G.borderBright },
  credText:     { color: G.gold, fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  cardArrow:    { paddingLeft: 8, width: 28, alignItems: 'center' },
  arrow:        { fontSize: 28, fontWeight: '300', lineHeight: 32 },

  adminRow:     { flexDirection: 'row', gap: 12, justifyContent: 'center', marginBottom: 24 },
  adminBtn:     { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: G.borderBright, flex: 1 },
  adminGrad:    { paddingVertical: 13, alignItems: 'center' },
  adminText:    { color: G.gold, fontSize: 11, fontWeight: '900', letterSpacing: 2.5 },

  adminTrigger: { alignSelf: 'center', marginBottom: 24, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: G.borderBright, backgroundColor: 'rgba(200,134,10,0.06)' },
  adminTriggerText: { color: G.goldDim, fontSize: 11, fontWeight: '900', letterSpacing: 2.5 },

  footer:       { alignItems: 'center', marginTop: 8 },
  footerText:   { fontSize: 10, color: G.muted, opacity: 0.6, letterSpacing: 0.5 },
});
