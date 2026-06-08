/**
 * documentScanner.ts
 * Full OCR pipeline for identity documents.
 * Primary  — Gemini 2.0 Flash vision API (requires EXPO_PUBLIC_GEMINI_API_KEY)
 * Fallback — Tesseract.js (spa+eng) + canvas preprocessing + regex extraction
 */

import Tesseract from 'tesseract.js';
import { scanWithGemini, isGeminiAvailable } from './geminiOcr';

// ─── Output types ────────────────────────────────────────────────────────────

export type Confidence = 'high' | 'medium' | 'low';

export interface DocumentScanResult {
  tipo_documento: string;
  numero_documento: string | null;
  nombres: string | null;
  apellidos: string | null;
  fecha_nacimiento: string | null;
  pais_emision: string | null;
  region_departamento: string | null;
  municipio_ciudad: string | null;
  _confidence: Record<
    'numero_documento' | 'nombres' | 'apellidos' | 'fecha_nacimiento' |
    'pais_emision' | 'region_departamento' | 'municipio_ciudad',
    Confidence
  >;
  _raw_text: string;
}

// ─── STEP 1: Image preprocessing ─────────────────────────────────────────────

export async function preprocessImage(source: File | Blob | string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = typeof source === 'string' ? source : URL.createObjectURL(source as Blob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX = 1800;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d')!;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Grayscale
      const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d  = id.data;
      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        d[i] = d[i + 1] = d[i + 2] = gray;
      }

      // Contrast 1.5x + brightness 1.2x
      const contrast   = 1.5;
      const brightness = 1.2;
      const factor = (259 * (contrast * 255 + 259)) / (259 * (259 - contrast * 255));
      for (let i = 0; i < d.length; i += 4) {
        const v = d[i] * brightness;
        d[i] = d[i + 1] = d[i + 2] = Math.min(255, Math.max(0, factor * (v - 128) + 128));
      }
      ctx.putImageData(id, 0, 0);

      // Sharpen via convolution kernel
      const kernel = [
         0, -1,  0,
        -1,  5, -1,
         0, -1,  0,
      ];
      const src2 = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const dst2 = ctx.createImageData(canvas.width, canvas.height);
      const w = canvas.width, h = canvas.height;
      const sd = src2.data, dd = dst2.data;
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          let r = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const px = ((y + ky) * w + (x + kx)) * 4;
              r += sd[px] * kernel[(ky + 1) * 3 + (kx + 1)];
            }
          }
          const pi = (y * w + x) * 4;
          dd[pi] = dd[pi + 1] = dd[pi + 2] = Math.min(255, Math.max(0, r));
          dd[pi + 3] = 255;
        }
      }
      ctx.putImageData(dst2, 0, 0);

      if (typeof source !== 'string') URL.revokeObjectURL(url);
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('toBlob failed')), 'image/png');
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ─── STEP 3: Document type detection ─────────────────────────────────────────

function detectDocumentType(text: string): string {
  const t = text.toUpperCase();
  if (/CÉDULA|CEDULA|NUIP/.test(t))                                          return 'Cédula de Ciudadanía (Colombia)';
  if (/PASAPORTE|PASSPORT/.test(t))                                           return 'Pasaporte';
  if (/LICENCIA DE CONDUCCIÓN|CONDUCCION|MINISTERIO DE TRANSPORTE/.test(t))   return 'Licencia de Conducción (Colombia)';
  if (/IDENTIFICACIÓN PERSONAL|IDENTIFICACION PERSONAL/.test(t))              return 'Cédula de Ciudadanía antigua (Colombia)';
  if (/\bDNI\b/.test(t))                                                      return 'DNI';
  return 'Documento de identidad';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_MAP: Record<string, string> = {
  ENE: '01', FEB: '02', MAR: '03', ABR: '04', MAY: '05', JUN: '06',
  JUL: '07', AGO: '08', SEP: '09', OCT: '10', NOV: '11', DIC: '12',
  JAN: '01', APR: '04', AUG: '08',
};

function parseDate(raw: string): string | null {
  // dd MON yyyy
  let m = raw.match(/(\d{1,2})[\/\-\s]([A-Z]{3})[\/\-\s](\d{4})/i);
  if (m) {
    const mm = MONTH_MAP[m[2].toUpperCase()];
    if (mm) return `${m[3]}-${mm}-${m[1].padStart(2, '0')}`;
  }
  // dd/mm/yyyy
  m = raw.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  // yyyy-mm-dd
  m = raw.match(/(\d{4})[\/\-](\d{2})[\/\-](\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  // MRZ: ddMMMyyy or YYMMDD
  m = raw.match(/(\d{2})([A-Z]{3})(\d{4})/i);
  if (m) {
    const mm2 = MONTH_MAP[m[2].toUpperCase()];
    if (mm2) return `${m[3]}-${mm2}-${m[1].padStart(2, '0')}`;
  }
  m = raw.match(/(\d{6})/);
  if (m) {
    const s = m[1];
    const yy = parseInt(s.slice(0, 2), 10);
    const yyyy = yy > 30 ? `19${s.slice(0, 2)}` : `20${s.slice(0, 2)}`;
    return `${yyyy}-${s.slice(2, 4)}-${s.slice(4, 6)}`;
  }
  return null;
}

const COLOMBIAN_DEPARTMENTS = [
  'AMAZONAS','ANTIOQUIA','ARAUCA','ATLANTICO','BOGOTA','BOLIVAR','BOYACA',
  'CALDAS','CAQUETA','CASANARE','CAUCA','CESAR','CHOCO','CORDOBA',
  'CUNDINAMARCA','GUAINIA','GUAVIARE','HUILA','LA GUAJIRA','MAGDALENA',
  'META','NARINO','NARIÑO','NORTE DE SANTANDER','PUTUMAYO','QUINDIO',
  'RISARALDA','SAN ANDRES','SANTANDER','SUCRE','TOLIMA','VALLE DEL CAUCA',
  'VAUPES','VICHADA',
];

function normAccents(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function findDepartment(text: string): string | null {
  const up = normAccents(text.toUpperCase());
  for (const dept of COLOMBIAN_DEPARTMENTS) {
    if (up.includes(dept)) {
      const proper = dept.split(' ')
        .map(w => w.charAt(0) + w.slice(1).toLowerCase())
        .join(' ');
      return proper;
    }
  }
  return null;
}

const COUNTRY_KW: [string, string][] = [
  ['REPÚBLICA DE COLOMBIA', 'Colombia'], ['REPUBLICA DE COLOMBIA', 'Colombia'],
  ['COLOMBIE',   'Colombia'], ['COLOMBIA',       'Colombia'],
  ['ESPAÑA',     'España'],   ['SPAIN',           'España'],
  ['REINO DE ESPAÑA', 'España'],
  ['ALEMANIA',   'Alemania'], ['GERMANY',         'Alemania'],
  ['MÉXICO',     'México'],   ['MEXICO',           'México'],
  ['ESTADOS UNIDOS MEXICANOS', 'México'],
  ['PERÚ',       'Perú'],     ['PERU',             'Perú'],
  ['ARGENTINA',  'Argentina'],
  ['CHILE',      'Chile'],
  ['VENEZUELA',  'Venezuela'],
  ['ECUADOR',    'Ecuador'],
  ['ESTADOS UNIDOS', 'Estados Unidos'], ['UNITED STATES', 'Estados Unidos'],
  ['BRASIL',     'Brasil'],   ['BRAZIL',           'Brasil'],
];

const MRZ_NATIONALITY: Record<string, string> = {
  COL:'Colombia', USA:'Estados Unidos', ESP:'España', DEU:'Alemania',
  BRA:'Brasil',   MEX:'México',        FRA:'Francia', ITA:'Italia',
  GBR:'Reino Unido', CAN:'Canadá',     ARG:'Argentina', CHL:'Chile',
  PER:'Perú',     VEN:'Venezuela',     ECU:'Ecuador',
};

// ─── STEP 4: Field extraction ────────────────────────────────────────────────

interface Extracted {
  numero_documento: { value: string | null; conf: Confidence };
  nombres:          { value: string | null; conf: Confidence };
  apellidos:        { value: string | null; conf: Confidence };
  fecha_nacimiento: { value: string | null; conf: Confidence };
  pais_emision:     { value: string | null; conf: Confidence };
  region_departamento: { value: string | null; conf: Confidence };
  municipio_ciudad:    { value: string | null; conf: Confidence };
}

function extractFields(raw: string, tipo: string): Extracted {
  const text  = raw.toUpperCase();
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const up    = lines.map(l => l.toUpperCase());

  const res: Extracted = {
    numero_documento:    { value: null, conf: 'low' },
    nombres:             { value: null, conf: 'low' },
    apellidos:           { value: null, conf: 'low' },
    fecha_nacimiento:    { value: null, conf: 'low' },
    pais_emision:        { value: null, conf: 'low' },
    region_departamento: { value: null, conf: 'low' },
    municipio_ciudad:    { value: null, conf: 'low' },
  };

  const isPassport = tipo.toLowerCase().includes('pasaporte');
  const isLicencia = tipo.toLowerCase().includes('licencia');

  // ── MRZ lines ───────────────────────────────────────────────────────────
  const mrzLines = lines.filter(l => /^[A-Z0-9<]{28,}$/.test(l.replace(/\s/g, '')));
  const mrz = mrzLines.map(l => l.replace(/\s/g, ''));

  // ── A) Número de documento ───────────────────────────────────────────────
  if (isPassport && mrz.length >= 2) {
    const docNum = mrz[1].slice(0, 9).replace(/<+/g, '');
    if (docNum.length >= 5) { res.numero_documento = { value: docNum, conf: 'high' }; }
  }
  if (!res.numero_documento.value) {
    // near NUIP / No.
    const nuipM = raw.match(/NUIP[:\s]*(\d{5,12})/i);
    if (nuipM) { res.numero_documento = { value: nuipM[1], conf: 'high' }; }
  }
  if (!res.numero_documento.value) {
    const noM = raw.match(/No\.?\s*(\d{5,12})/i);
    if (noM) { res.numero_documento = { value: noM[1], conf: 'medium' }; }
  }
  if (!res.numero_documento.value) {
    // longest numeric in text
    const allNums = [...raw.matchAll(/\b(\d{6,12})\b/g)].map(m => m[1]);
    if (allNums.length) {
      const longest = allNums.reduce((a, b) => b.length > a.length ? b : a, '');
      res.numero_documento = { value: longest, conf: 'low' };
    }
  }

  // ── B) Nombres ───────────────────────────────────────────────────────────
  if (isPassport && mrz.length >= 1) {
    const m1 = mrz[0];
    if (m1.startsWith('P<') || m1.startsWith('P ')) {
      const namePart = m1.slice(5);
      const parts    = namePart.split('<<');
      const first    = parts.slice(1).join(' ').replace(/<+/g, ' ').trim();
      if (first.length > 1) { res.nombres = { value: first, conf: 'high' }; }
    }
  }
  if (!res.nombres.value) {
    const ni = up.findIndex(l => /^NOMBRES?$/.test(l.trim()));
    if (ni >= 0 && lines[ni + 1]) {
      const v = lines[ni + 1].replace(/[^A-Za-záéíóúñÁÉÍÓÚÑ ]/g, '').trim();
      if (v.length > 1) { res.nombres = { value: v, conf: 'high' }; }
    }
  }
  if (!res.nombres.value) {
    const m = raw.match(/Nombres?\s*[:\n\r]+\s*([A-ZÁÉÍÓÚÑ ]{2,40})/i);
    if (m) { res.nombres = { value: m[1].trim(), conf: 'medium' }; }
  }
  if (isLicencia && !res.nombres.value) {
    const ni2 = up.findIndex(l => l.includes('NOMBRE'));
    if (ni2 >= 0 && lines[ni2 + 1]) {
      const words = lines[ni2 + 1].split(/\s+/);
      res.nombres = { value: words.slice(0, -2).join(' '), conf: 'medium' };
    }
  }

  // ── C) Apellidos ─────────────────────────────────────────────────────────
  if (isPassport && mrz.length >= 1) {
    const m1 = mrz[0];
    if (m1.startsWith('P<') || m1.startsWith('P ')) {
      const namePart = m1.slice(5);
      const last     = namePart.split('<<')[0].replace(/<+/g, ' ').trim();
      if (last.length > 1) { res.apellidos = { value: last, conf: 'high' }; }
    }
  }
  if (!res.apellidos.value) {
    const ai = up.findIndex(l => /^APELLIDOS?$/.test(l.trim()));
    if (ai >= 0 && lines[ai + 1]) {
      const v = lines[ai + 1].replace(/[^A-Za-záéíóúñÁÉÍÓÚÑ ]/g, '').trim();
      if (v.length > 1) { res.apellidos = { value: v, conf: 'high' }; }
    }
  }
  if (!res.apellidos.value) {
    const m = raw.match(/Apellidos?\s*[:\n\r]+\s*([A-ZÁÉÍÓÚÑ ]{2,40})/i);
    if (m) { res.apellidos = { value: m[1].trim(), conf: 'medium' }; }
  }
  if (isLicencia && !res.apellidos.value) {
    const ni2 = up.findIndex(l => l.includes('NOMBRE'));
    if (ni2 >= 0 && lines[ni2 + 1]) {
      const words = lines[ni2 + 1].split(/\s+/);
      if (words.length >= 2) res.apellidos = { value: words.slice(-2).join(' '), conf: 'medium' };
    }
  }
  // fallback: lines in ALL CAPS with 2+ words not matching known institution names
  if (!res.apellidos.value) {
    const capsLines = lines.filter(l =>
      /^[A-ZÁÉÍÓÚÑ ]{4,}$/.test(l) &&
      l.split(/\s+/).length >= 2 &&
      !/COLOMBIA|REPUBLICA|CEDULA|LICENCIA|PASAPORTE|MINISTERIO|GOBIERNO|REGISTRADURIA/.test(l)
    );
    if (capsLines.length > 0) { res.apellidos = { value: capsLines[0], conf: 'low' }; }
  }

  // ── D) Fecha de nacimiento ────────────────────────────────────────────────
  // Look for labeled field first
  const fechaM = raw.match(/(?:Fecha\s+de\s+Nacimiento|Nacimiento|Date\s+of\s+Birth|Fecha\s+Nac)[.:)]*\s*([^\n]{4,20})/i);
  if (fechaM) {
    const parsed = parseDate(fechaM[1]);
    if (parsed) { res.fecha_nacimiento = { value: parsed, conf: 'high' }; }
  }
  // MRZ: line 2 chars 13-19 = YYMMDD
  if (!res.fecha_nacimiento.value && mrz.length >= 2) {
    const dob = mrz[1].slice(13, 19);
    if (/^\d{6}$/.test(dob)) {
      const yy    = parseInt(dob.slice(0, 2), 10);
      const yyyy  = yy > 30 ? `19${dob.slice(0, 2)}` : `20${dob.slice(0, 2)}`;
      const month = dob.slice(2, 4);
      const day   = dob.slice(4, 6);
      res.fecha_nacimiento = { value: `${yyyy}-${month}-${day}`, conf: 'high' };
    }
  }
  if (!res.fecha_nacimiento.value) {
    // try all date-like sequences
    const candidates = raw.match(/\d{1,2}[\/\-\s][A-Z]{3}[\/\-\s]\d{4}|\d{2}[\/\-]\d{2}[\/\-]\d{4}|\d{4}[\/\-]\d{2}[\/\-]\d{2}/gi) ?? [];
    for (const c of candidates) {
      const parsed = parseDate(c);
      if (parsed) { res.fecha_nacimiento = { value: parsed, conf: 'medium' }; break; }
    }
  }

  // ── E) País de emisión ────────────────────────────────────────────────────
  if (mrz.length >= 1) {
    const cc = mrz[0].slice(2, 5).replace(/<+/g, '');
    if (MRZ_NATIONALITY[cc]) { res.pais_emision = { value: MRZ_NATIONALITY[cc], conf: 'high' }; }
  }
  if (!res.pais_emision.value) {
    const upText = normAccents(text.toUpperCase());
    for (const [kw, country] of COUNTRY_KW) {
      if (upText.includes(normAccents(kw))) {
        res.pais_emision = { value: country, conf: 'high' };
        break;
      }
    }
  }
  if (!res.pais_emision.value) {
    const natM = raw.match(/(?:Nationality|Nacionalidad)[:\s]*([A-Za-záéíóúñÁÉÍÓÚÑ ]{3,20})/i);
    if (natM) { res.pais_emision = { value: natM[1].trim(), conf: 'medium' }; }
  }

  // ── F) Región / Departamento ──────────────────────────────────────────────
  const lugarM = raw.match(/(?:Lugar\s+de\s+nacimiento|Lugar\s+de\s+expedición|Place\s+of\s+birth)[:\s]*([^\n]{3,40})/i);
  if (lugarM) {
    const dept = findDepartment(lugarM[1]);
    if (dept) { res.region_departamento = { value: dept, conf: 'high' }; }
  }
  if (!res.region_departamento.value) {
    const dept = findDepartment(raw);
    if (dept) { res.region_departamento = { value: dept, conf: 'medium' }; }
  }

  // ── G) Municipio / Ciudad ─────────────────────────────────────────────────
  const dept = res.region_departamento.value;
  if (dept) {
    const deptUp = dept.toUpperCase();
    const deptIdx = up.findIndex(l => l.includes(deptUp) || normAccents(l).includes(normAccents(deptUp)));
    if (deptIdx >= 0) {
      // Try same line before department name
      const sameLine = lines[deptIdx];
      const beforeDept = sameLine.replace(new RegExp(dept, 'i'), '').trim();
      if (beforeDept.length > 2 && !/^\d+$/.test(beforeDept)) {
        res.municipio_ciudad = { value: beforeDept.split(/[\s,]+/)[0], conf: 'medium' };
      } else if (deptIdx > 0) {
        const prevLine = lines[deptIdx - 1].replace(/[^A-Za-záéíóúñÁÉÍÓÚÑ ]/g, '').trim();
        if (prevLine.length > 2) {
          res.municipio_ciudad = { value: prevLine, conf: 'low' };
        }
      }
    }
  }
  if (!res.municipio_ciudad.value) {
    const lugarM2 = raw.match(/(?:Lugar\s+de\s+nacimiento|Place\s+of\s+birth)[:\s]*([A-Za-záéíóúñÁÉÍÓÚÑ ]+)/i);
    if (lugarM2) {
      const parts = lugarM2[1].split(/[\s,]+/).filter(w => w.length > 2);
      if (parts.length) { res.municipio_ciudad = { value: parts[0], conf: 'low' }; }
    }
  }

  return res;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function scanDocument(
  source: File | Blob | string,
  onProgress?: (stage: string, pct: number) => void,
): Promise<DocumentScanResult> {
  onProgress?.('Procesando imagen…', 5);

  // ── Primary: Gemini 2.0 Flash (original image — no preprocessing needed) ──
  if (isGeminiAvailable()) {
    try {
      // Convert source to Blob for Gemini without preprocessing
      // (Gemini's vision model works best on the original colour image)
      const originalBlob: Blob =
        source instanceof Blob
          ? source
          : await fetch(source).then(r => r.blob());
      return await scanWithGemini(originalBlob, onProgress);
    } catch (geminiErr) {
      console.warn(
        '[DocumentScanner] Gemini failed, falling back to Tesseract:',
        geminiErr instanceof Error ? geminiErr.message : geminiErr,
      );
      onProgress?.('Cambiando a motor OCR local…', 14);
    }
  }

  // ── Preprocess image for Tesseract (grayscale + contrast helps Tesseract) ─
  let processedBlob: Blob;
  try {
    processedBlob = await preprocessImage(source);
  } catch {
    processedBlob = source as Blob;
  }

  // ── Fallback: Tesseract.js ────────────────────────────────────────────────
  onProgress?.('Extrayendo texto del documento…', 15);

  const { data: { text } } = await Tesseract.recognize(
    processedBlob as any,
    'spa+eng',
    {
      logger: (m: any) => {
        if (m.status === 'recognizing text') {
          onProgress?.('Extrayendo texto del documento…', 15 + Math.round(m.progress * 70));
        } else if (m.status === 'loading tesseract core' || m.status === 'initializing tesseract') {
          onProgress?.('Cargando motor OCR…', 10);
        } else if (m.status === 'loading language traineddata') {
          onProgress?.('Cargando modelos de idioma…', 12);
        }
      },
    }
  );

  onProgress?.('Identificando campos…', 90);

  const tipo   = detectDocumentType(text);
  const fields = extractFields(text, tipo);

  onProgress?.('Listo', 100);

  return {
    tipo_documento:      tipo,
    numero_documento:    fields.numero_documento.value,
    nombres:             fields.nombres.value,
    apellidos:           fields.apellidos.value,
    fecha_nacimiento:    fields.fecha_nacimiento.value,
    pais_emision:        fields.pais_emision.value,
    region_departamento: fields.region_departamento.value,
    municipio_ciudad:    fields.municipio_ciudad.value,
    _confidence: {
      numero_documento:    fields.numero_documento.conf,
      nombres:             fields.nombres.conf,
      apellidos:           fields.apellidos.conf,
      fecha_nacimiento:    fields.fecha_nacimiento.conf,
      pais_emision:        fields.pais_emision.conf,
      region_departamento: fields.region_departamento.conf,
      municipio_ciudad:    fields.municipio_ciudad.conf,
    },
    _raw_text: text,
  };
}
