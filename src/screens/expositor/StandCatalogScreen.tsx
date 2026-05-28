import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, StatusBar, TextInput, Modal, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { ExpositorNavProp } from '../../navigation/types';

const T = {
  bg: '#FAF7F0', card: '#FFFFFF', dark: '#2C1810', body: '#4A3728',
  muted: '#8A7060', gold: '#B8860B', goldPale: '#F5E6B0',
  green: '#2D5A1E', greenPale: '#E8F2E4', border: '#E8D5B0', accent: '#C0392B',
};

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: string;
  categoria: string;
  caracteristicas: string[];
  disponible: boolean;
}

const CATEGORIAS = ['☕ Café', '🫙 Procesados', '🎨 Artesanías', '🍽️ Gastronomía', '🌿 Aromáticas', '🎁 Kits', '📦 Otros'];

export default function StandCatalogScreen() {
  const nav = useNavigation<ExpositorNavProp>();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);

  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', categoria: '☕ Café', caracteristica: '' });
  const [caracteristicas, setCaracteristicas] = useState<string[]>([]);

  const openNew = () => {
    setEditing(null);
    setForm({ nombre: '', descripcion: '', precio: '', categoria: '☕ Café', caracteristica: '' });
    setCaracteristicas([]);
    setModalOpen(true);
  };

  const openEdit = (p: Producto) => {
    setEditing(p);
    setForm({ nombre: p.nombre, descripcion: p.descripcion, precio: p.precio, categoria: p.categoria, caracteristica: '' });
    setCaracteristicas([...p.caracteristicas]);
    setModalOpen(true);
  };

  const addCaracteristica = () => {
    if (form.caracteristica.trim()) {
      setCaracteristicas(c => [...c, form.caracteristica.trim()]);
      setForm(f => ({ ...f, caracteristica: '' }));
    }
  };

  const saveProducto = () => {
    if (!form.nombre.trim() || !form.precio.trim()) {
      Alert.alert('Campos requeridos', 'El nombre y el precio son obligatorios.');
      return;
    }
    const producto: Producto = {
      id: editing?.id || Date.now().toString(),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio: form.precio.trim(),
      categoria: form.categoria,
      caracteristicas,
      disponible: true,
    };
    if (editing) {
      setProductos(ps => ps.map(p => p.id === editing.id ? producto : p));
    } else {
      setProductos(ps => [...ps, producto]);
    }
    setModalOpen(false);
  };

  const deleteProducto = (id: string) => {
    Alert.alert('Eliminar producto', '¿Seguro que deseas eliminar este producto?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => setProductos(ps => ps.filter(p => p.id !== id)) },
    ]);
  };

  const toggleDisponible = (id: string) => {
    setProductos(ps => ps.map(p => p.id === id ? { ...p, disponible: !p.disponible } : p));
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <View style={s.container}>

        {/* Header */}
        <View style={s.topBar}>
          <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
            <Text style={s.backIcon}>‹</Text>
            <Text style={s.backText}>Volver</Text>
          </TouchableOpacity>
          <Text style={s.topTitle}>Catálogo de Productos</Text>
          <TouchableOpacity style={s.addBtn} onPress={openNew}>
            <Text style={s.addBtnText}>+ Agregar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Info banner */}
          <View style={s.infoBanner}>
            <Text style={s.infoBannerText}>
              📢 Los visitantes y compradores internacionales podrán ver tu catálogo completo desde su app.
            </Text>
          </View>

          {productos.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyEmoji}>📦</Text>
              <Text style={s.emptyTitle}>Sin productos aún</Text>
              <Text style={s.emptySub}>Agrega los productos que venderás en tu stand para que los visitantes y compradores puedan verlos.</Text>
              <TouchableOpacity style={s.emptyBtn} onPress={openNew}>
                <Text style={s.emptyBtnText}>+ Agregar primer producto</Text>
              </TouchableOpacity>
            </View>
          ) : (
            productos.map((prod) => (
              <View key={prod.id} style={[s.prodCard, !prod.disponible && s.prodCardInactive]}>
                <View style={s.prodHeader}>
                  <View style={s.prodCategBadge}>
                    <Text style={s.prodCategText}>{prod.categoria}</Text>
                  </View>
                  <View style={s.prodActions}>
                    <TouchableOpacity onPress={() => toggleDisponible(prod.id)} style={[s.toggleBtn, prod.disponible ? s.toggleBtnOn : s.toggleBtnOff]}>
                      <Text style={s.toggleBtnText}>{prod.disponible ? 'Disponible' : 'Agotado'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={s.prodNombre}>{prod.nombre}</Text>
                <Text style={s.prodPrecio}>{prod.precio}</Text>
                {prod.descripcion ? <Text style={s.prodDesc}>{prod.descripcion}</Text> : null}
                {prod.caracteristicas.length > 0 && (
                  <View style={s.charsList}>
                    {prod.caracteristicas.map((c, i) => (
                      <View key={i} style={s.charPill}>
                        <Text style={s.charText}>• {c}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <View style={s.prodFooter}>
                  <TouchableOpacity style={s.editBtn} onPress={() => openEdit(prod)}>
                    <Text style={s.editBtnText}>✏️ Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.deleteBtn} onPress={() => deleteProducto(prod.id)}>
                    <Text style={s.deleteBtnText}>🗑 Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Modal Form */}
        <Modal visible={modalOpen} animationType="slide" transparent>
          <View style={s.modalOverlay}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.modalWrap}>
              <View style={s.modalCard}>
                <View style={s.modalHeader}>
                  <Text style={s.modalTitle}>{editing ? 'Editar producto' : 'Nuevo producto'}</Text>
                  <TouchableOpacity onPress={() => setModalOpen(false)}>
                    <Text style={s.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                  <Text style={s.fieldLabel}>NOMBRE DEL PRODUCTO *</Text>
                  <TextInput style={s.input} value={form.nombre} onChangeText={v => setForm(f => ({ ...f, nombre: v }))} placeholder="Ej: Café Especial Geisha" placeholderTextColor={T.muted} />

                  <Text style={s.fieldLabel}>PRECIO</Text>
                  <TextInput style={s.input} value={form.precio} onChangeText={v => setForm(f => ({ ...f, precio: v }))} placeholder="Ej: $25.000 · USD 12 · Consultar" placeholderTextColor={T.muted} />

                  <Text style={s.fieldLabel}>CATEGORÍA</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.categRow}>
                    {CATEGORIAS.map(c => (
                      <TouchableOpacity key={c} style={[s.categPill, form.categoria === c && s.categPillActive]} onPress={() => setForm(f => ({ ...f, categoria: c }))}>
                        <Text style={[s.categPillText, form.categoria === c && s.categPillTextActive]}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={s.fieldLabel}>DESCRIPCIÓN</Text>
                  <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} value={form.descripcion} onChangeText={v => setForm(f => ({ ...f, descripcion: v }))} placeholder="Describe tu producto..." placeholderTextColor={T.muted} multiline />

                  <Text style={s.fieldLabel}>CARACTERÍSTICAS / DATOS DEL PRODUCTO</Text>
                  <View style={s.charRow}>
                    <TextInput style={[s.input, { flex: 1 }]} value={form.caracteristica} onChangeText={v => setForm(f => ({ ...f, caracteristica: v }))} placeholder="Ej: Altura 1800 msnm · SCA 87 pts" placeholderTextColor={T.muted} onSubmitEditing={addCaracteristica} />
                    <TouchableOpacity style={s.charAddBtn} onPress={addCaracteristica}>
                      <Text style={s.charAddText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  {caracteristicas.map((c, i) => (
                    <View key={i} style={s.charItem}>
                      <Text style={s.charItemText}>• {c}</Text>
                      <TouchableOpacity onPress={() => setCaracteristicas(cs => cs.filter((_, j) => j !== i))}>
                        <Text style={s.charRemove}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  <TouchableOpacity style={s.saveBtn} onPress={saveProducto}>
                    <Text style={s.saveBtnText}>{editing ? 'Guardar cambios' : '✓ Agregar producto'}</Text>
                  </TouchableOpacity>
                  <View style={{ height: 40 }} />
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: T.bg },
  container:        { flex: 1 },
  topBar:           { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 12, backgroundColor: T.bg, borderBottomWidth: 1, borderBottomColor: T.border },
  backBtn:          { flexDirection: 'row', alignItems: 'center', gap: 2 },
  backIcon:         { fontSize: 28, color: T.green, lineHeight: 32, fontWeight: '300' },
  backText:         { fontSize: 15, color: T.green, fontWeight: '600' },
  topTitle:         { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '900', color: T.dark },
  addBtn:           { backgroundColor: T.green, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  addBtnText:       { color: '#FFF', fontSize: 13, fontWeight: '800' },
  scroll:           { padding: 16, paddingBottom: 40 },
  infoBanner:       { backgroundColor: T.goldPale, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: T.gold + '50' },
  infoBannerText:   { fontSize: 12, color: T.body, lineHeight: 18 },
  emptyState:       { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyEmoji:       { fontSize: 64, marginBottom: 16 },
  emptyTitle:       { fontSize: 20, fontWeight: '900', color: T.dark, marginBottom: 8 },
  emptySub:         { fontSize: 13, color: T.muted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  emptyBtn:         { backgroundColor: T.green, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14 },
  emptyBtnText:     { color: '#FFF', fontWeight: '800', fontSize: 14 },
  prodCard:         { backgroundColor: T.card, borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: T.border, shadowColor: T.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  prodCardInactive: { opacity: 0.6 },
  prodHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  prodCategBadge:   { backgroundColor: T.greenPale, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  prodCategText:    { fontSize: 11, color: T.green, fontWeight: '700' },
  prodActions:      { flexDirection: 'row', gap: 8 },
  toggleBtn:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  toggleBtnOn:      { backgroundColor: T.greenPale, borderColor: T.green + '50' },
  toggleBtnOff:     { backgroundColor: '#FFF0F0', borderColor: T.accent + '50' },
  toggleBtnText:    { fontSize: 10, fontWeight: '700', color: T.body },
  prodNombre:       { fontSize: 18, fontWeight: '900', color: T.dark, marginBottom: 4 },
  prodPrecio:       { fontSize: 16, fontWeight: '800', color: T.gold, marginBottom: 6 },
  prodDesc:         { fontSize: 13, color: T.body, lineHeight: 19, marginBottom: 10 },
  charsList:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  charPill:         { backgroundColor: T.bg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: T.border },
  charText:         { fontSize: 11, color: T.body },
  prodFooter:       { flexDirection: 'row', gap: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: T.border },
  editBtn:          { flex: 1, backgroundColor: T.bg, borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: T.border },
  editBtnText:      { fontSize: 13, fontWeight: '700', color: T.body },
  deleteBtn:        { backgroundColor: '#FFF0F0', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: T.accent + '30' },
  deleteBtnText:    { fontSize: 13, fontWeight: '700', color: T.accent },
  modalOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalWrap:        { maxHeight: '92%' },
  modalCard:        { backgroundColor: T.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 20 },
  modalHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:       { fontSize: 20, fontWeight: '900', color: T.dark },
  modalClose:       { fontSize: 20, color: T.muted, padding: 4 },
  fieldLabel:       { fontSize: 10, fontWeight: '800', color: T.gold, letterSpacing: 1, marginBottom: 6, marginTop: 14 },
  input:            { backgroundColor: T.card, borderWidth: 1, borderColor: T.border, borderRadius: 12, padding: 14, fontSize: 14, color: T.dark },
  categRow:         { marginBottom: 4 },
  categPill:        { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: T.border, backgroundColor: T.card, marginRight: 8 },
  categPillActive:  { backgroundColor: T.green, borderColor: T.green },
  categPillText:    { fontSize: 12, color: T.body, fontWeight: '600' },
  categPillTextActive: { color: '#FFF' },
  charRow:          { flexDirection: 'row', gap: 8, marginBottom: 8 },
  charAddBtn:       { width: 48, height: 48, borderRadius: 12, backgroundColor: T.green, alignItems: 'center', justifyContent: 'center' },
  charAddText:      { fontSize: 24, color: '#FFF', lineHeight: 28 },
  charItem:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: T.card, borderRadius: 10, padding: 10, marginBottom: 6, borderWidth: 1, borderColor: T.border },
  charItemText:     { fontSize: 13, color: T.body, flex: 1 },
  charRemove:       { fontSize: 14, color: T.muted, padding: 4 },
  saveBtn:          { backgroundColor: T.green, borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 24 },
  saveBtnText:      { fontSize: 15, fontWeight: '900', color: '#FFF' },
});
