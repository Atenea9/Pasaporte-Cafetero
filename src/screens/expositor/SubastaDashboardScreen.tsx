import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, StatusBar, Modal, TextInput, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { ExpositorNavProp } from '../../navigation/types';

const T = {
  bg: '#FAF7F0', card: '#FFFFFF', dark: '#2C1810', body: '#4A3728',
  muted: '#8A7060', gold: '#B8860B', goldPale: '#F5E6B0',
  green: '#2D5A1E', greenPale: '#E8F2E4', border: '#E8D5B0',
  blue: '#1565C0', bluePale: '#E3F0FF',
};

const PROCESOS = ['Lavado', 'Natural', 'Honey', 'Anaeróbico', 'Washed', 'Semi-lavado'];
const VARIEDADES = ['Castillo', 'Caturra', 'Colombia', 'Geisha', 'Tabi', 'Bourbon', 'Típica'];

interface Lote {
  id: string;
  nombre: string;
  finca: string;
  variedad: string;
  proceso: string;
  altitud: string;
  peso_kg: string;
  sca: string;
  notasOrganolépticas: string[];
  historia: string;
  precioBase: string;
  municipio: string;
  activo: boolean;
  // SCA breakdown
  fragancia: string;
  sabor: string;
  retrogusto: string;
  acidez: string;
  cuerpo: string;
  uniformidad: string;
  taza_limpia: string;
  dulzura: string;
  balance: string;
}

export default function SubastaDashboardScreen() {
  const nav = useNavigation<ExpositorNavProp>();
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLote, setEditingLote] = useState<Lote | null>(null);
  const [nota, setNota] = useState('');
  const [notas, setNotas] = useState<string[]>([]);
  const [form, setForm] = useState({
    nombre: '', finca: '', variedad: 'Castillo', proceso: 'Lavado',
    altitud: '', peso_kg: '', sca: '', historia: '', precioBase: '', municipio: '',
    fragancia: '', sabor: '', retrogusto: '', acidez: '', cuerpo: '',
    uniformidad: '', taza_limpia: '', dulzura: '', balance: '',
  });

  const openNew = () => {
    setEditingLote(null);
    setForm({ nombre: '', finca: '', variedad: 'Castillo', proceso: 'Lavado', altitud: '', peso_kg: '', sca: '', historia: '', precioBase: '', municipio: '', fragancia: '', sabor: '', retrogusto: '', acidez: '', cuerpo: '', uniformidad: '', taza_limpia: '', dulzura: '', balance: '' });
    setNotas([]);
    setNota('');
    setModalOpen(true);
  };

  const addNota = () => {
    if (nota.trim()) { setNotas(n => [...n, nota.trim()]); setNota(''); }
  };

  const saveLote = () => {
    if (!form.nombre.trim() || !form.finca.trim()) {
      Alert.alert('Campos requeridos', 'El nombre del lote y la finca son obligatorios.');
      return;
    }
    const lote: Lote = {
      id: editingLote?.id || Date.now().toString(),
      ...form,
      notasOrganolépticas: notas,
      activo: true,
    };
    if (editingLote) {
      setLotes(ls => ls.map(l => l.id === editingLote.id ? lote : l));
    } else {
      setLotes(ls => [...ls, lote]);
    }
    setModalOpen(false);
  };

  const getScaColor = (sca: string) => {
    const n = parseFloat(sca);
    if (n >= 90) return '#C0392B';
    if (n >= 87) return T.blue;
    if (n >= 85) return T.green;
    if (n >= 80) return T.gold;
    return T.muted;
  };

  const f = (key: keyof typeof form) => (v: string) => setForm(p => ({ ...p, [key]: v }));

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Text style={s.backIcon}>‹</Text>
          <Text style={s.backText}>Volver</Text>
        </TouchableOpacity>
        <Text style={s.topTitle}>Subasta Internacional</Text>
        <TouchableOpacity style={s.addBtn} onPress={openNew}>
          <Text style={s.addBtnText}>+ Lote</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Info */}
        <LinearGradient colors={[T.blue, '#0D47A1']} style={s.heroBanner}>
          <Text style={s.heroIcon}>🏆</Text>
          <View style={s.heroText}>
            <Text style={s.heroTitle}>Microlotes para Subasta</Text>
            <Text style={s.heroSub}>Los compradores internacionales verán tus lotes con todos los análisis SCA</Text>
          </View>
        </LinearGradient>

        <View style={s.infoPills}>
          {['☕ SCA Score', '🌿 Proceso', '📦 Peso (kg)', '💰 Precio Base USD'].map(p => (
            <View key={p} style={s.infoPill}><Text style={s.infoPillText}>{p}</Text></View>
          ))}
        </View>

        {lotes.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>🏆</Text>
            <Text style={s.emptyTitle}>Sin lotes registrados</Text>
            <Text style={s.emptySub}>Agrega tus microlotes de café especial para participar en la subasta internacional.</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={openNew}>
              <Text style={s.emptyBtnText}>+ Agregar primer lote</Text>
            </TouchableOpacity>
          </View>
        ) : (
          lotes.map(lote => (
            <TouchableOpacity key={lote.id} style={s.loteCard} activeOpacity={0.9}
              onPress={() => { setEditingLote(lote); setForm({ nombre: lote.nombre, finca: lote.finca, variedad: lote.variedad, proceso: lote.proceso, altitud: lote.altitud, peso_kg: lote.peso_kg, sca: lote.sca, historia: lote.historia, precioBase: lote.precioBase, municipio: lote.municipio, fragancia: lote.fragancia, sabor: lote.sabor, retrogusto: lote.retrogusto, acidez: lote.acidez, cuerpo: lote.cuerpo, uniformidad: lote.uniformidad, taza_limpia: lote.taza_limpia, dulzura: lote.dulzura, balance: lote.balance }); setNotas([...lote.notasOrganolépticas]); setModalOpen(true); }}
            >
              <View style={s.loteHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={s.loteNombre}>{lote.nombre}</Text>
                  <Text style={s.loteFinca}>{lote.finca} · {lote.municipio}</Text>
                </View>
                {lote.sca ? (
                  <View style={[s.scaBadge, { backgroundColor: getScaColor(lote.sca) }]}>
                    <Text style={s.scaNum}>{lote.sca}</Text>
                    <Text style={s.scaLabel}>SCA</Text>
                  </View>
                ) : null}
              </View>
              <View style={s.loteTags}>
                {[lote.variedad, lote.proceso, lote.altitud ? `${lote.altitud} msnm` : '', lote.peso_kg ? `${lote.peso_kg} kg` : ''].filter(Boolean).map((tag, i) => (
                  <View key={i} style={s.loteTag}><Text style={s.loteTagText}>{tag}</Text></View>
                ))}
              </View>
              {lote.precioBase && <Text style={s.lotePrecio}>Precio base: USD {lote.precioBase}</Text>}
              {lote.notasOrganolépticas.length > 0 && (
                <Text style={s.loteNotas}>Notas: {lote.notasOrganolépticas.join(' · ')}</Text>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.modalWrap}>
            <View style={s.modalCard}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>{editingLote ? 'Editar lote' : 'Nuevo microlote'}</Text>
                <TouchableOpacity onPress={() => setModalOpen(false)}><Text style={s.modalClose}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                <Text style={s.fSec}>📋 Identificación del Lote</Text>
                {[['NOMBRE DEL LOTE *', 'nombre', 'Ej: Lote #1 — Geisha Honey'], ['NOMBRE DE LA FINCA *', 'finca', 'Ej: Finca La Esperanza'], ['MUNICIPIO', 'municipio', 'Ej: Planadas'], ['CAFICULTOR', 'nombre', '']].map(([label, key, ph]) => (
                  <View key={label as string} style={s.fg}>
                    <Text style={s.fl}>{label as string}</Text>
                    <TextInput style={s.inp} value={form[key as keyof typeof form]} onChangeText={f(key as keyof typeof form)} placeholder={ph as string} placeholderTextColor={T.muted} />
                  </View>
                ))}

                <Text style={s.fSec}>☕ Datos del Café</Text>
                <View style={s.fg}><Text style={s.fl}>VARIEDAD</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {VARIEDADES.map(v => <TouchableOpacity key={v} style={[s.pill, form.variedad === v && s.pillA]} onPress={() => setForm(p => ({ ...p, variedad: v }))}><Text style={[s.pillT, form.variedad === v && s.pillTA]}>{v}</Text></TouchableOpacity>)}
                  </ScrollView>
                </View>
                <View style={s.fg}><Text style={s.fl}>PROCESO</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {PROCESOS.map(p => <TouchableOpacity key={p} style={[s.pill, form.proceso === p && s.pillA]} onPress={() => setForm(pr => ({ ...pr, proceso: p }))}><Text style={[s.pillT, form.proceso === p && s.pillTA]}>{p}</Text></TouchableOpacity>)}
                  </ScrollView>
                </View>
                {[['ALTITUD (msnm)', 'altitud', '1800', 'numeric'], ['PESO DEL LOTE (kg)', 'peso_kg', '500', 'numeric'], ['PRECIO BASE (USD)', 'precioBase', '8500', 'numeric']].map(([label, key, ph, kb]) => (
                  <View key={label as string} style={s.fg}>
                    <Text style={s.fl}>{label as string}</Text>
                    <TextInput style={s.inp} value={form[key as keyof typeof form]} onChangeText={f(key as keyof typeof form)} placeholder={ph as string} placeholderTextColor={T.muted} keyboardType={(kb as any) || 'default'} />
                  </View>
                ))}

                <Text style={s.fSec}>🏆 Análisis SCA</Text>
                <View style={s.fg}>
                  <Text style={s.fl}>PUNTAJE SCA TOTAL</Text>
                  <TextInput style={[s.inp, { fontSize: 20, fontWeight: '900', color: T.blue }]} value={form.sca} onChangeText={f('sca')} placeholder="Ej: 87.5" placeholderTextColor={T.muted} keyboardType="decimal-pad" />
                </View>
                <View style={s.scaGrid}>
                  {[['Fragancia/Aroma', 'fragancia'], ['Sabor', 'sabor'], ['Retrogusto', 'retrogusto'], ['Acidez', 'acidez'], ['Cuerpo', 'cuerpo'], ['Uniformidad', 'uniformidad'], ['Taza Limpia', 'taza_limpia'], ['Dulzura', 'dulzura'], ['Balance', 'balance']].map(([label, key]) => (
                    <View key={key as string} style={s.scaField}>
                      <Text style={s.scaFieldLabel}>{label as string}</Text>
                      <TextInput style={s.scaInput} value={form[key as keyof typeof form]} onChangeText={f(key as keyof typeof form)} placeholder="0.0" placeholderTextColor={T.muted} keyboardType="decimal-pad" />
                    </View>
                  ))}
                </View>

                <Text style={s.fSec}>🌸 Notas Organolépticas</Text>
                <View style={s.notaRow}>
                  <TextInput style={[s.inp, { flex: 1 }]} value={nota} onChangeText={setNota} placeholder="Ej: Jazmín, Durazno, Panela..." placeholderTextColor={T.muted} onSubmitEditing={addNota} />
                  <TouchableOpacity style={s.notaBtn} onPress={addNota}><Text style={s.notaBtnText}>+</Text></TouchableOpacity>
                </View>
                <View style={s.notasWrap}>
                  {notas.map((n, i) => (
                    <TouchableOpacity key={i} style={s.notaTag} onPress={() => setNotas(ns => ns.filter((_, j) => j !== i))}>
                      <Text style={s.notaTagText}>{n} ✕</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={s.fSec}>📖 Historia del Lote</Text>
                <View style={s.fg}>
                  <Text style={s.fl}>HISTORIA Y ORIGEN</Text>
                  <TextInput style={[s.inp, { height: 100, textAlignVertical: 'top' }]} value={form.historia} onChangeText={f('historia')} placeholder="Cuéntale a los compradores la historia de este lote..." placeholderTextColor={T.muted} multiline />
                </View>

                <TouchableOpacity style={s.saveBtn} onPress={saveLote}>
                  <Text style={s.saveBtnText}>✓ {editingLote ? 'Guardar cambios' : 'Publicar lote en subasta'}</Text>
                </TouchableOpacity>
                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: T.bg },
  topBar:       { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: T.border },
  backBtn:      { flexDirection: 'row', alignItems: 'center', gap: 2 },
  backIcon:     { fontSize: 28, color: T.blue, lineHeight: 32, fontWeight: '300' },
  backText:     { fontSize: 15, color: T.blue, fontWeight: '600' },
  topTitle:     { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '900', color: T.dark },
  addBtn:       { backgroundColor: T.blue, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  addBtnText:   { color: '#FFF', fontSize: 13, fontWeight: '800' },
  scroll:       { padding: 16, paddingBottom: 40 },
  heroBanner:   { borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  heroIcon:     { fontSize: 40 },
  heroText:     { flex: 1 },
  heroTitle:    { fontSize: 18, fontWeight: '900', color: '#FFF', marginBottom: 4 },
  heroSub:      { fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 17 },
  infoPills:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  infoPill:     { backgroundColor: T.bluePale, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: T.blue + '30' },
  infoPillText: { fontSize: 11, color: T.blue, fontWeight: '700' },
  empty:        { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji:   { fontSize: 64, marginBottom: 16 },
  emptyTitle:   { fontSize: 20, fontWeight: '900', color: T.dark, marginBottom: 8 },
  emptySub:     { fontSize: 13, color: T.muted, textAlign: 'center', lineHeight: 20, marginBottom: 24, paddingHorizontal: 20 },
  emptyBtn:     { backgroundColor: T.blue, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14 },
  emptyBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  loteCard:     { backgroundColor: T.card, borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: T.border, shadowColor: T.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  loteHeader:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  loteNombre:   { fontSize: 16, fontWeight: '900', color: T.dark, marginBottom: 3 },
  loteFinca:    { fontSize: 12, color: T.muted },
  scaBadge:     { borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center', marginLeft: 12, minWidth: 56 },
  scaNum:       { fontSize: 18, fontWeight: '900', color: '#FFF' },
  scaLabel:     { fontSize: 9, color: 'rgba(255,255,255,0.85)', fontWeight: '700' },
  loteTags:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  loteTag:      { backgroundColor: T.bg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: T.border },
  loteTagText:  { fontSize: 11, color: T.body },
  lotePrecio:   { fontSize: 14, fontWeight: '800', color: T.gold, marginTop: 4 },
  loteNotas:    { fontSize: 12, color: T.muted, marginTop: 4, fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalWrap:    { maxHeight: '94%' },
  modalCard:    { backgroundColor: T.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingTop: 18 },
  modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalTitle:   { fontSize: 20, fontWeight: '900', color: T.dark },
  modalClose:   { fontSize: 20, color: T.muted, padding: 4 },
  fSec:         { fontSize: 14, fontWeight: '900', color: T.dark, marginTop: 18, marginBottom: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: T.border },
  fg:           { marginBottom: 12 },
  fl:           { fontSize: 10, fontWeight: '800', color: T.gold, letterSpacing: 1, marginBottom: 6 },
  inp:          { backgroundColor: T.card, borderWidth: 1, borderColor: T.border, borderRadius: 12, padding: 14, fontSize: 14, color: T.dark },
  pill:         { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: T.border, backgroundColor: T.card, marginRight: 8, marginBottom: 4 },
  pillA:        { backgroundColor: T.blue, borderColor: T.blue },
  pillT:        { fontSize: 12, color: T.body, fontWeight: '600' },
  pillTA:       { color: '#FFF' },
  scaGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  scaField:     { width: '48%' },
  scaFieldLabel:{ fontSize: 10, fontWeight: '700', color: T.muted, marginBottom: 4, letterSpacing: 0.3 },
  scaInput:     { backgroundColor: T.card, borderWidth: 1, borderColor: T.border, borderRadius: 10, padding: 10, fontSize: 14, color: T.dark, textAlign: 'center', fontWeight: '800' },
  notaRow:      { flexDirection: 'row', gap: 8, marginBottom: 8 },
  notaBtn:      { width: 48, height: 48, borderRadius: 12, backgroundColor: T.blue, alignItems: 'center', justifyContent: 'center' },
  notaBtnText:  { fontSize: 24, color: '#FFF', lineHeight: 28 },
  notasWrap:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  notaTag:      { backgroundColor: T.bluePale, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: T.blue + '40' },
  notaTagText:  { fontSize: 12, color: T.blue, fontWeight: '700' },
  saveBtn:      { backgroundColor: T.blue, borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 20 },
  saveBtnText:  { fontSize: 15, fontWeight: '900', color: '#FFF' },
});
