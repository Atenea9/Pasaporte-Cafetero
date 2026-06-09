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
  foto_url?: string;
  _confidence: Record<
    'numero_documento' | 'nombres' | 'apellidos' | 'fecha_nacimiento' |
    'pais_emision' | 'region_departamento' | 'municipio_ciudad',
    Confidence
  >;
  _raw_text: string;
  _engine?: 'gemini' | 'tesseract';
}

// ─── Face photo extraction ───────────────────────────────────────────────────

/**
 * Crops the face-photo zone from an identity document.
 * Colombian cédulas always have the photo in the top-left area
 * (~x:0–38%, y:10%–92% of the card).
 * Returns a JPEG base64 data URL, or null on failure.
 */
export async function extractFaceFromDocument(
  source: File | Blob | string,
): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = typeof source === 'string' ? source : URL.createObjectURL(source as Blob);
    img.onload = () => {
      try {
        const W = img.naturalWidth;
        const H = img.naturalHeight;
        // Face zone: left 38% of card width, top 10%–92% of card height
        const sx = 0;
        const sy = Math.floor(H * 0.10);
        const sw = Math.floor(W * 0.38);
        const sh = Math.floor(H * 0.82);
        const canvas = document.createElement('canvas');
        canvas.width  = sw;
        canvas.height = sh;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      } catch {
        resolve(null);
      } finally {
        if (typeof source !== 'string') URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      if (typeof source !== 'string') URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

// ─── Tesseract worker singleton ───────────────────────────────────────────────
// The worker is created once and reused, avoiding re-downloading ~5 MB of
// language data on every scan (the main source of perceived slowness).

let _worker: Tesseract.Worker | null = null;
let _initPromise: Promise<Tesseract.Worker> | null = null;

async function getWorker(onProgress?: (stage: string, pct: number) => void): Promise<Tesseract.Worker> {
  if (_worker) return _worker;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    const w = await Tesseract.createWorker('spa', 1, {
      logger: (m: any) => {
        if (m.status === 'loading tesseract core' || m.status === 'initializing tesseract') {
          onProgress?.('Cargando motor OCR…', 8);
        } else if (m.status === 'loading language traineddata') {
          onProgress?.('Preparando modelos…', 11);
        }
      },
    });
    await w.setParameters({ tessedit_pageseg_mode: '6' as any });
    _worker = w;
    _initPromise = null;
    return w;
  })();

  return _initPromise;
}

/**
 * Pre-warm the Tesseract worker in the background.
 * Call this when the scanner modal opens so the language data is already
 * loaded by the time the user takes a photo.
 */
export function warmupOCR(): void {
  getWorker().catch(() => {});
}

// ─── STEP 1: Image preprocessing ─────────────────────────────────────────────

// 2x upscaling + CSS filter (grayscale, contrast, brightness) for Tesseract.
// 2x is sufficient for cedula text and processes ~4× faster than 3x.
export async function preprocessImage(source: File | Blob | string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = typeof source === 'string' ? source : URL.createObjectURL(source as Blob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = img.naturalWidth  * 2;
      canvas.height = img.naturalHeight * 2;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.filter = 'grayscale(1) contrast(2) brightness(1.3)';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.filter = 'none';

      if (typeof source !== 'string') URL.revokeObjectURL(url);
      resolve(canvas);
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
    // NUIP on new Colombian cédula — can have dots: "1.999.999.999"
    const nuipM = raw.match(/NUIP[:\s]*([\d.]{6,15})/i);
    if (nuipM) {
      const cleaned = nuipM[1].replace(/\./g, '');
      res.numero_documento = { value: cleaned, conf: 'high' };
    }
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
    // New Colombian cédula: "Nombres GERONIMO" on one line (label + value same line)
    const m = raw.match(/Nombres?\s+([A-ZÁÉÍÓÚÑ][A-Za-záéíóúñÁÉÍÓÚÑ ]{1,39}?)(?:\s*\n|\s{2,}|$)/i);
    if (m) { res.nombres = { value: m[1].trim(), conf: 'high' }; }
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
    // New Colombian cédula: "Apellidos VELEZ RUIZ" on one line (label + value same line)
    const m = raw.match(/Apellidos?\s+([A-ZÁÉÍÓÚÑ][A-Za-záéíóúñÁÉÍÓÚÑ ]{1,39}?)(?:\s*\n|\s{2,}|$)/i);
    if (m) { res.apellidos = { value: m[1].trim(), conf: 'high' }; }
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

  // Extract face photo from the original (colour) image regardless of OCR engine
  const foto_url = await extractFaceFromDocument(source).catch(() => null) ?? undefined;

  // ── Primary: Gemini 2.0 Flash (original image — no preprocessing needed) ──
  if (isGeminiAvailable()) {
    try {
      const originalBlob: Blob =
        source instanceof Blob
          ? source
          : await fetch(source).then(r => r.blob());
      const geminiResult = await scanWithGemini(originalBlob, onProgress);
      return { ...geminiResult, foto_url };
    } catch (geminiErr) {
      console.warn(
        '[DocumentScanner] Gemini failed, falling back to Tesseract:',
        geminiErr instanceof Error ? geminiErr.message : geminiErr,
      );
      onProgress?.('Cambiando a motor OCR local…', 14);
    }
  }

  // ── STEP 1: 3x upscale + CSS filter preprocessing for Tesseract ─────────
  let processedCanvas: HTMLCanvasElement | null = null;
  try {
    processedCanvas = await preprocessImage(source);
  } catch (e) {
    console.warn('[Tesseract] preprocessing failed, using original source:', e);
  }
  const tesseractInput: any = processedCanvas ?? source;

  // ── STEP 2: Tesseract.js via singleton worker (PSM 6 — uniform block) ──────
  onProgress?.('Extrayendo texto del documento…', 15);

  // Get the pre-warmed singleton worker (instant if warmupOCR() was called earlier)
  const worker = await getWorker(onProgress);

  const { data } = await worker.recognize(tesseractInput);

  onProgress?.('Extrayendo texto del documento…', 85);

  const text: string = data.text;

  onProgress?.('Identificando campos…', 90);

  const tipo = detectDocumentType(text);

  // ── STEP 3 & 4: Robust field extraction for Colombian cédula ─────────────

  let numero_documento:    string | null = null;
  let apellidos:           string | null = null;
  let nombres:             string | null = null;
  let fecha_nacimiento:    string | null = null;
  let municipio_ciudad:    string | null = null;
  let region_departamento: string | null = null;
  let pais_emision:        string | null = null;

  const lines = text.split('\n');

  // Words that should NEVER be a name value (known labels/noise)
  const FALSE_NAME = /^(NUIP|REPÚBLICA|REPUBLICA|COLOMBIA|CIUDADANÍA|CIUDADANIA|CÉDULA|CEDULA|CIUDADANO|CIUDADANA|MINISTERIO|TRANSPORTE|IDENTIFICACIÓN|IDENTIFICACION|NOMBRES?|APELLIDOS?|FIRMA|FECHA|LUGAR|EXPEDICIÓN|EXPEDICION|ESTATURA|SEXO|NACIONALIDAD|NACIMIENTO|COL|GS|DNI|DE|LA|EL|LOS|LAS|ENE|FEB|MAR|ABR|MAY|JUN|JUL|AGO|SEP|OCT|NOV|DIC)$/i;

  /**
   * Given a raw OCR line, strip leading junk and return only the space-joined
   * all-caps words (2+ chars, valid Spanish letters). Returns null if nothing usable.
   */
  const toCleanName = (line: string): string | null => {
    const words = line
      .split(/\s+/)
      .map(w => w.replace(/[^A-Za-záéíóúñÁÉÍÓÚÑ]/g, ''))
      .filter(w => w.length >= 2 && /^[A-ZÁÉÍÓÚÑ]+$/.test(w) && !FALSE_NAME.test(w));
    return words.length >= 1 ? words.join(' ') : null;
  };

  // ── A) NUIP ───────────────────────────────────────────────────────────────
  // Primary: "NUIP 1.122.333.444" or "NUIP: 1.987.654.999"
  const nuipM = text.match(/NUIP\s*:?\s*([\d\.]{6,15})/i);
  if (nuipM) numero_documento = nuipM[1].replace(/\./g, '');
  // Fallback: dot-grouped number pattern (1.122.333.444 style) — label often dropped
  if (!numero_documento) {
    const dnM = text.match(/\b(\d{1,3}(?:\.\d{3}){2,3})\b/);
    if (dnM) numero_documento = dnM[1].replace(/\./g, '');
  }

  // ── B) Apellidos ──────────────────────────────────────────────────────────
  // Strategy: find the "Apellidos" label line, then scan subsequent lines for the
  // first one that yields a clean name (the actual surname is NEVER on the same
  // line as NUIP — it's always 1-2 lines below the label).
  // Note: Tesseract sometimes reads "Apeliidos" (double-i) — use fuzzy match.
  let apellidosLabelIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    // Matches: "Apellidos", "Apeliidos" (double-i OCR), "Apelidos" (single-l OCR typo)
    if (/Apell?i+dos?/i.test(lines[i])) { apellidosLabelIdx = i; break; }
  }
  if (apellidosLabelIdx >= 0) {
    for (let j = apellidosLabelIdx + 1; j < Math.min(apellidosLabelIdx + 4, lines.length); j++) {
      const name = toCleanName(lines[j]);
      if (name && name.split(' ').length >= 1 && name.length >= 3) {
        apellidos = name; break;
      }
    }
  }
  // Fallback: first line of 2+ all-caps words that isn't a known header
  if (!apellidos) {
    for (const line of lines) {
      const name = toCleanName(line);
      if (name && name.split(' ').length >= 2 && !FALSE_NAME.test(name)) {
        apellidos = name; break;
      }
    }
  }

  // ── C) Nombres ────────────────────────────────────────────────────────────
  // Strategy: find "Nombres" label line, then look at the NEXT non-empty lines.
  // NOTE: "Nombres?" with `?` was capturing the trailing "s" of "Nombres" — use
  // exact word-boundary match and search line-by-line instead.
  let nombresLabelIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/\bNombres\b/i.test(lines[i])) { nombresLabelIdx = i; break; }
  }
  if (nombresLabelIdx >= 0) {
    for (let j = nombresLabelIdx + 1; j < Math.min(nombresLabelIdx + 4, lines.length); j++) {
      const name = toCleanName(lines[j]);
      if (name && name.length >= 3) {
        nombres = name; break;
      }
    }
  }
  // Fallback: all-caps line that comes right after the apellidos line
  if (!nombres && apellidos) {
    const apeKey = apellidos.split(' ')[0].slice(0, 4).toUpperCase();
    let seenApe = false;
    for (const line of lines) {
      if (!seenApe) {
        if (line.toUpperCase().includes(apeKey)) seenApe = true;
        continue;
      }
      const name = toCleanName(line);
      if (name && name.length >= 3 && !FALSE_NAME.test(name)) { nombres = name; break; }
    }
  }
  // Bounding-box fallback for nombres (uses Tesseract word-level data)
  if (!nombres) {
    const words: Array<{ text: string; bbox: { x0: number; y0: number; x1: number; y1: number } }> =
      (data as any).words ?? [];
    const canvasH = processedCanvas?.height ?? 0;
    if (canvasH > 0) {
      const nomMin = Math.floor(canvasH * 0.48);
      const nomMax = Math.floor(canvasH * 0.66);
      const v = words
        .filter(w => w.bbox.y0 >= nomMin && w.bbox.y0 <= nomMax && /^[A-ZÁÉÍÓÚÑ]{3,}$/i.test(w.text) && !FALSE_NAME.test(w.text))
        .map(w => w.text).join(' ');
      if (v) nombres = v;
    }
  }

  // ── D) Fecha de nacimiento ─────────────────────────────────────────────────
  // Tesseract often misreads "OCT" as "0CT" — normalise before matching.
  const textNorm = text.replace(/\b0CT\b/gi, 'OCT').replace(/\bAG0\b/gi, 'AGO');
  // Look for fecha near "nacimiento" label first to avoid expedition date
  const moMap: Record<string, string> = {
    ENE:'01',FEB:'02',MAR:'03',ABR:'04',MAY:'05',JUN:'06',
    JUL:'07',AGO:'08',SEP:'09',OCT:'10',NOV:'11',DIC:'12',
  };
  const FECHA_RE = /(\d{1,2})\s*(ENE|FEB|MAR|ABR|MAY|JUN|JUL|AGO|SEP|OCT|NOV|DIC)\s*(\d{4})/gi;
  let fechaMatch: RegExpExecArray | null;
  const allDates: Array<{ day: string; mo: string; year: string; idx: number }> = [];
  while ((fechaMatch = FECHA_RE.exec(textNorm)) !== null) {
    allDates.push({ day: fechaMatch[1], mo: fechaMatch[2].toUpperCase(), year: fechaMatch[3], idx: fechaMatch.index });
  }
  if (allDates.length > 0) {
    // Prefer the date nearest the "nacimiento" label (if found), else take the first
    const nacIdx = textNorm.search(/nacimiento/i);
    const best = nacIdx >= 0
      ? allDates.reduce((a, b) => Math.abs(a.idx - nacIdx) <= Math.abs(b.idx - nacIdx) ? a : b)
      : allDates[0];
    fecha_nacimiento = `${best.year}-${moMap[best.mo]}-${best.day.padStart(2,'0')}`;
  }

  // ── E) Lugar de nacimiento ─────────────────────────────────────────────────
  // Strip leading OCR noise: remove words with no vowels (e.g. "CMS", "D", "C")
  const stripNoise = (s: string) => s
    .split(/\s+/)
    .filter(w => w.length >= 2 && /[AEIOUÁÉÍÓÚ]/i.test(w))
    .join(' ').trim();

  // Primary: city (department) — e.g. "MEDELLÍN (ANTIOQUIA)"
  const lugarM = text.match(/([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s\.]{2,})\s*\(([A-ZÁÉÍÓÚÑ\s]{2,})\)/);
  if (lugarM) {
    municipio_ciudad    = stripNoise(lugarM[1]) || lugarM[1].trim();
    region_departamento = lugarM[2].trim();
  }
  // Fallback: detect "BOGOTÁ D.C." pattern (no parentheses on some cédulas)
  if (!municipio_ciudad) {
    const bogotaM = text.match(/BOGOT[AÁ]\s*D\.?C\.?/i);
    if (bogotaM) {
      municipio_ciudad    = 'Bogotá D.C.';
      region_departamento = 'Cundinamarca';
    }
  }
  // Fallback: scan for "Lugar de nacimiento" label and grab next meaningful line
  if (!municipio_ciudad) {
    for (let i = 0; i < lines.length; i++) {
      if (/lugar de nacimiento/i.test(lines[i])) {
        for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
          const cleaned = stripNoise(lines[j].replace(/[^A-Za-záéíóúñÁÉÍÓÚÑ\s\.]/g, ' '));
          if (cleaned.length >= 3) { municipio_ciudad = cleaned; break; }
        }
        break;
      }
    }
  }
  // Also try to find department if still null using the known departments list
  if (!region_departamento) {
    region_departamento = findDepartment(text);
  }

  // ── F) País ────────────────────────────────────────────────────────────────
  if (/COLOMBIA/i.test(text)) pais_emision = 'Colombia';

  // Debug
  console.log('[Tesseract] raw text:', text.slice(0, 600));
  console.log('[Tesseract] extracted:', {
    tipo, numero_documento, nombres, apellidos,
    fecha_nacimiento, pais_emision, region_departamento, municipio_ciudad,
  });

  const confFor = (v: string | null): Confidence => (v ? 'high' : 'low');

  onProgress?.('Listo', 100);

  return {
    tipo_documento:      tipo,
    numero_documento,
    nombres,
    apellidos,
    fecha_nacimiento,
    pais_emision,
    region_departamento,
    municipio_ciudad,
    foto_url,
    _confidence: {
      numero_documento:    confFor(numero_documento),
      nombres:             confFor(nombres),
      apellidos:           confFor(apellidos),
      fecha_nacimiento:    confFor(fecha_nacimiento),
      pais_emision:        confFor(pais_emision),
      region_departamento: confFor(region_departamento),
      municipio_ciudad:    confFor(municipio_ciudad),
    },
    _raw_text: text,
    _engine:   'tesseract' as const,
  };
}
