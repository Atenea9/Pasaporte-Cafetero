import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  Animated, Dimensions, Modal, SafeAreaView,
  StatusBar, Platform, Image, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { changeAndSaveLanguage } from '../../i18n';

// ── Platform shadow/textShadow helpers (suppress deprecation warnings on web) ─
const sh = (h: number, r: number, op: number, el: number) =>
  Platform.select({
    web:     { boxShadow: `0px ${h}px ${r}px rgba(0,0,0,${op})` } as Record<string, unknown>,
    default: { shadowColor: '#000', shadowOffset: { width: 0, height: h }, shadowOpacity: op, shadowRadius: r, elevation: el },
  }) ?? {};

const tsh = (color: string, h = 1, r = 4) =>
  Platform.select({
    web:     { textShadow: `0px ${h}px ${r}px ${color}` } as Record<string, unknown>,
    default: { textShadowColor: color, textShadowOffset: { width: 0, height: h }, textShadowRadius: r },
  }) ?? {};

// ── Responsive dimensions ────────────────────────────────────────────────────
const { width } = Dimensions.get('window');
const CARD_W       = Math.min(width - 32, 420);
const MEDALLION_SZ = Math.min(width - 80, 340);
const BTN_H        = 90;

// ── Colour palette ────────────────────────────────────────────────────────────
const C = {
  // Parchment
  bgTop:    '#F7EECE',
  bgMid:    '#EDD89E',
  bgBot:    '#D4BA6E',
  // Text
  dark:     '#3A1C08',
  body:     '#5C3010',
  muted:    '#8B6438',
  // Amber title
  amber:    '#C47408',
  amberLt:  '#E89010',
  // Badge
  badgeBg1: '#4A2010',
  badgeBg2: '#6A3818',
  badgeBdr: '#A07030',
  badgeTxt: '#F5E5C0',
  // Wooden buttons
  woodDk:   '#3E1A08',
  woodMd:   '#7A4A20',
  woodLt:   '#A06838',
  woodTxt:  '#F5E8C0',
  woodBdr:  '#281008',
  // Medallion
  medalBdr: '#7A5028',
  medalBg:  '#F0DFB0',
  // UI
  gold:     '#C8860A',
  border:   '#B89040',
};

// ── Assets ────────────────────────────────────────────────────────────────────
const LOGO_ICON    = require('../../../assets/logo-feria.png');
const ILLUSTRATION = require('../../../assets/presentacion-feria.webp');
const ANIMAL_IMGS  = {
  visitor:   require('../../../assets/animal-visitante.png'),
  expositor: require('../../../assets/animal-expositor.png'),
  buyer:     require('../../../assets/animal-comprador.png'),
};

// ── Role config (logic only — visuals handled by RoleButton) ──────────────────
const ROLE_CONFIGS = [
  { key: 'visitor',   credential: 'visitor@demo.com',   tKey: 'login.roles.visitor.title'   },
  { key: 'expositor', credential: 'expositor@demo.com', tKey: 'login.roles.expositor.title' },
  { key: 'buyer',     credential: 'buyer@demo.com',     tKey: 'login.roles.buyer.title'     },
];

// ── Language config ───────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'es', label: 'Español',   native: 'ES'   },
  { code: 'en', label: 'English',   native: 'EN'   },
  { code: 'fr', label: 'Français',  native: 'FR'   },
  { code: 'de', label: 'Deutsch',   native: 'DE'   },
  { code: 'zh', label: '中文',       native: '中文' },
  { code: 'pt', label: 'Português', native: 'PT'   },
  { code: 'it', label: 'Italiano',  native: 'IT'   },
];

// ── Language dropdown ─────────────────────────────────────────────────────────
function LangDropdown() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find(l => l.code === i18n.language) ?? LANGUAGES[0];

  return (
    <View>
      <TouchableOpacity style={dd.trigger} onPress={() => setOpen(true)} activeOpacity={0.85}>
        <Text style={dd.triggerTxt}>{current.native}</Text>
        <Text style={dd.chevron}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={dd.backdrop} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={dd.menu}>
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
                  <Text style={[dd.optNative, active && dd.optActiveNative]}>{l.native}</Text>
                  <Text style={[dd.optLabel,  active && dd.optActiveLabel ]}>{l.label}</Text>
                  {active && <Text style={dd.check}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ── Role button (wooden-plank style) ─────────────────────────────────────────
function RoleButton({
  roleKey, label, loading, disabled, onPress,
}: {
  roleKey: string; label: string;
  loading: boolean; disabled: boolean; onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, friction: 8 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, friction: 6 }).start();

  return (
    <Animated.View style={[rb.wrap, { transform: [{ scale }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
        disabled={disabled}
      >
        <LinearGradient
          colors={[C.woodDk, C.woodMd, C.woodLt, C.woodMd, C.woodDk]}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={rb.grad}
        >
          {/* Animal photo panel */}
          <View style={rb.animalBox}>
            <Image
              source={ANIMAL_IMGS[roleKey as keyof typeof ANIMAL_IMGS]}
              style={rb.animalImg}
              resizeMode="cover"
            />
            {/* Right-edge fade on animal panel */}
            <LinearGradient
              colors={['transparent', C.woodDk + 'CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={rb.animalFade}
            />
          </View>

          {/* Label */}
          <View style={rb.labelBox}>
            {loading
              ? <ActivityIndicator color={C.woodTxt} size="small" />
              : (
                <Text style={rb.label} numberOfLines={1} adjustsFontSizeToFit>
                  {label.toUpperCase()}
                </Text>
              )
            }
          </View>

          {/* Arrow */}
          <Text style={rb.arrow}>›</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main login screen ─────────────────────────────────────────────────────────
export const LoginScreen = () => {
  const { t }          = useTranslation();
  const { login }      = useAuth();
  const [isLoading,   setIsLoading]   = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [showAdmin,   setShowAdmin]   = useState(false);

  const handleLogin = async (credential: string, roleKey: string) => {
    setIsLoading(true);
    setLoadingRole(roleKey);
    try {
      await login(credential, credential.includes('@') ? 'email' : 'phone');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setLoadingRole(null);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bgTop} />

      {/* Parchment background gradient */}
      <LinearGradient
        colors={[C.bgTop, C.bgMid, C.bgBot]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Coffee-plant botanical decorations */}
      <View style={s.decoTL}><Text style={s.decoTxt}>🌿</Text></View>
      <View style={s.decoTR}><Text style={s.decoTxt}>🌿</Text></View>
      <View style={s.decoBL}><Text style={s.decoBot}>🌿</Text></View>
      <View style={s.decoBR}><Text style={s.decoBot}>🌿</Text></View>

      {/* Language selector — fixed top-right */}
      <View style={s.topBar}>
        {/* Hidden long-press target for admin */}
        <TouchableOpacity onLongPress={() => setShowAdmin(v => !v)} activeOpacity={1} style={s.hiddenDot}>
          <View style={s.hiddenDotInner} />
        </TouchableOpacity>
        <LangDropdown />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Feria drop-icon logo ── */}
        <Image source={LOGO_ICON} style={s.logoIcon} resizeMode="contain" />

        {/* ── Title block ── */}
        <Text style={s.fairLabel}>FERIA INTERNACIONAL DE CAFÉ</Text>
        <Text style={[s.titleLg, { width: CARD_W }]} numberOfLines={1} adjustsFontSizeToFit>
          TOLIMA CORAZÓN
        </Text>
        <Text style={[s.titleMd, { width: CARD_W }]} numberOfLines={1} adjustsFontSizeToFit>
          CAFETERO DE COLOMBIA
        </Text>
        <Text style={s.titleSub}>Chaparral - 2026</Text>

        {/* ── "PASAPORTE CAFETERO" carved badge ── */}
        <View style={s.badgeOuter}>
          <LinearGradient
            colors={[C.badgeBg1, C.badgeBg2, C.badgeBg1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.badgeGrad}
          >
            <Text style={s.badgeTxt1}>PASAPORTE</Text>
            <Text style={s.badgeTxt2}>CAFETERO</Text>
          </LinearGradient>
        </View>

        {/* ── Illustration medallion ── */}
        <View style={[s.medalRing, {
          width:        MEDALLION_SZ + 14,
          height:       MEDALLION_SZ + 14,
          borderRadius: (MEDALLION_SZ + 14) / 2,
        }]}>
          <View style={[s.medalClip, {
            width:        MEDALLION_SZ,
            height:       MEDALLION_SZ,
            borderRadius: MEDALLION_SZ / 2,
          }]}>
            <Image
              source={ILLUSTRATION}
              style={{ width: MEDALLION_SZ, height: MEDALLION_SZ }}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* ── Role buttons ── */}
        <View style={s.btnList}>
          {ROLE_CONFIGS.map(r => (
            <RoleButton
              key={r.key}
              roleKey={r.key}
              label={t(r.tKey)}
              loading={loadingRole === r.key}
              disabled={isLoading}
              onPress={() => handleLogin(r.credential, r.key)}
            />
          ))}
        </View>

        {/* ── Admin access ── */}
        {showAdmin ? (
          <View style={s.adminRow}>
            {(['admin', 'ceo'] as const).map(role => (
              <TouchableOpacity
                key={role}
                style={s.adminBtn}
                onPress={() => handleLogin(`${role}@demo.com`, role)}
                disabled={isLoading}
                activeOpacity={0.75}
              >
                {loadingRole === role
                  ? <ActivityIndicator color={C.dark} size="small" />
                  : <Text style={s.adminBtnTxt}>{role.toUpperCase()}</Text>
                }
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <TouchableOpacity style={s.adminTrigger} onPress={() => setShowAdmin(true)} activeOpacity={0.6}>
            <Text style={s.adminTriggerTxt}>{t('login.admin_access')}</Text>
          </TouchableOpacity>
        )}

        {/* ── Footer ── */}
        <View style={s.footer}>
          <View style={s.footerLine} />
          <Text style={s.footerTxt}>© 2026 Gobernación del Tolima</Text>
          <Text style={s.footerSub}>Comité de Cafeteros del Tolima · Alcaldía de Chaparral</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;

// ── Language dropdown styles ──────────────────────────────────────────────────
const dd = StyleSheet.create({
  trigger:         { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.65)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: C.border },
  triggerTxt:      { color: C.dark, fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  chevron:         { color: C.amber, fontSize: 10 },
  backdrop:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.38)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 80, paddingRight: 20 },
  menu:            { width: 200, backgroundColor: '#FFFDF4', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.border, paddingVertical: 8 },
  menuTitle:       { fontSize: 9, fontWeight: '900', color: C.muted, letterSpacing: 2.5, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  option:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, gap: 10 },
  optionActive:    { backgroundColor: '#FBF0C8' },
  optNative:       { fontSize: 13, fontWeight: '800', color: C.muted, width: 36 },
  optActiveNative: { color: C.amber },
  optLabel:        { flex: 1, fontSize: 13, color: C.muted, fontWeight: '500' },
  optActiveLabel:  { color: C.dark },
  check:           { color: C.amber, fontSize: 14, fontWeight: '900' },
});

// ── Role button styles ────────────────────────────────────────────────────────
const rb = StyleSheet.create({
  wrap: {
    width: CARD_W,
    alignSelf: 'center',
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: C.woodBdr,
    ...sh(6, 10, 0.45, 10),
  },
  grad: {
    flexDirection: 'row',
    alignItems: 'center',
    height: BTN_H,
    paddingRight: 16,
  },
  animalBox: {
    width: BTN_H + 10,
    height: BTN_H,
    position: 'relative',
    overflow: 'hidden',
  },
  animalImg: {
    width: BTN_H + 10,
    height: BTN_H,
  },
  animalFade: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0,
    width: 24,
  },
  labelBox: {
    flex: 1,
    paddingLeft: 16,
  },
  label: {
    fontSize: 22,
    fontWeight: '900',
    color: C.woodTxt,
    letterSpacing: 3,
    ...tsh('rgba(0,0,0,0.55)'),
  },
  arrow: {
    fontSize: 30,
    color: 'rgba(245,232,192,0.45)',
    fontWeight: '200',
    marginLeft: 4,
  },
});

// ── Main screen styles ────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgTop },

  // Botanical decorations — pointerEvents in style (not prop) per RN 0.76+
  decoTL: { position: 'absolute', top: -24, left: -28, transform: [{ rotate: '22deg' }], opacity: 0.16, pointerEvents: 'none' as const },
  decoTR: { position: 'absolute', top: -24, right: -28, transform: [{ rotate: '-22deg' }, { scaleX: -1 }], opacity: 0.16, pointerEvents: 'none' as const },
  decoBL: { position: 'absolute', bottom: 30, left: -22, transform: [{ rotate: '-16deg' }], opacity: 0.13, pointerEvents: 'none' as const },
  decoBR: { position: 'absolute', bottom: 30, right: -22, transform: [{ rotate: '16deg' }, { scaleX: -1 }], opacity: 0.13, pointerEvents: 'none' as const },
  decoTxt: { fontSize: 130 },
  decoBot: { fontSize: 110 },

  // Top bar — box-none so touches pass through to content beneath
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 40,
    left: 20, right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
    pointerEvents: 'box-none' as const,
  },
  hiddenDot:      { padding: 8 },
  hiddenDotInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.amber, opacity: 0.35 },

  // Scroll
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 108 : 88,
    paddingBottom: 48,
    paddingHorizontal: 16,
  },

  // Logo
  logoIcon: { width: 54, height: 58, marginBottom: 14 },

  // Title block
  fairLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.dark,
    letterSpacing: 3.5,
    textAlign: 'center',
    marginBottom: 5,
    opacity: 0.8,
  },
  titleLg: {
    fontSize: 38,
    fontWeight: '900',
    color: C.amber,
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 44,
  },
  titleMd: {
    fontSize: 26,
    fontWeight: '900',
    color: C.amber,
    textAlign: 'center',
    letterSpacing: 1.5,
    lineHeight: 32,
    marginBottom: 6,
  },
  titleSub: {
    fontSize: 14,
    fontWeight: '500',
    color: C.body,
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 0.3,
    opacity: 0.9,
  },

  // Badge
  badgeOuter: {
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: C.badgeBdr,
    overflow: 'hidden',
    marginBottom: 20,
    ...sh(5, 10, 0.45, 8),
  },
  badgeGrad: {
    paddingVertical: 12,
    paddingHorizontal: 36,
    alignItems: 'center',
  },
  badgeTxt1: {
    fontSize: 30,
    fontWeight: '900',
    color: C.badgeTxt,
    letterSpacing: 9,
    textAlign: 'center',
    ...tsh('rgba(0,0,0,0.5)'),
  },
  badgeTxt2: {
    fontSize: 26,
    fontWeight: '900',
    color: C.amberLt,
    letterSpacing: 9,
    textAlign: 'center',
    marginTop: -4,
    ...tsh('rgba(0,0,0,0.5)'),
  },

  // Medallion
  medalRing: {
    backgroundColor: C.medalBdr,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    ...sh(10, 16, 0.4, 14),
  },
  medalClip: {
    overflow: 'hidden',
    backgroundColor: C.medalBg,
  },

  // Buttons
  btnList: { width: '100%', alignItems: 'center', marginBottom: 4 },

  // Admin
  adminRow:       { flexDirection: 'row', gap: 12, justifyContent: 'center', marginBottom: 20, width: CARD_W },
  adminBtn:       { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.45)' },
  adminBtnTxt:    { color: C.dark, fontSize: 11, fontWeight: '900', letterSpacing: 2.5 },
  adminTrigger:   { alignSelf: 'center', marginBottom: 20, paddingHorizontal: 22, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(180,130,50,0.45)', backgroundColor: 'rgba(255,255,255,0.2)' },
  adminTriggerTxt:{ color: C.muted, fontSize: 10, fontWeight: '700', letterSpacing: 2 },

  // Footer
  footer:    { alignItems: 'center', gap: 5, marginTop: 8 },
  footerLine:{ width: 40, height: 1, backgroundColor: C.border, opacity: 0.5, marginBottom: 4 },
  footerTxt: { fontSize: 11, color: C.muted, opacity: 0.85 },
  footerSub: { fontSize: 9, color: C.muted, opacity: 0.55, textAlign: 'center' },
});
