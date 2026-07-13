import { loadImage } from './ocr';
import type { ExtractionResult } from './ocr';

export interface AIScanOptions {
  apiKey: string;
  model: string;
}

const SYSTEM = `You read shipping/delivery labels (often DSV labels) from photos and extract exactly three fields:
- "deliveryNumber": the consignment / delivery number, usually the large bold code such as "NAKD1-8FL64".
- "referenceNumber": the reference number, usually printed after "Ref:" such as "SRV010001".
- "sscc": the long serial / SSCC barcode number near the bottom (typically 18 digits, sometimes shown with a "(00)" prefix, e.g. "370733747952374111"). Return digits only. Do NOT return the short postcode barcode.
Return the values exactly as printed. If a field is not visible, use an empty string.`;

const PROMPT = `Extract the delivery number, reference number, and SSCC serial number from this label.
Respond with ONLY a compact JSON object and nothing else, e.g.:
{"deliveryNumber":"NAKD1-8FL64","referenceNumber":"SRV010001","sscc":"370733747952374111"}`;

/**
 * Downscale a photo and re-encode as JPEG to keep vision token cost reasonable.
 * Returns the base64 payload (no data-URL prefix) and its media type.
 */
async function toJpegBase64(dataUrl: string, maxDim = 1568): Promise<{ mediaType: 'image/jpeg'; data: string }> {
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
  const out = canvas.toDataURL('image/jpeg', 0.85);
  return { mediaType: 'image/jpeg', data: out.split(',')[1] ?? '' };
}

function parseJson(text: string): { deliveryNumber?: string; referenceNumber?: string; sscc?: string } {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return {};
  try {
    return JSON.parse(match[0]);
  } catch {
    return {};
  }
}

/**
 * Read a label with Claude vision. Runs fully in the browser using the user's
 * own API key. Falls through to the caller's error handling on failure.
 */
export async function scanLabelAI(dataUrl: string, opts: AIScanOptions): Promise<ExtractionResult> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: opts.apiKey, dangerouslyAllowBrowser: true });

  const { mediaType, data } = await toJpegBase64(dataUrl);

  const response = await client.messages.create({
    model: opts.model || 'claude-opus-4-8',
    max_tokens: 300,
    system: SYSTEM,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data } },
          { type: 'text', text: PROMPT },
        ],
      },
    ],
  });

  let text = '';
  for (const block of response.content) {
    if (block.type === 'text') text += block.text;
  }

  const parsed = parseJson(text);
  return {
    deliveryNumber: (parsed.deliveryNumber ?? '').trim(),
    referenceNumber: (parsed.referenceNumber ?? '').trim(),
    sscc: (parsed.sscc ?? '').replace(/[^0-9]/g, ''),
    rawText: text,
  };
}
