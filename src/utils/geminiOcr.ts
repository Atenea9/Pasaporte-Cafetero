/**
 * geminiOcr.ts
 * Gemini 2.0 Flash vision OCR for identity documents.
 * Primary OCR engine — Tesseract is the fallback.
 *
 * Requires EXPO_PUBLIC_GEMINI_API_KEY in environment.
 */

import { DocumentScanResult, Confidence } from './documentScanner';

// ─── Config ──────────────────────────────────────────────────────────────────

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const EXTRACTION_PROMPT = `You are an OCR expert specializing in identity documents. Analyze this document image and extract the following fields as a JSON object.

Return ONLY a valid JSON object with these exact keys (use null if a field is not present or unclear):
{
  "tipo_documento": "document type in Spanish (e.g. 'Cédula de Ciudadanía (Colombia)', 'Pasaporte', 'DNI', 'Licencia de Conducción', 'Documento de identidad')",
  "numero_documento": "document number as a string, digits only",
  "nombres": "first and middle names only, uppercase",
  "apellidos": "last name(s) only, uppercase",
  "fecha_nacimiento": "birth date in YYYY-MM-DD format",
  "pais_emision": "country of issue in Spanish (e.g. 'Colombia', 'España', 'México')",
  "region_departamento": "department, state or province",
  "municipio_ciudad": "city or municipality"
}

Confidence guidelines:
- Extract text exactly as printed, do not invent data
- For fecha_nacimiento, always output YYYY-MM-DD format
- If the document is a Colombian Cédula, tipo_documento = "Cédula de Ciudadanía (Colombia)"
- Return null for any field you cannot read with reasonable confidence`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  return typeof key === 'string' && key.trim().length > 10;
}

export async function scanWithGemini(
  blob: Blob,
  onProgress?: (stage: string, pct: number) => void,
): Promise<DocumentScanResult> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length <= 10) {
    throw new Error('EXPO_PUBLIC_GEMINI_API_KEY not configured');
  }

  onProgress?.('Enviando imagen a Gemini AI…', 20);

  const base64 = await blobToBase64(blob);
  const mimeType = getMimeType(blob);

  const body = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: base64,
            },
          },
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

  let response: Response;
  try {
    response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (networkErr) {
    throw new Error(`Gemini network error: ${networkErr instanceof Error ? networkErr.message : String(networkErr)}`);
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
  };
}
