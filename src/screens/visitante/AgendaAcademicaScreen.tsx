import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const T = {
  bg: '#F9F3E3', card: '#FFFDF8', parchment: '#F5EDD0',
  dark: '#2C1A0E', body: '#5C3520', muted: '#9B7B5A',
  amber: '#C8960C', amberPale: '#FBF0C8', amberDark: '#8B6308',
  border: '#EDD9A8',
};

type OrgKey = 'todos' | 'cortolima' | 'comite' | 'universidad' | 'gobernacion';

interface Docente { nombre: string; titulo: string; institucion: string; especialidad: string; emoji: string }
interface Taller {
  id: string; organizador: OrgKey; dia: string; hora: string; duracion: string;
  titulo: string; objetivo: string; lugar: string; capacidad: number;
  modalidad: string; docentes: Docente[]; sponsor: string; sponsorEmoji: string; color: string;
}

const TALLERES: Taller[] = [
  {
    id: 't1', organizador: 'cortolima', dia: 'Jue 29 May', hora: '08:00 AM', duracion: '3 horas',
    titulo: 'Conservación de Ecosistemas Cafeteros y Cambio Climático',
    objetivo: 'Capacitar a caficultores en estrategias de adaptación al cambio climático, conservación de microcuencas y biodiversidad en zonas cafeteras del Tolima.',
    lugar: 'Salón Verde – Pabellón Ambiental', capacidad: 60, modalidad: 'Teórico-Práctico',
    docentes: [
      { nombre: 'Ing. Carlos Patiño Ríos', titulo: 'Ingeniero Ambiental MSc', institucion: 'Cortolima', especialidad: 'Cambio climático y caficultura sostenible', emoji: '🌿' },
      { nombre: 'Dra. Luz Marina Sánchez', titulo: 'Bióloga PhD', institucion: 'U. del Tolima', especialidad: 'Biodiversidad en agroecosistemas', emoji: '🦋' },
    ],
    sponsor: 'Gobernación del Tolima', sponsorEmoji: '🏛️', color: '#2E7D32',
  },
  {
    id: 't2', organizador: 'cortolima', dia: 'Vie 30 May', hora: '02:00 PM', duracion: '2 horas',
    titulo: 'Caficultura Sostenible y Certificaciones Ambientales',
    objetivo: 'Presentar los requisitos y beneficios de las certificaciones Rainforest Alliance, UTZ y orgánicas para productores cafeteros del sur del Tolima.',
    lugar: 'Auditorio Principal – Bloque B', capacidad: 80, modalidad: 'Conferencia',
    docentes: [
      { nombre: 'Ing. Adriana Gómez Torres', titulo: 'Especialista en Certificaciones', institucion: 'Cortolima', especialidad: 'Rainforest Alliance y UTZ', emoji: '🏅' },
    ],
    sponsor: 'Comité de Cafeteros del Tolima', sponsorEmoji: '☕', color: '#2E7D32',
  },
  {
    id: 't3', organizador: 'comite', dia: 'Jue 29 May', hora: '10:00 AM', duracion: '4 horas',
    titulo: 'Beneficio y Calidad del Café: Del Cereza a la Taza',
    objetivo: 'Enseñar las buenas prácticas de beneficio húmedo y seco para maximizar la calidad del grano. Incluye práctica en estación de beneficio del stand del Comité.',
    lugar: 'Estación Demostrativa – Área Central', capacidad: 40, modalidad: 'Teórico-Práctico',
    docentes: [
      { nombre: 'Téc. Miguel Ángel Ospina', titulo: 'Técnico en Caficultura', institucion: 'Comité de Cafeteros Tolima', especialidad: 'Beneficio húmedo y calidad', emoji: '☕' },
      { nombre: 'Barista Juan Diego Arce', titulo: 'Q-Grader Certificado', institucion: 'Comité de Cafeteros', especialidad: 'Análisis sensorial y catación', emoji: '🎯' },
    ],
    sponsor: 'Federación Nacional de Cafeteros', sponsorEmoji: '🌿', color: '#B8860B',
  },
  {
    id: 't4', organizador: 'comite', dia: 'Sáb 31 May', hora: '09:00 AM', duracion: '3 horas',
    titulo: 'Introducción a la Catación de Café: Metodología SCA',
    objetivo: 'Introducir a los asistentes en la metodología estándar de catación SCA, identificación de defectos y descripción de perfiles sensoriales.',
    lugar: 'Sala de Catación – Stand Comité', capacidad: 25, modalidad: 'Taller Sensorial',
    docentes: [
      { nombre: 'Q-Grader Nathalia Ramos', titulo: 'Q-Grader Internacional', institucion: 'Comité de Cafeteros', especialidad: 'Protocolo SCA y análisis sensorial', emoji: '🏅' },
    ],
    sponsor: 'Comité de Cafeteros del Tolima', sponsorEmoji: '☕', color: '#B8860B',
  },
  {
    id: 't5', organizador: 'universidad', dia: 'Jue 29 May', hora: '03:00 PM', duracion: '2 horas',
    titulo: 'Innovación Tecnológica en la Cadena de Valor del Café',
    objetivo: 'Presentar los avances de investigación de la U. del Tolima en variedades mejoradas, biotecnología aplicada al café y herramientas de agricultura de precisión.',
    lugar: 'Sala de Innovación – Pabellón Académico', capacidad: 70, modalidad: 'Conferencia',
    docentes: [
      { nombre: 'Dr. Hernán Durán López', titulo: 'PhD Ciencias Agrarias', institucion: 'Universidad del Tolima', especialidad: 'Biotecnología y genómica del café', emoji: '🧬' },
      { nombre: 'MSc. Claudia Villamizar', titulo: 'Magíster en Agronomía', institucion: 'Universidad del Tolima', especialidad: 'Agricultura de precisión y drones', emoji: '🚁' },
    ],
    sponsor: 'Ministerio de Ciencia, Tecnología e Innovación', sponsorEmoji: '🔬', color: '#6A1B9A',
  },
  {
    id: 't6', organizador: 'universidad', dia: 'Vie 30 May', hora: '10:00 AM', duracion: '3 horas',
    titulo: 'Emprendimiento Cafetero: De la Finca al Mercado Global',
    objetivo: 'Brindar herramientas de emprendimiento y comercialización a jóvenes caficultores. Casos de éxito de exportación directa desde el Tolima.',
    lugar: 'Auditorio Universitario – Bloque A', capacidad: 90, modalidad: 'Taller',
    docentes: [
      { nombre: 'MBA. Ricardo Forero Soto', titulo: 'MBA en Negocios Internacionales', institucion: 'Universidad del Tolima', especialidad: 'Comercio exterior y exportaciones de café', emoji: '🌍' },
    ],
    sponsor: 'Cámara de Comercio del Tolima', sponsorEmoji: '💼', color: '#6A1B9A',
  },
  {
    id: 't7', organizador: 'gobernacion', dia: 'Vie 30 May', hora: '04:00 PM', duracion: '2 horas',
    titulo: 'Plan Departamental de Caficultura Tolima 2024–2030',
    objetivo: 'Socializar la política pública caficultura del Tolima, los programas de financiamiento rural, acceso a mercados y planes de inversión del departamento para el sector.',
    lugar: 'Gran Auditorio – Sede Principal', capacidad: 150, modalidad: 'Conferencia Magistral',
    docentes: [
      { nombre: 'Dra. Adriana Magali Matiz', titulo: 'Gobernadora del Tolima', institucion: 'Gobernación del Tolima', especialidad: 'Política pública y desarrollo rural cafetero', emoji: '🏛️' },
      { nombre: 'Sec. Juan Pablo Ramos', titulo: 'Secretario de Agricultura', institucion: 'Gobernación del Tolima', especialidad: 'Fomento agropecuario y caficultura', emoji: '🌾' },
    ],
    sponsor: 'Gobernación del Tolima', sponsorEmoji: '🏛️', color: '#1A237E',
  },
  {
    id: 't8', organizador: 'gobernacion', dia: 'Sáb 31 May', hora: '11:00 AM', duracion: '2.5 horas',
    titulo: 'Ruta del Café Tolimense: Turismo Rural y Economía Naranja',
    objetivo: 'Presentar la Ruta del Café del Tolima como producto turístico de clase mundial. Articulación entre caficultores, alcaldías y operadores turísticos.',
    lugar: 'Sala de Turismo – Pabellón Cultural', capacidad: 80, modalidad: 'Taller Participativo',
    docentes: [
      { nombre: 'Lic. Patricia Muñoz Castro', titulo: 'Especialista en Turismo Rural', institucion: 'ProColombia - Gobernación', especialidad: 'Turismo cafetero y economía naranja', emoji: '🗺️' },
    ],
    sponsor: 'Alcaldía de Chaparral + ProColombia', sponsorEmoji: '🌟', color: '#1A237E',
  },
];

const ORG_CONFIG: Record<OrgKey, { label: string; emoji: string; color: string; gradient: [string, string]; desc: string }> = {
  todos:       { label: 'Todos',             emoji: '📚', color: '#5C3520', gradient: ['#2C1A0E','#5C3520'], desc: '' },
  cortolima:   { label: 'Cortolima',         emoji: '🌿', color: '#2E7D32', gradient: ['#1B5E20','#388E3C'], desc: 'Corporación Autónoma Regional del Tolima' },
  comite:      { label: 'Comité Cafeteros',  emoji: '☕', color: '#B8860B', gradient: ['#8B6308','#C8960C'], desc: 'Comité Departamental de Cafeteros del Tolima' },
  universidad: { label: 'U. del Tolima',     emoji: '🎓', color: '#6A1B9A', gradient: ['#4A148C','#7B1FA2'], desc: 'Universidad del Tolima' },
  gobernacion: { label: 'Gobernación',       emoji: '🏛️', color: '#1A237E', gradient: ['#0D47A1','#1565C0'], desc: 'Gobernación del Tolima' },
};

const ORG_KEYS: OrgKey[] = ['todos', 'cortolima', 'comite', 'universidad', 'gobernacion'];

export default function AgendaAcademicaScreen() {
  const { t } = useTranslation();
  const nav = useNavigation();
  const [org, setOrg] = useState<OrgKey>('todos');
  const [expanded, setExpanded] = useState<string | null>(null);

  const list = org === 'todos' ? TALLERES : TALLERES.filter(t => t.organizador === org);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#2C1A0E" />

      {/* Header */}
      <LinearGradient colors={['#2C1A0E', '#5C3520', '#8B4A22']} style={s.headerGrad}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>{t('agenda_academica.title', 'AGENDA ACADÉMICA')}</Text>
          <Text style={s.headerSub}>{t('agenda_academica.subtitle', 'Talleres y Conferencias · Chaparral 2026')}</Text>
        </View>
        <View style={s.headerBadge}>
          <Text style={s.headerBadgeNum}>{TALLERES.length}</Text>
          <Text style={s.headerBadgeLbl}>{t('agenda_academica.workshops', 'talleres')}</Text>
        </View>
      </LinearGradient>

      {/* Org filter tabs */}
      <View style={s.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabsScroll}>
          {ORG_KEYS.map(key => {
            const cfg = ORG_CONFIG[key];
            return (
              <TouchableOpacity
                key={key}
                style={[s.tab, org === key && { backgroundColor: cfg.color }]}
                onPress={() => setOrg(key)}
              >
                <Text style={s.tabEmoji}>{cfg.emoji}</Text>
                <Text style={[s.tabLabel, org === key && s.tabLabelActive]}>{cfg.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Org description */}
      {org !== 'todos' && (
        <View style={[s.orgBanner, { backgroundColor: ORG_CONFIG[org].color + '18', borderColor: ORG_CONFIG[org].color + '40' }]}>
          <Text style={s.orgBannerEmoji}>{ORG_CONFIG[org].emoji}</Text>
          <Text style={[s.orgBannerText, { color: ORG_CONFIG[org].color }]}>{ORG_CONFIG[org].desc}</Text>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Text style={s.resultsLabel}>{list.length} {t('agenda_academica.sessions', 'sesiones académicas')}</Text>

        {list.map(taller => {
          const cfg = ORG_CONFIG[taller.organizador];
          const isExp = expanded === taller.id;
          return (
            <TouchableOpacity
              key={taller.id}
              style={[s.tallerCard, { borderTopColor: cfg.color }]}
              onPress={() => setExpanded(isExp ? null : taller.id)}
              activeOpacity={0.85}
            >
              {/* Org badge + time */}
              <View style={s.tallerTop}>
                <View style={[s.orgChip, { backgroundColor: cfg.color }]}>
                  <Text style={s.orgChipEmoji}>{cfg.emoji}</Text>
                  <Text style={s.orgChipText}>{cfg.label}</Text>
                </View>
                <View style={s.timeChip}>
                  <Text style={s.timeDay}>{taller.dia}</Text>
                  <Text style={s.timeHour}>{taller.hora}</Text>
                </View>
              </View>

              {/* Title + objective preview */}
              <Text style={s.tallerTitle}>{taller.titulo}</Text>
              {!isExp && (
                <Text style={s.tallerObjPreview} numberOfLines={2}>{taller.objetivo}</Text>
              )}

              {/* Meta chips */}
              <View style={s.metaRow}>
                <View style={s.metaChip}><Text style={s.metaChipText}>⏱ {taller.duracion}</Text></View>
                <View style={s.metaChip}><Text style={s.metaChipText}>👥 {taller.capacidad} personas</Text></View>
                <View style={s.metaChip}><Text style={s.metaChipText}>📐 {taller.modalidad}</Text></View>
              </View>

              {/* Expanded */}
              {isExp && (
                <View style={s.tallerDetail}>
                  <View style={s.divider} />

                  {/* Objective */}
                  <View style={s.objectiveBox}>
                    <Text style={s.objectiveLabel}>🎯 {t('agenda_academica.objective', 'OBJETIVO')}</Text>
                    <Text style={s.objectiveText}>{taller.objetivo}</Text>
                  </View>

                  {/* Venue */}
                  <View style={s.venueRow}>
                    <Text style={s.venueIcon}>📍</Text>
                    <Text style={s.venueText}>{taller.lugar}</Text>
                  </View>

                  {/* Docentes */}
                  <Text style={s.docentesTitle}>{t('agenda_academica.teachers', 'PONENTES')}</Text>
                  {taller.docentes.map((doc, i) => (
                    <View key={i} style={s.docenteCard}>
                      <View style={[s.docenteAvatar, { backgroundColor: cfg.color + '20', borderColor: cfg.color + '50' }]}>
                        <Text style={s.docenteAvatarEmoji}>{doc.emoji}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.docenteName}>{doc.nombre}</Text>
                        <Text style={s.docenteTitulo}>{doc.titulo}</Text>
                        <Text style={s.docenteInst}>🏛️ {doc.institucion}</Text>
                        <View style={[s.especialidadChip, { backgroundColor: cfg.color + '12', borderColor: cfg.color + '30' }]}>
                          <Text style={[s.especialidadText, { color: cfg.color }]}>✦ {doc.especialidad}</Text>
                        </View>
                      </View>
                    </View>
                  ))}

                  {/* Sponsor */}
                  <View style={[s.sponsorRow, { borderColor: cfg.color + '30' }]}>
                    <Text style={s.sponsorLabel}>{t('agenda_academica.sponsor', 'PATROCINADOR')}</Text>
                    <Text style={s.sponsorEmoji}>{taller.sponsorEmoji}</Text>
                    <Text style={[s.sponsorName, { color: cfg.color }]}>{taller.sponsor}</Text>
                  </View>
                </View>
              )}

              <Text style={[s.expandHint, { color: cfg.color }]}>
                {isExp ? '↑ Menos' : '↓ Ver detalle completo'}
              </Text>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: T.bg },
  headerGrad:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 18, gap: 10 },
  backBtn:         { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backIcon:        { fontSize: 26, color: '#FFF', lineHeight: 30, fontWeight: '300' },
  headerTitle:     { fontSize: 14, fontWeight: '900', color: '#FFF', letterSpacing: 1.5 },
  headerSub:       { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  headerBadge:     { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  headerBadgeNum:  { fontSize: 20, fontWeight: '900', color: '#FFF' },
  headerBadgeLbl:  { fontSize: 8, color: 'rgba(255,255,255,0.7)', fontWeight: '700' },
  tabsWrap:        { backgroundColor: T.parchment, borderBottomWidth: 1, borderBottomColor: T.border },
  tabsScroll:      { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  tab:             { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: T.card, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1.5, borderColor: T.border },
  tabEmoji:        { fontSize: 13 },
  tabLabel:        { fontSize: 11, fontWeight: '700', color: T.body },
  tabLabelActive:  { color: '#FFF' },
  orgBanner:       { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1 },
  orgBannerEmoji:  { fontSize: 16 },
  orgBannerText:   { fontSize: 12, fontWeight: '700' },
  scroll:          { padding: 14 },
  resultsLabel:    { fontSize: 10, fontWeight: '700', color: T.muted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  tallerCard:      { backgroundColor: T.card, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: T.border, borderTopWidth: 4, padding: 14, shadowColor: T.dark, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  tallerTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orgChip:         { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  orgChipEmoji:    { fontSize: 12 },
  orgChipText:     { fontSize: 10, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
  timeChip:        { alignItems: 'flex-end' },
  timeDay:         { fontSize: 9, fontWeight: '700', color: T.muted },
  timeHour:        { fontSize: 14, fontWeight: '900', color: T.amber },
  tallerTitle:     { fontSize: 14, fontWeight: '900', color: T.dark, lineHeight: 20, marginBottom: 6 },
  tallerObjPreview:{ fontSize: 12, color: T.muted, lineHeight: 17, marginBottom: 8 },
  metaRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  metaChip:        { backgroundColor: T.parchment, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: T.border },
  metaChipText:    { fontSize: 9, fontWeight: '700', color: T.body },
  tallerDetail:    { marginTop: 4 },
  divider:         { height: 1, backgroundColor: T.border, marginVertical: 12 },
  objectiveBox:    { backgroundColor: T.parchment, borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: T.border },
  objectiveLabel:  { fontSize: 8, fontWeight: '900', color: T.amberDark, letterSpacing: 1.5, marginBottom: 6 },
  objectiveText:   { fontSize: 12, color: T.body, lineHeight: 18 },
  venueRow:        { flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginBottom: 14 },
  venueIcon:       { fontSize: 14, flexShrink: 0 },
  venueText:       { fontSize: 12, color: T.muted, flex: 1 },
  docentesTitle:   { fontSize: 9, fontWeight: '900', color: T.muted, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
  docenteCard:     { flexDirection: 'row', gap: 12, marginBottom: 10, backgroundColor: T.bg, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: T.border },
  docenteAvatar:   { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  docenteAvatarEmoji: { fontSize: 22 },
  docenteName:     { fontSize: 13, fontWeight: '900', color: T.dark, marginBottom: 2 },
  docenteTitulo:   { fontSize: 11, color: T.muted, marginBottom: 2 },
  docenteInst:     { fontSize: 10, color: T.body, marginBottom: 5 },
  especialidadChip:{ borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, alignSelf: 'flex-start' },
  especialidadText:{ fontSize: 10, fontWeight: '700' },
  sponsorRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 10 },
  sponsorLabel:    { fontSize: 8, fontWeight: '900', color: T.muted, letterSpacing: 1.5, flex: 0, marginRight: 2 },
  sponsorEmoji:    { fontSize: 16 },
  sponsorName:     { flex: 1, fontSize: 12, fontWeight: '800' },
  expandHint:      { fontSize: 11, fontWeight: '700', textAlign: 'right', marginTop: 8 },
});
