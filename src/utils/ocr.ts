import type { Worker as TesseractWorker } from 'tesseract.js';

export interface ExtractionResult {
  deliveryNumber: string;
  referenceNumber: string;
  /** SSCC / long serial number at the bottom (digits only). */
  sscc: string;
  rawText: string;
}

// The Tesseract engine, worker, and English model are self-hosted under
// /tesseract (see public/tesseract) so OCR works with no CDN dependency —
// reliable on locked-down networks and after the first load, offline.
const TESSERACT_PATHS = {
  workerPath: '/tesseract/worker.min.js',
  corePath: '/tesseract/tesseract-core-simd-lstm.wasm.js',
  langPath: '/tesseract/lang',
};

let workerPromise: Promise<TesseractWorker> | null = null;
let progressCb: ((p: number) => void) | undefined;

/** Lazily create and cache one Tesseract worker for the session. */
async function getWorker(): Promise<TesseractWorker> {
  if (!workerPromise) {
    const { createWorker } = await import('tesseract.js');
    workerPromise = createWorker('eng', 1, {
      ...TESSERACT_PATHS,
      logger: (m: { status: string; progress: number }) => {
        if (m.status === 'recognizing text' && progressCb) progressCb(m.progress);
      },
    });
  }
  return workerPromise;
}

/**
 * Load an image file into an HTMLImageElement (via object URL).
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Read a File as a data URL.
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Rotate a data-URL image by a multiple of 90 degrees and return a new data URL.
 */
export async function rotateImage(dataUrl: string, degrees: number): Promise<string> {
  const img = await loadImage(dataUrl);
  const rad = (degrees * Math.PI) / 180;
  const swap = degrees % 180 !== 0;
  const canvas = document.createElement('canvas');
  canvas.width = swap ? img.height : img.width;
  canvas.height = swap ? img.width : img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);
  return canvas.toDataURL('image/jpeg', 0.9);
}

/**
 * Pre-process for OCR: downscale very large photos, convert to grayscale and
 * boost contrast. Improves Tesseract accuracy on phone photos of labels.
 */
async function preprocess(dataUrl: string): Promise<string> {
  const img = await loadImage(dataUrl);
  const maxDim = 2000;
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);

  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  const contrast = 1.4;
  const intercept = 128 * (1 - contrast);
  for (let i = 0; i < d.length; i += 4) {
    // luminance -> grayscale
    let g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    g = g * contrast + intercept;
    g = Math.max(0, Math.min(255, g));
    d[i] = d[i + 1] = d[i + 2] = g;
  }
  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Run OCR on a label image and try to extract the delivery & reference numbers.
 * `onProgress` receives 0..1.
 */
export interface ExtractOptions {
  /** Delivery prefix, e.g. "NAKD1-" (only the leading letters are used to search). */
  deliveryPrefix?: string;
  /** Reference prefix, e.g. "SRV". */
  referencePrefix?: string;
}

export async function scanLabel(
  dataUrl: string,
  onProgress?: (p: number) => void,
  opts?: ExtractOptions
): Promise<ExtractionResult> {
  const processed = await preprocess(dataUrl);
  const worker = await getWorker();
  progressCb = onProgress;
  let data;
  try {
    ({ data } = await worker.recognize(processed));
  } finally {
    progressCb = undefined;
  }
  const rawText = data.text || '';
  const { deliveryNumber, referenceNumber, sscc } = extractFields(rawText, opts);
  return { deliveryNumber, referenceNumber, sscc, rawText };
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Heuristic field extraction from OCR text. Tuned for DSV-style labels where the
 * consignment/delivery number looks like "NAKD1-8FL64" and the reference is
 * printed after "Ref:" (e.g. "SRV010001"), but falls back to generic patterns.
 */
export function extractFields(
  raw: string,
  opts?: ExtractOptions
): { deliveryNumber: string; referenceNumber: string; sscc: string } {
  const text = raw.toUpperCase().replace(/[|]/g, 'I');
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);

  const refPrefix = (opts?.referencePrefix ?? 'SRV').trim().toUpperCase();
  // Only the leading letters of the delivery prefix are reliable to search for
  // (e.g. "NAKD1-" → "NAKD"), since OCR mangles the digits/dash.
  const delLetters = ((opts?.deliveryPrefix ?? 'NAKD').match(/^[A-Za-z]+/)?.[0] ?? 'NAKD').toUpperCase();
  const delRe = new RegExp(`\\b(${escapeRegExp(delLetters)}\\d?\\s*-?\\s*[A-Z0-9]{3,})\\b`);
  const refTokenRe = refPrefix ? new RegExp(`\\b(${escapeRegExp(refPrefix)}\\d{3,})\\b`) : null;

  let referenceNumber = '';
  let deliveryNumber = '';
  let sscc = '';
  let refIdx = -1;

  // --- Reference number --- (prefer an explicit "REF:" marker, then the prefix)
  for (let i = 0; i < lines.length; i++) {
    let m = lines[i].match(/REF[\s:.#-]*([A-Z]{2,5}\d{3,})/);
    if (!m && refTokenRe) m = lines[i].match(refTokenRe);
    if (m) {
      referenceNumber = clean(m[1]);
      refIdx = i;
      break;
    }
  }
  if (!referenceNumber && refTokenRe) {
    const m = text.match(refTokenRe);
    if (m) referenceNumber = clean(m[1]);
  }

  // --- Delivery / consignment number ---
  // On these labels the delivery number is printed directly below the reference
  // line, so look right beneath it first.
  if (refIdx >= 0) {
    for (const l of [lines[refIdx + 1], lines[refIdx + 2], lines[refIdx]]) {
      const m = l?.match(delRe);
      if (m) { deliveryNumber = clean(m[1]); break; }
    }
  }
  // Anywhere in the text.
  if (!deliveryNumber) {
    const m = text.match(delRe);
    if (m) deliveryNumber = clean(m[1]);
  }
  // Near a "CONSIGNMENT" label.
  if (!deliveryNumber) {
    const idx = lines.findIndex((l) => /CONSIGNMENT/.test(l));
    if (idx >= 0) {
      for (const l of [lines[idx], lines[idx + 1], lines[idx + 2]]) {
        const m = l?.match(/\b([A-Z]{2,5}\d?-[A-Z0-9]{3,})\b/);
        if (m) { deliveryNumber = clean(m[1]); break; }
      }
    }
  }
  // Last resort: any "LETTERS-ALNUM" token that isn't the reference.
  if (!deliveryNumber) {
    const m = text.match(/\b([A-Z]{2,5}\d?-[A-Z0-9]{3,})\b/);
    if (m && clean(m[1]) !== referenceNumber) deliveryNumber = clean(m[1]);
  }

  // --- SSCC / long serial number (bottom barcode) ---
  // The SSCC is the longest number on the label (18 digits, often with a "(00)"
  // prefix). Find long tokens made of digits or common OCR digit-lookalikes,
  // normalise the lookalikes back to digits, and keep the longest — but only if
  // the token was already mostly real digits (so words don't get mistaken for a
  // serial). Skips short numbers like the postcode "(421) 2088200".
  {
    let best = '';
    // Candidate = run of digits and digit-lookalike letters (not C/other letters,
    // which break a real serial token like "SSCC (00) 3707…").
    const CANDIDATE = /[0-9OQDILZSGTB]{12,}/g;
    for (const m of text.matchAll(CANDIDATE)) {
      const token = m[0];
      const realDigits = (token.match(/[0-9]/g) ?? []).length;
      if (realDigits < 8) continue; // likely a word, not a number
      const norm = normalizeDigits(token);
      if (norm.length > best.length) best = norm;
    }
    sscc = best;
  }

  return { deliveryNumber, referenceNumber, sscc };
}

/** Map common OCR letter↔digit confusions to digits (for all-numeric fields). */
function normalizeDigits(s: string): string {
  return s
    .toUpperCase()
    .replace(/[OQD]/g, '0')
    .replace(/[IL|!]/g, '1')
    .replace(/Z/g, '2')
    .replace(/S/g, '5')
    .replace(/G/g, '6')
    .replace(/T/g, '7')
    .replace(/B/g, '8')
    .replace(/[^0-9]/g, '');
}

function clean(s: string): string {
  return s.replace(/[^A-Z0-9-]/gi, '').trim();
}
