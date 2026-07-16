/**
 * Editable label-format rules. Defaults match the DSV/Sengefabrikken labels:
 *   Delivery (NAKD): "NAKD1-" + exactly 5 letters/digits, e.g. NAKD1-8FL64
 *   Reference (SRV): "SRV" + exactly 6 digits,            e.g. SRV010001
 * Users can change these in Settings.
 */
export interface FormatConfig {
  deliveryPrefix: string;
  /** How many characters must follow the delivery prefix (0 = don't check). */
  deliverySuffixLen: number;
  /** If true, the characters after the delivery prefix must be digits only. */
  deliveryDigitsOnly: boolean;
  referencePrefix: string;
  /** How many digits must follow the reference prefix (0 = don't check). */
  referenceDigits: number;
}

export const DEFAULT_FORMAT: FormatConfig = {
  deliveryPrefix: 'NAKD1-',
  deliverySuffixLen: 5,
  deliveryDigitsOnly: false,
  // No prefix / count required by default — references vary (SRV…, plain digits, …).
  referencePrefix: '',
  referenceDigits: 0,
};

/** A sample valid value, for hints/placeholders. */
export function deliveryExample(cfg: FormatConfig): string {
  const filler = (cfg.deliveryDigitsOnly ? '0' : 'X').repeat(Math.max(cfg.deliverySuffixLen, 0));
  return `${cfg.deliveryPrefix}${filler}`;
}
export function referenceExample(cfg: FormatConfig): string {
  return `${cfg.referencePrefix}${'0'.repeat(Math.max(cfg.referenceDigits, 0))}`;
}

export function validateDelivery(value: string, cfg: FormatConfig): string | undefined {
  const s = value.trim().toUpperCase();
  const prefix = cfg.deliveryPrefix.trim().toUpperCase();
  if (!s) return 'Delivery number is missing.';
  if (prefix && !s.startsWith(prefix)) {
    return `Delivery number must start with "${cfg.deliveryPrefix}" (e.g. ${deliveryExample(cfg)}) — got "${value.trim()}".`;
  }
  const suffix = s.slice(prefix.length);
  if (cfg.deliverySuffixLen > 0 && suffix.length !== cfg.deliverySuffixLen) {
    return `Delivery number needs ${cfg.deliverySuffixLen} characters after "${cfg.deliveryPrefix}" (e.g. ${deliveryExample(cfg)}) — got "${value.trim()}".`;
  }
  if (cfg.deliveryDigitsOnly ? !/^[0-9]*$/.test(suffix) : !/^[A-Z0-9]*$/.test(suffix)) {
    return `Delivery number has invalid characters after "${cfg.deliveryPrefix}" — got "${value.trim()}".`;
  }
  return undefined;
}

export function validateReference(value: string, cfg: FormatConfig): string | undefined {
  const s = value.trim().toUpperCase();
  const prefix = cfg.referencePrefix.trim().toUpperCase();
  if (!s) return 'Reference number is missing.';
  if (prefix && !s.startsWith(prefix)) {
    return `Reference must start with "${cfg.referencePrefix}" (e.g. ${referenceExample(cfg)}) — got "${value.trim()}".`;
  }
  // Only enforce a digit count/shape when one is configured; otherwise any
  // non-empty reference is accepted.
  if (cfg.referenceDigits > 0) {
    const digits = s.slice(prefix.length);
    if (!/^[0-9]*$/.test(digits)) {
      return `Reference must be ${cfg.referencePrefix ? `"${cfg.referencePrefix}" + ` : ''}digits only (e.g. ${referenceExample(cfg)}) — got "${value.trim()}".`;
    }
    if (digits.length !== cfg.referenceDigits) {
      return `Reference needs ${cfg.referenceDigits} digits${cfg.referencePrefix ? ` after "${cfg.referencePrefix}"` : ''} (e.g. ${referenceExample(cfg)}) — got "${value.trim()}".`;
    }
  }
  return undefined;
}
