export interface ExtractionResult {
  deliveryNumber: string;
  referenceNumber: string;
  rawText: string;
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
export async function scanLabel(
  dataUrl: string,
  onProgress?: (p: number) => void
): Promise<ExtractionResult> {
  const processed = await preprocess(dataUrl);
  const Tesseract = await import('tesseract.js');
  const { data } = await Tesseract.recognize(processed, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) onProgress(m.progress);
    },
  });
  const rawText = data.text || '';
  const { deliveryNumber, referenceNumber } = extractFields(rawText);
  return { deliveryNumber, referenceNumber, rawText };
}

/**
 * Heuristic field extraction from OCR text. Tuned for DSV-style labels where the
 * consignment/delivery number looks like "NAKD1-8FL64" and the reference is
 * printed after "Ref:" (e.g. "SRV010001"), but falls back to generic patterns.
 */
export function extractFields(raw: string): { deliveryNumber: string; referenceNumber: string } {
  const text = raw.toUpperCase().replace(/[|]/g, 'I');
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);

  let referenceNumber = '';
  let deliveryNumber = '';

  // --- Reference number ---
  // Prefer an explicit "REF:" marker.
  for (const line of lines) {
    const m = line.match(/REF[\s:.#-]*([A-Z]{2,4}\d{3,})/);
    if (m) {
      referenceNumber = clean(m[1]);
      break;
    }
  }
  // Fallback: a standalone SRV-style token anywhere.
  if (!referenceNumber) {
    const m = text.match(/\b(SRV\d{4,})\b/);
    if (m) referenceNumber = clean(m[1]);
  }

  // --- Delivery / consignment number ---
  // Prefer a NAKD-style token with a suffix after a dash.
  const delMatch = text.match(/\b(NAKD\d?\s*-\s*[A-Z0-9]{3,})\b/);
  if (delMatch) {
    deliveryNumber = clean(delMatch[1]).replace(/\s+/g, '');
  }
  // Fallback: look near a "CONSIGNMENT" label.
  if (!deliveryNumber) {
    const idx = lines.findIndex((l) => /CONSIGNMENT/.test(l));
    if (idx >= 0) {
      for (const l of [lines[idx], lines[idx + 1], lines[idx + 2]]) {
        if (!l) continue;
        const m = l.match(/\b([A-Z]{2,5}\d?-[A-Z0-9]{3,})\b/);
        if (m) {
          deliveryNumber = clean(m[1]);
          break;
        }
      }
    }
  }
  // Last resort: any "LETTERS-ALNUM" token that isn't the reference.
  if (!deliveryNumber) {
    const m = text.match(/\b([A-Z]{2,5}\d?-[A-Z0-9]{3,})\b/);
    if (m && clean(m[1]) !== referenceNumber) deliveryNumber = clean(m[1]);
  }

  return { deliveryNumber, referenceNumber };
}

function clean(s: string): string {
  return s.replace(/[^A-Z0-9-]/gi, '').trim();
}
