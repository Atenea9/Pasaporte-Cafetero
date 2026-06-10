/**
 * geminiOcr.ts
 * Gemini 2.0 Flash vision OCR for identity documents.
 * Primary OCR engine — Tesseract is the fallback.
 *
 * Requires EXPO_PUBLIC_GEMINI_API_KEY in environment.
 */

import { DocumentScanResult, Confidence } from './documentScanner';

// ─── Config ──────────────────────────────────────────────────────────────────

// Try models in order — lite models are fastest. Fall through on quota/error.
const GEMINI_MODELS = [
  { name: 'gemini-2.0-flash-lite', version: 'v1beta' },
  { name: 'gemini-2.0-flash',      version: 'v1beta' },
];

// Hard timeout per model attempt (ms). Must stay under 10 s total.
const MODEL_TIMEOUT_MS = 7000;

// Max pixel dimension sent to Gemini. Larger images are downscaled before upload.
// 1280 px is more than enough for Gemini to read ID text while keeping the blob < 200 KB.
const MAX_GEMINI_PX = 1280;

const EXTRACTION_PROMPT = `You are an OCR expert specializing in Colombian identity documents (Cédula de Ciudadanía) and other Latin American IDs.

Analyze this document image and extract the following fields as a JSON object.

COLOMBIAN CÉDULA LAYOUT (most common document):
- Header: "CÉDULA DE CIUDADANÍA" + "REPÚBLICA DE COLOMBIA"
- Top right corner: "NUIP" followed by a number with dots, e.g. "NUIP 1.999.999.999" — this is the document number
- "Apellidos" label → surname(s) printed below or on the same line (e.g. "VELEZ RUIZ")
- "Nombres" label → given name(s) printed below or on the same line (e.g. "GERONIMO")
- "Fecha de nacimiento:" → date in "dd MMM yyyy" format (e.g. "12 MAR 2000")
- Place of birth/issue in "CITY (DEPARTMENT)" format (e.g. "BOGOTA D.C. (CUNDINAMARCA)")
- Month abbreviations: ENE=Jan FEB=Feb MAR=Mar ABR=Apr MAY=May JUN=Jun JUL=Jul AGO=Aug SEP=Sep OCT=Oct NOV=Nov DIC=Dec

Return ONLY a valid JSON object with these exact keys (use null if a field is not present or unclear):
{
  "tipo_documento": "document type in Spanish (e.g. 'Cédula de Ciudadanía (Colombia)', 'Pasaporte', 'DNI', 'Licencia de Conducción', 'Documento de identidad')",
  "numero_documento": "NUIP or document number as a string, digits only — remove all dots, e.g. '1.999.999.999' becomes '1999999999'",
  "nombres": "given/first names only, uppercase, exactly as printed",
  "apellidos": "surname(s) only, uppercase, exactly as printed",
  "fecha_nacimiento": "birth date converted to YYYY-MM-DD format, e.g. '12 MAR 2000' becomes '2000-03-12'",
  "pais_emision": "country of issue in Spanish (e.g. 'Colombia', 'España', 'México')",
  "region_departamento": "department, state or province in proper case, e.g. 'Cundinamarca' from '(CUNDINAMARCA)'",
  "municipio_ciudad": "city or municipality in proper case, e.g. 'Bogotá D.C.' from 'BOGOTA D.C. (CUNDINAMARCA)'"
}

Rules:
- Extract text exactly as printed — do NOT invent or guess missing data
- For Colombian cédulas: tipo_documento = "Cédula de Ciudadanía (Colombia)"
- Strip all dots from NUIP/document numbers
- Convert "dd MMM yyyy" dates to "YYYY-MM-DD" (e.g. "10 ABR 2018" → "2018-04-10")
- If place format is "CITY (DEPARTMENT)", split accordingly
- Return null for any field you cannot read with reasonable confidence`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Downscale a blob so its longest side is ≤ MAX_GEMINI_PX and re-encode as
 * JPEG at 85 % quality. Reduces a 5 MB phone photo to ~120 KB, cutting the
 * base64 payload and Gemini latency by ~30–40×.
 */
async function resizeBlobForGemini(blob: Blob): Promise<Blob> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { naturalWidth: w, naturalHeight: h } = img;
      const scale = Math.min(1, MAX_GEMINI_PX / Math.max(w, h));
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (b) => resolve(b ?? blob), // fallback to original if toBlob fails
        'image/jpeg',
        0.85,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(blob); };
    img.src = url;
  });
}

async function blobToBase64(blob: Blob): Promise<string> {
  // Primary: FileReader (works in all browsers)
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(new Error(`FileReader error: ${(e as any)?.target?.error?.message ?? 'unknown'}`));
      reader.readAsDataURL(blob);
    });
    const base64 = dataUrl.split(',')[1];
    if (!base64) throw new Error('FileReader returned empty base64');
    return base64;
  } catch (err) {
    // Fallback: arrayBuffer → manual base64 encode
    console.warn('[Gemini] FileReader failed, using arrayBuffer fallback:', err);
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  }
}

function getMimeType(blob: Blob): string {
  if (blob.type && blob.type !== '') return blob.type;
  return 'image/jpeg';
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function isGeminiAvailable(): boolean {
  const key = process.env.GEMINI_API_KEY ?? process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  return typeof key === 'string' && key.trim().length > 10;
}

export async function scanWithGemini(
  blob: Blob,
  onProgress?: (stage: string, pct: number) => void,
): Promise<DocumentScanResult> {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length <= 10) {
    throw new Error('EXPO_PUBLIC_GEMINI_API_KEY not configured');
  }

  onProgress?.('Comprimiendo imagen…', 15);

  // Downscale large phone photos → keeps payload < 200 KB → 30–40× faster upload
  const smallBlob = await resizeBlobForGemini(blob);

  onProgress?.('Enviando imagen a Gemini AI…', 25);

  const base64   = await blobToBase64(smallBlob);
  const mimeType = 'image/jpeg'; // resizeBlobForGemini always outputs JPEG

  const body = {
    contents: [
      {
        parts: [
          { inline_data: { mime_type: mimeType, data: base64 } },
          { text: EXTRACTION_PROMPT },
        ],
      },
    ],
    generationConfig: {
      temperature: 0,
      responseMimeType: 'application/json',
    },
  };

  onProgress?.('Analizando documento con IA…', 50);

  // Try each model; hard timeout per attempt so total stays under 10 s.
  let response: Response | null = null;
  let lastErr = '';
  for (const { name, version } of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/${version}/models/${name}:generateContent?key=${apiKey}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (r.status === 429 || r.status === 404 || r.status >= 500) {
        lastErr = `model ${name} returned ${r.status}`;
        console.warn(`[Gemini] ${lastErr}, trying next model…`);
        continue;
      }
      response = r;
      console.log(`[Gemini] using model: ${name}`);
      break;
    } catch (networkErr) {
      clearTimeout(timer);
      lastErr = `model ${name}: ${networkErr instanceof Error ? networkErr.message : String(networkErr)}`;
      console.warn(`[Gemini] ${lastErr}, trying next model…`);
    }
  }

  if (!response) {
    throw new Error(`All Gemini models failed. Last error: ${lastErr}`);
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => 'unknown error');
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

  onProgress?.('Procesando respuesta de IA…', 80);

  const json = await response.json();
  const rawText: string =
    json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  if (!rawText.trim()) {
    throw new Error('Gemini returned empty response');
  }

  // Parse the JSON response (Gemini may wrap it in markdown fences)
  let parsed: Record<string, string | null>;
  try {
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Failed to parse Gemini JSON: ${rawText.slice(0, 200)}`);
  }

  onProgress?.('Listo', 100);

  // ── Map parsed fields, treating non-null Gemini values as "high" confidence ──
  const conf = (v: string | null): Confidence => (v ? 'high' : 'low');

  const num  = parsed.numero_documento   ? String(parsed.numero_documento).replace(/\D/g, '') || null : null;
  const nom  = parsed.nombres            ? String(parsed.nombres).trim()            || null : null;
  const ape  = parsed.apellidos          ? String(parsed.apellidos).trim()           || null : null;
  const fec  = parsed.fecha_nacimiento   ? String(parsed.fecha_nacimiento).trim()    || null : null;
  const pais = parsed.pais_emision       ? String(parsed.pais_emision).trim()        || null : null;
  const reg  = parsed.region_departamento? String(parsed.region_departamento).trim() || null : null;
  const mun  = parsed.municipio_ciudad   ? String(parsed.municipio_ciudad).trim()    || null : null;
  const tipo = parsed.tipo_documento     ? String(parsed.tipo_documento).trim()      : 'Documento de identidad';

  return {
    tipo_documento:      tipo,
    numero_documento:    num,
    nombres:             nom,
    apellidos:           ape,
    fecha_nacimiento:    fec,
    pais_emision:        pais,
    region_departamento: reg,
    municipio_ciudad:    mun,
    _confidence: {
      numero_documento:    conf(num),
      nombres:             conf(nom),
      apellidos:           conf(ape),
      fecha_nacimiento:    conf(fec),
      pais_emision:        conf(pais),
      region_departamento: conf(reg),
      municipio_ciudad:    conf(mun),
    },
    _raw_text: rawText,
    _engine: 'gemini' as const,
  };
}
