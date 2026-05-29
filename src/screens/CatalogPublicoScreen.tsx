import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';

const T = {
  bg:       '#FAF7F0',
  card:     '#FFFFFF',
  dark:     '#2C1810',
  body:     '#4A3728',
  muted:    '#8A7060',
  gold:     '#B8860B',
  goldPale: '#F5E6B0',
  green:    '#2D5A1E',
  greenPale:'#E8F2E4',
  border:   '#E8D5B0',
  leather:  '#8B5E3C',
};

const TODAS = 'Todas';
const CATEGORIAS_FILTRO = [TODAS, '☕ Café', '🫙 Procesados', '🎨 Artesanías', '🍽️ Gastronomía', '🌿 Aromáticas', '🎁 Kits', '📦 Otros'];

export default function CatalogPublicoScreen() {
  const nav = useNavigation();
  const { t } = useTranslation();
  const { state } = useApp();
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState(TODAS);

  const productos = state.catalogoProductos.filter(p => {
    const matchBusqueda =
      !busqueda ||
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.standNombre ?? '').toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = categoriaFiltro === TODAS || p.categoria === categoriaFiltro;
    return matchBusqueda && matchCategoria;
  });

  const disponibles = productos.filter(p => p.disponible);
  const agotados    = productos.filter(p => !p.disponible);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Text style={s.backIcon}>‹</Text>
          <Text style={s.backText}>{t('common.back', 'Volver')}</Text>
        </TouchableOpacity>
        <Text style={s.topTitle}>☕ {t('comprador.catalog', 'Catálogo')}</Text>
        <View style={{ width: 64 }} />
      </View>

      <View style={s.searchRow}>
        <TextInput
          style={s.searchInput}
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder={t('common.search', 'Buscar') + ' productos, stands...'}
          placeholderTextColor={T.muted}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContent}>
        {CATEGORIAS_FILTRO.map(c => (
          <TouchableOpacity
            key={c}
            style={[s.filterPill, categoriaFiltro === c && s.filterPillActive]}
            onPress={() => setCategoriaFiltro(c)}
          >
            <Text style={[s.filterPillText, categoriaFiltro === c && s.filterPillTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {state.catalogoProductos.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyEmoji}>🏪</Text>
            <Text style={s.emptyTitle}>Catálogo en preparación</Text>
            <Text style={s.emptySub}>Los expositores están cargando sus productos. ¡Vuelve pronto!</Text>
          </View>
        ) : productos.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyEmoji}>🔍</Text>
            <Text style={s.emptyTitle}>Sin resultados</Text>
            <Text style={s.emptySub}>Prueba con otro término de búsqueda o categoría.</Text>
          </View>
        ) : (
          <>
            <View style={s.sectionHeader}>
              <View style={s.sectionLine} />
              <Text style={s.sectionLabel}>DISPONIBLES ({disponibles.length})</Text>
              <View style={s.sectionLine} />
            </View>

            {disponibles.map(prod => (
              <ProductCard key={prod.id} prod={prod} />
            ))}

            {agotados.length > 0 && (
              <>
                <View style={[s.sectionHeader, { marginTop: 8 }]}>
                  <View style={s.sectionLine} />
                  <Text style={[s.sectionLabel, { color: T.muted }]}>AGOTADOS ({agotados.length})</Text>
                  <View style={s.sectionLine} />
                </View>
                {agotados.map(prod => (
                  <ProductCard key={prod.id} prod={prod} dimmed />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProductCard({ prod, dimmed }: { prod: any; dimmed?: boolean }) {
  return (
    <View style={[s.prodCard, dimmed && s.prodCardDimmed]}>
      <View style={s.prodHeader}>
        <View style={s.categBadge}>
          <Text style={s.categText}>{prod.categoria}</Text>
        </View>
        {!prod.disponible && (
          <View style={s.agotadoBadge}>
            <Text style={s.agotadoText}>Agotado</Text>
          </View>
        )}
      </View>

      <Text style={s.prodNombre}>{prod.nombre}</Text>
      <Text style={s.prodPrecio}>{prod.precio}</Text>

      {prod.standNombre && (
        <Text style={s.standLabel}>Stand: {prod.standNombre}</Text>
      )}

      {prod.descripcion ? (
        <Text style={s.prodDesc}>{prod.descripcion}</Text>
      ) : null}

      {prod.caracteristicas?.length > 0 && (
        <View style={s.charsList}>
          {prod.caracteristicas.map((c: string, i: number) => (
            <View key={i} style={s.charPill}>
              <Text style={s.charText}>• {c}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: T.bg },
  topBar:          { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: T.border },
  backBtn:         { flexDirection: 'row', alignItems: 'center', gap: 2, width: 64 },
  backIcon:        { fontSize: 28, color: T.leather, lineHeight: 32, fontWeight: '300' },
  backText:        { fontSize: 15, color: T.leather, fontWeight: '600' },
  topTitle:        { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '900', color: T.dark },
  searchRow:       { paddingHorizontal: 16, paddingVertical: 10 },
  searchInput:     { backgroundColor: T.card, borderWidth: 1, borderColor: T.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11, fontSize: 14, color: T.dark },
  filterScroll:    { borderBottomWidth: 1, borderBottomColor: T.border },
  filterContent:   { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  filterPill:      { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: T.border, backgroundColor: T.card },
  filterPillActive:{ backgroundColor: T.leather, borderColor: T.leather },
  filterPillText:  { fontSize: 12, color: T.muted, fontWeight: '600' },
  filterPillTextActive: { color: '#FFF' },
  scroll:          { padding: 16, paddingBottom: 40 },
  emptyState:      { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 },
  emptyEmoji:      { fontSize: 60, marginBottom: 16 },
  emptyTitle:      { fontSize: 20, fontWeight: '900', color: T.dark, marginBottom: 8 },
  emptySub:        { fontSize: 13, color: T.muted, textAlign: 'center', lineHeight: 20 },
  sectionHeader:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionLine:     { flex: 1, height: 1, backgroundColor: T.border },
  sectionLabel:    { fontSize: 9, fontWeight: '900', color: T.gold, letterSpacing: 2 },
  prodCard:        { backgroundColor: T.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: T.border, shadowColor: T.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  prodCardDimmed:  { opacity: 0.55 },
  prodHeader:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  categBadge:      { backgroundColor: T.greenPale, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  categText:       { fontSize: 11, color: T.green, fontWeight: '700' },
  agotadoBadge:    { backgroundColor: '#FFF0F0', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#C0392B30' },
  agotadoText:     { fontSize: 11, color: '#C0392B', fontWeight: '700' },
  prodNombre:      { fontSize: 17, fontWeight: '900', color: T.dark, marginBottom: 3 },
  prodPrecio:      { fontSize: 15, fontWeight: '800', color: T.gold, marginBottom: 4 },
  standLabel:      { fontSize: 11, color: T.muted, marginBottom: 6, fontStyle: 'italic' },
  prodDesc:        { fontSize: 13, color: T.body, lineHeight: 18, marginBottom: 8 },
  charsList:       { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  charPill:        { backgroundColor: T.bg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: T.border },
  charText:        { fontSize: 11, color: T.body },
});
