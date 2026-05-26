/**
 * passport.export.ts
 * -------------------------------------------------
 * Generates a shareable PDF of the visitor's Pasaporte Cafetero.
 *
 * INSTALL:
 *   npx expo install expo-print expo-sharing
 *
 * USAGE:
 *   import { exportPassportPDF } from '../services/passport.export';
 *   await exportPassportPDF(usuario);
 * -------------------------------------------------
 */

import * as Print   from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import type { Usuario } from '../context/AppContext';
import { MUNICIPIOS, getNivelActual } from '../data/mockData';

/** Build the HTML template for the passport PDF */
function buildPassportHTML(usuario: Usuario): string {
  const nivel   = getNivelActual(usuario.puntos);
  const sellos  = usuario.sellos
    .map(id => MUNICIPIOS.find(m => m.id === id))
    .filter(Boolean);

  const selloBlocks = sellos.map(m =>
    `<div class="sello" style="border-color:${m!.color}">
       <span class="emoji">${m!.emoji}</span>
       <span class="nombre">${m!.nombre}</span>
     </div>`
  ).join('');

  // Empty placeholder cells so the grid always looks full
  const placeholders = Array(Math.max(0, 12 - sellos.length))
    .fill('<div class="sello empty"><span class="emoji">○</span></div>')
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@400;700&display=swap');

    * { margin:0; padding:0; box-sizing:border-box; }

    body {
      font-family: 'Lato', sans-serif;
      background: #FBF5E6;
      color: #2C1A00;
      padding: 32px;
      max-width: 700px;
      margin: auto;
    }

    header {
      text-align: center;
      border-bottom: 3px solid #C8860A;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    header .logo { font-size: 48px; }
    header h1 {
      font-family: 'Playfair Display', serif;
      font-size: 26px;
      color: #C8860A;
      margin: 8px 0 4px;
    }
    header p { color: #6B4226; font-size: 13px; }

    .section { margin-bottom: 24px; }
    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 16px;
      color: #8B4513;
      border-bottom: 1px solid #D4A76A;
      padding-bottom: 6px;
      margin-bottom: 12px;
    }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; }
    .info-item label { font-size: 11px; color: #8B6914; font-weight: 700; text-transform: uppercase; letter-spacing:.5px; }
    .info-item p { font-size: 15px; color: #2C1A00; margin-top: 2px; }

    .nivel-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: ${nivel.color}22;
      border: 2px solid ${nivel.color};
      border-radius: 24px;
      padding: 8px 20px;
      font-weight: 700;
      color: ${nivel.color};
      font-size: 15px;
    }

    .points-bar-wrapper { margin-top: 12px; }
    .points-bar {
      background: #E8D5AA;
      border-radius: 8px;
      height: 12px;
      overflow: hidden;
    }
    .points-fill {
      height: 100%;
      background: linear-gradient(90deg, #C8860A, #E8A830);
      border-radius: 8px;
      width: ${Math.min(100, (usuario.puntos / 500) * 100)}%;
    }
    .points-label { font-size: 12px; color: #8B6914; margin-top: 4px; }

    .sellos-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .sello {
      border: 2px solid #C8860A;
      border-radius: 10px;
      padding: 10px 6px;
      text-align: center;
      background: white;
    }
    .sello.empty { border-style: dashed; border-color: #D4C4A0; background: #FAF6EE; }
    .sello .emoji { display: block; font-size: 24px; }
    .sello .nombre { display: block; font-size: 9px; color: #6B4226; margin-top: 4px; font-weight: 700; }

    footer {
      text-align: center;
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #D4A76A;
      font-size: 11px;
      color: #A89070;
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">☕</div>
    <h1>Pasaporte Cafetero del Tolima</h1>
    <p>Documento coleccionable — Feria del Café 2025</p>
  </header>

  <div class="section">
    <h2 class="section-title">Datos del Visitante</h2>
    <div class="info-grid">
      <div class="info-item"><label>Nombre</label><p>${usuario.nombre}</p></div>
      <div class="info-item"><label>Cédula</label><p>${usuario.cedula}</p></div>
      <div class="info-item"><label>Municipio</label><p>${usuario.municipio}</p></div>
      <div class="info-item"><label>WhatsApp</label><p>${usuario.whatsapp}</p></div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Nivel Cafetero</h2>
    <div class="nivel-badge">${nivel.emoji} ${nivel.nombre}</div>
    <div class="points-bar-wrapper">
      <div class="points-bar"><div class="points-fill"></div></div>
      <p class="points-label">${usuario.puntos} puntos acumulados</p>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Sellos Coleccionados (${sellos.length} de ${MUNICIPIOS.length})</h2>
    <div class="sellos-grid">
      ${selloBlocks}
      ${placeholders}
    </div>
  </div>

  <footer>
    Generado por la app Pasaporte Cafetero del Tolima &bull;
    ${new Date().toLocaleDateString('es-CO', { day:'2-digit', month:'long', year:'numeric' })}
  </footer>
</body>
</html>`;
}

/**
 * Export and share the visitor's passport as a PDF.
 * On iOS/Android it opens the native share sheet.
 * On Web it triggers a file download.
 */
export async function exportPassportPDF(usuario: Usuario): Promise<void> {
  const html = buildPassportHTML(usuario);

  if (Platform.OS === 'web') {
    // Web: open a print-ready window
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
    return;
  }

  try {
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Pasaporte de ${usuario.nombre}`,
        UTI: 'com.adobe.pdf',
      });
    } else {
      await Print.printAsync({ html });
    }
  } catch (err) {
    console.error('[PassportExport] Error generating PDF:', err);
    throw err;
  }
}
