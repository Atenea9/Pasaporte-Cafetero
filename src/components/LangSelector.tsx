import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { changeAndSaveLanguage } from '../i18n';

const LANGUAGES = [
  { code: 'es', native: 'ES', label: 'Español' },
  { code: 'en', native: 'EN', label: 'English' },
  { code: 'fr', native: 'FR', label: 'Français' },
  { code: 'de', native: 'DE', label: 'Deutsch' },
  { code: 'zh', native: '中文', label: '中文' },
  { code: 'pt', native: 'PT', label: 'Português' },
  { code: 'it', native: 'IT', label: 'Italiano' },
];

interface Props {
  style?: object;
  light?: boolean;
}

export default function LangSelector({ style, light }: Props) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find(l => l.code === i18n.language) ?? LANGUAGES[0];

  const bg = light ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)';
  const textColor = light ? '#2C1A0E' : '#FFFFFF';
  const borderColor = light ? '#E0C880' : 'rgba(255,255,255,0.3)';

  return (
    <View style={style}>
      <TouchableOpacity
        style={[s.trigger, { backgroundColor: bg, borderColor }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={[s.triggerText, { color: textColor }]}>{current.native}</Text>
        <Text style={[s.chevron, { color: light ? '#C8960C' : 'rgba(255,255,255,0.7)' }]}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={s.menu}>
            <View style={s.menuInner}>
              <Text style={s.menuTitle}>IDIOMA / LANGUAGE</Text>
              {LANGUAGES.map(l => {
                const active = l.code === i18n.language;
                return (
                  <TouchableOpacity
                    key={l.code}
                    style={[s.option, active && s.optionActive]}
                    onPress={() => { changeAndSaveLanguage(l.code); setOpen(false); }}
                    activeOpacity={0.75}
                  >
                    <Text style={[s.optNative, active && s.optNativeActive]}>{l.native}</Text>
                    <Text style={[s.optLabel, active && s.optLabelActive]}>{l.label}</Text>
                    {active && <Text style={s.check}>✓</Text>}
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

const s = StyleSheet.create({
  trigger: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1,
  },
  triggerText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  chevron: { fontSize: 9 },
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start', alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 90 : 70, paddingRight: 16,
  },
  menu: {
    width: 190, borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: '#E0C880',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 12, elevation: 10,
  },
  menuInner: { backgroundColor: '#FFFDF4', paddingVertical: 6 },
  menuTitle: {
    fontSize: 8, fontWeight: '900', color: '#9B7B5A', letterSpacing: 2.5,
    paddingHorizontal: 14, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#E0C880',
  },
  option: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  optionActive: { backgroundColor: '#FBF0C8' },
  optNative: { fontSize: 12, fontWeight: '800', color: '#9B7B5A', width: 30 },
  optNativeActive: { color: '#C8960C' },
  optLabel: { flex: 1, fontSize: 12, color: '#9B7B5A', fontWeight: '500' },
  optLabelActive: { color: '#2C1A0E' },
  check: { color: '#C8960C', fontSize: 13, fontWeight: '900' },
});
