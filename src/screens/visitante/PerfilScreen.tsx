import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, Platform,
  SafeAreaView, StatusBar, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';

// ── Platform shadow helpers ──────────────────────────────────────────────────
const sh = (h: number, r: number, op: number, el: number) =>
  Platform.select({
    web:     { boxShadow: `0px ${h}px ${r}px rgba(0,0,0,${op})` } as any,
    default: { shadowColor: '#000', shadowOffset: { width: 0, height: h }, shadowOpacity: op, shadowRadius: r, elevation: el },
  }) ?? {};

// ── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg:        '#F9F3E3',
  card:      '#FFFDF8',
  parchment: '#F5EDD0',
  dark:      '#2C1A0E',
  coffee:    '#7B4A2A',
  coffeeDk:  '#4A2010',
  amber:     '#C8960C',
  amberDk:   '#8B6308',
  border:    '#EDD9A8',
  borderMd:  '#D4B886',
  muted:     '#9B7B5A',
};

const NIVEL_COLORS: Record<string, string> = {
  'Modo Cafetero':         '#8B4513',
  'Catador Nómada':        '#C0892A',
  'Sommelier del Tolima':  '#B8860B',
  'Embajador del Café':    '#DAA520',
};

export default function PerfilScreen() {
  const { t } = useTranslation();
  const nav = useNavigation();
  const { state, dispatch } = useApp();

  const usuario      = state.usuario;
  const puntos       = usuario?.puntos ?? 0;
  const stampsCount  = usuario?.sellos?.length ?? 0;
  const displayName  = usuario?.nombre ?? t('perfil.default_name', 'Cafetero');
  const passportId   = `CF26-${(usuario?.cedula || '00000000').toUpperCase()}`;
  const nivelColor   = NIVEL_COLORS[usuario?.nivel ?? ''] ?? T.amberDk;

  // ── Photo upload (web) ────────────────────────────────────────────────────
  const handlePhotoChange = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type  = 'file';
      input.accept = 'image/*';
      (input as any).onchange = (e: any) => {
        const file = e.target?.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          if (dataUrl) dispatch({ type: 'UPDATE_FOTO', payload: dataUrl });
        };
        reader.readAsDataURL(file);
      };
      input.click();
    } else {
      Alert.alert(t('perfil.photo_native_msg', 'Usa la cámara desde el menú de ajustes del dispositivo.'));
    }
  };

  // ── Download as PNG (web canvas) ─────────────────────────────────────────
  const downloadPassportImage = () => {
    if (Platform.OS !== 'web') return;
    const W = 1080, H = 1920;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    // Background parchment gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0,   '#F7EECE');
    bg.addColorStop(0.5, '#EDD89E');
    bg.addColorStop(1,   '#D4BA6E');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Outer gold border
    ctx.strokeStyle = '#C47408'; ctx.lineWidth = 14;
    ctx.strokeRect(26, 26, W - 52, H - 52);
    ctx.strokeStyle = '#E89010'; ctx.lineWidth = 3;
    ctx.strokeRect(46, 46, W - 92, H - 92);

    // Header area background
    const headerBg = ctx.createLinearGradient(0, 60, 0, 320);
    headerBg.addColorStop(0, 'rgba(58,28,8,0.06)');
    headerBg.addColorStop(1, 'rgba(200,150,12,0.08)');
    ctx.fillStyle = headerBg;
    ctx.fillRect(60, 60, W - 120, 260);

    // Title
    ctx.fillStyle = '#3A1C08';
    ctx.font = 'bold 58px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('PASAPORTE CAFETERO', W / 2, 170);

    // Subtitle
    ctx.fillStyle = '#8B6308';
    ctx.font = '500 32px Georgia, serif';
    ctx.fillText('Feria Internacional del Café', W / 2, 228);
    ctx.font = '500 28px Georgia, serif';
    ctx.fillText('Chaparral · Tolima · Colombia · 2026', W / 2, 274);

    // Divider
    ctx.strokeStyle = '#C47408'; ctx.lineWidth = 3;
    const drawDivider = (y: number) => {
      ctx.beginPath(); ctx.moveTo(100, y); ctx.lineTo(W - 100, y); ctx.stroke();
    };
    drawDivider(305);

    // Avatar circle
    ctx.fillStyle = '#D4B886';
    ctx.beginPath();
    ctx.arc(W / 2, 480, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#C47408'; ctx.lineWidth = 8; ctx.stroke();

    // Load and draw avatar if available, otherwise initials
    const drawNameSection = () => {
      ctx.fillStyle = '#2C1A0E';
      ctx.font = 'bold 68px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(displayName.toUpperCase(), W / 2, 720);

      ctx.fillStyle = '#8B6308';
      ctx.font = '500 38px Georgia, serif';
      ctx.fillText(passportId, W / 2, 784);

      if (usuario?.nivel) {
        ctx.fillStyle = nivelColor;
        ctx.font = 'bold 30px Georgia, serif';
        ctx.fillText(`✦ ${usuario.nivel.toUpperCase()} ✦`, W / 2, 840);
      }

      drawDivider(875);

      // Stats row
      const stats = [
        { val: puntos.toString(),         lbl: 'PUNTOS'     },
        { val: stampsCount.toString(),     lbl: 'SELLOS'     },
        { val: `${stampsCount}/38`,        lbl: 'MUNICIPIOS' },
      ];
      stats.forEach((s, i) => {
        const x = 200 + i * 340;
        ctx.fillStyle = '#8B6308';
        ctx.font = 'bold 76px Georgia, serif';
        ctx.fillText(s.val, x, 980);
        ctx.fillStyle = '#9B7B5A';
        ctx.font = '500 26px Georgia, serif';
        ctx.fillText(s.lbl, x, 1028);
      });

      drawDivider(1065);

      // Stamps title
      ctx.fillStyle = '#3A1C08';
      ctx.font = 'bold 34px Georgia, serif';
      ctx.fillText('MUNICIPIOS CAFETEROS VISITADOS', W / 2, 1120);

      // Stamp grid (38 dots, 6 per row)
      const cols = 6, dotR = 28, gapX = 130, gapY = 100;
      const startX = W / 2 - ((cols - 1) * gapX) / 2;
      for (let i = 0; i < 38; i++) {
        const col = i % cols, row = Math.floor(i / cols);
        const cx = startX + col * gapX;
        const cy = 1185 + row * gapY;
        ctx.fillStyle = i < stampsCount ? '#C47408' : 'rgba(196,116,8,0.15)';
        ctx.beginPath(); ctx.arc(cx, cy, dotR, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#C47408'; ctx.lineWidth = 2; ctx.stroke();
        if (i < stampsCount) {
          ctx.fillStyle = '#FFF8E0';
          ctx.font = 'bold 24px Georgia, serif';
          ctx.fillText('☕', cx, cy + 9);
        }
      }

      drawDivider(1810);
      ctx.fillStyle = '#9B7B5A';
      ctx.font = '28px Georgia, serif';
      ctx.fillText('Tolima Corazón Cafetero de Colombia', W / 2, 1858);
      ctx.fillText('www.feriacafechaparral.gov.co', W / 2, 1898);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pasaporte-cafetero-${displayName.replace(/\s+/g, '-').toLowerCase()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }, 'image/png');
    };

    if (usuario?.fotoPerfil) {
      const img = new window.Image();
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(W / 2, 480, 145, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, W / 2 - 145, 480 - 145, 290, 290);
        ctx.restore();
        drawNameSection();
      };
      img.onerror = drawNameSection;
      img.src = usuario.fotoPerfil;
    } else {
      ctx.fillStyle = '#8B6308';
      ctx.font = 'bold 120px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(displayName.charAt(0).toUpperCase(), W / 2, 540);
      drawNameSection();
    }
  };

  // ── Download as PDF (HTML print window) ──────────────────────────────────
  const downloadPassportPDF = () => {
    if (Platform.OS !== 'web') return;
    const stampDots = Array.from({ length: 38 }, (_, i) =>
      `<div class="stamp ${i < stampsCount ? 'earned' : 'empty'}">${i < stampsCount ? '☕' : ''}</div>`
    ).join('');

    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<title>Pasaporte Cafetero — ${displayName}</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { background: linear-gradient(160deg,#F7EECE 0%,#EDD89E 50%,#D4BA6E 100%);
  min-height:100vh; display:flex; justify-content:center; align-items:center;
  font-family:Georgia,'Times New Roman',serif; padding:20px; }
.passport { width:600px; padding:36px;
  border:3px solid #C47408;
  box-shadow: inset 0 0 0 8px #F7EECE, inset 0 0 0 11px #C47408, 0 20px 60px rgba(58,28,8,0.35);
  background:linear-gradient(160deg,#F7EECE 0%,#EDD89E 100%); page-break-after:always; }
.header { text-align:center; margin-bottom:20px; }
.title { font-size:30px; font-weight:900; color:#3A1C08; letter-spacing:3px; text-transform:uppercase; }
.subtitle { font-size:11px; color:#8B6308; letter-spacing:3px; margin:8px 0 0; text-transform:uppercase; }
.divider { height:2px; background:linear-gradient(90deg,transparent,#C47408,transparent); margin:16px 0; }
.avatar-wrap { display:flex; justify-content:center; margin:12px 0; }
.avatar { width:110px; height:110px; border-radius:50%; border:4px solid #C47408;
  background:#D4B886; overflow:hidden; display:flex; align-items:center; justify-content:center;
  font-size:48px; color:#8B6308; font-weight:900; }
.avatar img { width:100%; height:100%; object-fit:cover; }
.name { font-size:24px; font-weight:900; color:#2C1A0E; text-align:center; text-transform:uppercase; letter-spacing:1px; }
.passport-id { font-size:11px; color:#8B6308; text-align:center; letter-spacing:4px; margin:6px 0; }
.nivel-badge { display:inline-block; background:#8B6308; color:#FFF8E0; font-size:10px;
  font-weight:700; letter-spacing:1px; padding:4px 14px; border-radius:20px; margin:4px auto; }
.level-wrap { text-align:center; margin:6px 0 16px; }
.stats { display:flex; border:1.5px solid #D4B886; border-radius:12px; overflow:hidden; margin:16px 0; }
.stat { flex:1; text-align:center; padding:12px 8px; background:rgba(255,255,255,0.3); }
.stat:not(:last-child) { border-right:1px solid #D4B886; }
.stat-val { font-size:28px; font-weight:900; color:#8B6308; }
.stat-lbl { font-size:8px; color:#9B7B5A; letter-spacing:2px; text-transform:uppercase; margin-top:2px; }
.stamps-title { font-size:9px; font-weight:700; color:#8B6308; letter-spacing:3px; text-transform:uppercase; text-align:center; margin:16px 0 10px; }
.stamps { display:flex; flex-wrap:wrap; gap:5px; justify-content:center; margin-bottom:20px; }
.stamp { width:34px; height:34px; border-radius:50%; border:2px solid #C47408;
  display:flex; align-items:center; justify-content:center; font-size:13px; }
.stamp.earned { background:#C47408; color:#FFF; }
.stamp.empty  { background:rgba(196,116,8,0.08); }
.footer { text-align:center; font-size:9px; color:#9B7B5A; padding-top:14px; border-top:1px solid #D4B886; line-height:1.6; }
@media print { body { background:none; padding:0; } .passport { width:100%; box-shadow:none; } }
</style></head>
<body><div class="passport">
  <div class="header">
    <div class="title">Pasaporte Cafetero</div>
    <div class="subtitle">Feria Internacional del Café · Chaparral 2026</div>
    <div class="divider"></div>
    <div class="avatar-wrap">
      <div class="avatar">${usuario?.fotoPerfil ? `<img src="${usuario.fotoPerfil}">` : displayName.charAt(0).toUpperCase()}</div>
    </div>
    <div class="name">${displayName}</div>
    <div class="passport-id">${passportId}</div>
    ${usuario?.nivel ? `<div class="level-wrap"><span class="nivel-badge">✦ ${usuario.nivel}</span></div>` : ''}
  </div>
  <div class="divider"></div>
  <div class="stats">
    <div class="stat"><div class="stat-val">${puntos}</div><div class="stat-lbl">Puntos</div></div>
    <div class="stat"><div class="stat-val">${stampsCount}</div><div class="stat-lbl">Sellos</div></div>
    <div class="stat"><div class="stat-val">${stampsCount}/38</div><div class="stat-lbl">Municipios</div></div>
  </div>
  <div class="stamps-title">Municipios Cafeteros Visitados</div>
  <div class="stamps">${stampDots}</div>
  <div class="footer">
    <strong>Tolima Corazón Cafetero de Colombia</strong><br>
    Este pasaporte certifica tu participación en la Feria Internacional del Café Chaparral 2026
  </div>
</div>
<script>setTimeout(()=>window.print(),400);</script>
</body></html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => nav.goBack()} style={s.backBtn} activeOpacity={0.7}>
            <Text style={s.backText}>‹ {t('common.back', 'Volver')}</Text>
          </TouchableOpacity>
          <Text style={s.pageTitle}>{t('perfil.title', 'MI PERFIL')}</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Avatar section */}
        <View style={s.avatarCard}>
          <LinearGradient colors={['#F0DFB0', T.parchment, '#EDD89E']} style={StyleSheet.absoluteFill} />
          {/* Decorative corner lines */}
          <View style={[s.corner, { top: 10, left: 10, borderTopWidth: 2, borderLeftWidth: 2 }]} />
          <View style={[s.corner, { top: 10, right: 10, borderTopWidth: 2, borderRightWidth: 2 }]} />
          <View style={[s.corner, { bottom: 10, left: 10, borderBottomWidth: 2, borderLeftWidth: 2 }]} />
          <View style={[s.corner, { bottom: 10, right: 10, borderBottomWidth: 2, borderRightWidth: 2 }]} />

          <View style={s.avatarRing}>
            {usuario?.fotoPerfil ? (
              <Image source={{ uri: usuario.fotoPerfil }} style={s.avatarImg} />
            ) : (
              <LinearGradient colors={['#D4A520', '#8B6308']} style={s.avatarFallback}>
                <Text style={s.avatarInitial}>{displayName.charAt(0).toUpperCase()}</Text>
              </LinearGradient>
            )}
          </View>

          <TouchableOpacity style={s.changePhotoBtn} onPress={handlePhotoChange} activeOpacity={0.8}>
            <Text style={s.changePhotoTxt}>{t('perfil.change_photo', '📷  Cambiar foto')}</Text>
          </TouchableOpacity>

          <Text style={s.profileName}>{displayName.toUpperCase()}</Text>
          <Text style={s.profileId}>{passportId}</Text>
          {usuario?.nivel ? (
            <View style={[s.nivelBadge, { backgroundColor: nivelColor }]}>
              <Text style={s.nivelBadgeTxt}>✦  {usuario.nivel}</Text>
            </View>
          ) : null}
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          <LinearGradient colors={[T.card, T.parchment]} style={StyleSheet.absoluteFill} />
          {[
            { lbl: t('common.points', 'PUNTOS'),   val: puntos,                   color: T.amberDk },
            { lbl: t('common.stamps', 'SELLOS'),   val: stampsCount,              color: T.coffee  },
            { lbl: t('perfil.munis',  'MUNICIPIOS'), val: `${stampsCount}/38`,     color: T.dark    },
          ].map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={s.statsDivider} />}
              <View style={s.statCell}>
                <Text style={[s.statVal, { color: item.color }]}>{item.val}</Text>
                <Text style={s.statLbl}>{item.lbl}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Personal data */}
        <View style={s.infoCard}>
          <LinearGradient colors={[T.card, T.parchment]} style={StyleSheet.absoluteFill} />
          <Text style={s.cardLabel}>{t('perfil.personal_data', 'DATOS PERSONALES')}</Text>
          {[
            { k: t('perfil.name',        'Nombre'),     v: usuario?.nombre         ?? '—' },
            { k: t('perfil.cedula',      'Cédula'),     v: usuario?.cedula         ?? '—' },
            { k: t('perfil.country',     'País'),       v: usuario?.pais           ?? '—' },
            { k: t('perfil.municipality','Municipio'),  v: usuario?.municipio ?? usuario?.ciudad ?? '—' },
            { k: t('perfil.whatsapp',    'WhatsApp'),   v: usuario?.whatsapp       ?? '—' },
          ].map((row, i) => (
            <View key={i} style={[s.infoRow, i === 4 && { borderBottomWidth: 0 }]}>
              <Text style={s.infoKey}>{row.k}</Text>
              <Text style={s.infoVal} numberOfLines={1}>{row.v}</Text>
            </View>
          ))}
        </View>

        {/* Passport download card */}
        <View style={s.downloadCard}>
          <LinearGradient colors={['#2C1006', '#5C2E12', '#9B5A30']} style={StyleSheet.absoluteFill} />
          {/* Shimmer line decorations */}
          <View style={{ position: 'absolute', top: 28, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
          <View style={{ position: 'absolute', top: 30, left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,0,0,0.08)' }} />

          <Text style={s.dlTitle}>{t('perfil.passport_title', '✦  PASAPORTE CAFETERO')}</Text>
          <Text style={s.dlSub}>{t('perfil.passport_sub', 'Descarga y comparte tu pasaporte en redes sociales')}</Text>

          <View style={s.dlBtns}>
            <TouchableOpacity style={s.dlBtn} onPress={downloadPassportImage} activeOpacity={0.82}>
              <LinearGradient colors={['#E8C030', '#C8960C', '#9B7010']} style={StyleSheet.absoluteFill} />
              <Text style={s.dlBtnIco}>📸</Text>
              <Text style={s.dlBtnTxt}>{t('perfil.download_png', 'Imagen')}</Text>
              <Text style={s.dlBtnSub}>PNG · Instagram</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.dlBtn} onPress={downloadPassportPDF} activeOpacity={0.82}>
              <LinearGradient colors={['#9B5A30', '#7A3A18', '#5C2A0A']} style={StyleSheet.absoluteFill} />
              <Text style={s.dlBtnIco}>📄</Text>
              <Text style={s.dlBtnTxt}>{t('perfil.download_pdf', 'PDF')}</Text>
              <Text style={s.dlBtnSub}>Imprimible</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: T.bg },
  scroll: { padding: 18, paddingBottom: 44 },

  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  backBtn:   { width: 60, padding: 4 },
  backText:  { fontSize: 14, color: T.coffee, fontWeight: '700' },
  pageTitle: { fontSize: 10, fontWeight: '900', color: T.amberDk, letterSpacing: 2.5, textTransform: 'uppercase' },

  avatarCard:   { borderRadius: 24, overflow: 'hidden', borderWidth: 1.5, borderColor: T.borderMd, alignItems: 'center', padding: 24, marginBottom: 14, ...sh(4, 14, 0.12, 5) },
  corner:       { position: 'absolute', width: 14, height: 14, borderColor: '#C8960C' },
  avatarRing:   { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: T.amber, overflow: 'hidden', marginBottom: 14, ...sh(3, 10, 0.2, 4) },
  avatarImg:    { width: '100%', height: '100%' },
  avatarFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  avatarInitial:  { fontSize: 44, fontWeight: '900', color: '#FFF8E0' },
  changePhotoBtn: { backgroundColor: T.coffeeDk, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7, marginBottom: 14 },
  changePhotoTxt: { fontSize: 12, color: '#FFF', fontWeight: '700', letterSpacing: 0.5 },
  profileName: { fontSize: 21, fontWeight: '900', color: T.dark, letterSpacing: 0.5, textAlign: 'center', marginBottom: 3 },
  profileId:   { fontSize: 10, color: T.muted, letterSpacing: 3, textAlign: 'center', marginBottom: 6 },
  nivelBadge:  { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 },
  nivelBadgeTxt: { fontSize: 10, fontWeight: '900', color: '#FFF8E0', letterSpacing: 1 },

  statsRow:    { flexDirection: 'row', borderRadius: 20, overflow: 'hidden', borderWidth: 1.5, borderColor: T.borderMd, marginBottom: 14, paddingVertical: 16, ...sh(3, 10, 0.1, 4) },
  statCell:    { flex: 1, alignItems: 'center' },
  statsDivider:{ width: 1, backgroundColor: T.borderMd, marginVertical: 4 },
  statVal:     { fontSize: 26, fontWeight: '900' },
  statLbl:     { fontSize: 7, color: T.muted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700', marginTop: 2 },

  infoCard:  { borderRadius: 20, overflow: 'hidden', borderWidth: 1.5, borderColor: T.borderMd, padding: 18, marginBottom: 14, ...sh(3, 10, 0.08, 3) },
  cardLabel: { fontSize: 9, fontWeight: '900', color: T.amberDk, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 14 },
  infoRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: T.border },
  infoKey:   { fontSize: 12, color: T.muted, fontWeight: '600' },
  infoVal:   { fontSize: 12, color: T.dark, fontWeight: '700', maxWidth: '55%', textAlign: 'right' },

  downloadCard: { borderRadius: 20, overflow: 'hidden', padding: 22, marginBottom: 14, alignItems: 'center', ...sh(6, 18, 0.28, 7) },
  dlTitle: { fontSize: 14, fontWeight: '900', color: '#FFF8E0', letterSpacing: 1.5, marginBottom: 6 },
  dlSub:   { fontSize: 11, color: 'rgba(255,240,200,0.7)', textAlign: 'center', marginBottom: 18, lineHeight: 16 },
  dlBtns:  { flexDirection: 'row', gap: 12, width: '100%' },
  dlBtn:   { flex: 1, borderRadius: 16, overflow: 'hidden', paddingVertical: 16, alignItems: 'center', gap: 3 },
  dlBtnIco:{ fontSize: 24 },
  dlBtnTxt:{ fontSize: 13, fontWeight: '900', color: '#3A1C08', letterSpacing: 0.5 },
  dlBtnSub:{ fontSize: 8,  color: 'rgba(58,28,8,0.65)', letterSpacing: 0.5 },
} as any);
