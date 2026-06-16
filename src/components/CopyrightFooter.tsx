import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CopyrightFooter() {
  return (
    <View style={s.wrap}>
      <Text style={s.text}>©APEX 2026</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingVertical: 18, alignItems: 'center' },
  text: { fontSize: 9, color: 'rgba(140,100,60,0.45)', letterSpacing: 1.5, fontWeight: '600' } as any,
});
