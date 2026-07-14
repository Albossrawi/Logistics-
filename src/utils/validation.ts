// Expected label formats. Adjust here if the numbering scheme changes.
//   Delivery (NAKD): "NAKD1-" + exactly 5 letters/digits, e.g. NAKD1-8FL64
//   Reference (SRV): "SRV" + exactly 6 digits,            e.g. SRV010001
const DELIVERY_RE = /^NAKD1-[A-Z0-9]{5}$/;
const REFERENCE_RE = /^SRV[0-9]{6}$/;

export interface EntryValidation {
  deliveryError?: string;
  referenceError?: string;
  ok: boolean;
}

export function validateDelivery(value: string): string | undefined {
  const s = value.trim().toUpperCase();
  if (!s) return 'Delivery number is missing.';
  if (!DELIVERY_RE.test(s)) {
    return `Delivery number must be "NAKD1-" + 5 characters (e.g. NAKD1-8FL64) — got "${value.trim()}".`;
  }
  return undefined;
}

export function validateReference(value: string): string | undefined {
  const s = value.trim().toUpperCase();
  if (!s) return 'Reference number is missing.';
  if (!REFERENCE_RE.test(s)) {
    return `Reference must be "SRV" + 6 digits (e.g. SRV010001) — got "${value.trim()}".`;
  }
  return undefined;
}

export function validateEntry(delivery: string, reference: string): EntryValidation {
  const deliveryError = validateDelivery(delivery);
  const referenceError = validateReference(reference);
  return { deliveryError, referenceError, ok: !deliveryError && !referenceError };
}
