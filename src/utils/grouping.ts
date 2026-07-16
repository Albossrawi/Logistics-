import type { LabelEntry } from '../types';

/** A single line as it appears on the exported/printed sheet. */
export interface OutputRow {
  deliveryNumber: string;
  referenceNumber: string;
  quantity: string;
}

/** A delivery number with its scanned packages collapsed. */
export interface DeliveryGroup extends OutputRow {
  /** Distinct package serials (SSCC) counted for this delivery. */
  ssccs: string[];
  /** Entry id backing each package (parallel to ssccs) for deletion. */
  entryIds: string[];
}

/** Flat rows: one output row per scan (manual CLL mode). Values upper-cased. */
export function flatRows(entries: LabelEntry[]): OutputRow[] {
  return entries.map((e) => ({
    deliveryNumber: e.deliveryNumber.toUpperCase(),
    referenceNumber: e.referenceNumber.toUpperCase(),
    quantity: e.quantity,
  }));
}

/**
 * Group scans by delivery number and count CLL = number of distinct SSCC
 * serials. Re-scans of the same box (same SSCC) collapse to one; a scan with no
 * SSCC counts as its own (unknown) package so nothing is silently lost.
 */
export function groupByDelivery(entries: LabelEntry[]): DeliveryGroup[] {
  interface Acc extends DeliveryGroup { seen: Set<string> }
  const map = new Map<string, Acc>();
  const order: string[] = [];

  for (const e of entries) {
    const delivery = e.deliveryNumber.trim().toUpperCase();
    const key = delivery;
    if (!map.has(key)) {
      map.set(key, {
        deliveryNumber: delivery,
        referenceNumber: e.referenceNumber.trim().toUpperCase(),
        quantity: '0',
        ssccs: [],
        entryIds: [],
        seen: new Set(),
      });
      order.push(key);
    }
    const g = map.get(key)!;
    if (!g.referenceNumber && e.referenceNumber.trim()) g.referenceNumber = e.referenceNumber.trim().toUpperCase();

    const sscc = (e.sscc ?? '').trim();
    if (sscc) {
      const s = sscc.toUpperCase();
      if (!g.seen.has(s)) {
        g.seen.add(s);
        g.ssccs.push(sscc);
        g.entryIds.push(e.id);
      }
      // duplicate SSCC → same box scanned again, ignore
    } else {
      g.ssccs.push('');
      g.entryIds.push(e.id);
    }
  }

  return order.map((k) => {
    const g = map.get(k)!;
    return {
      deliveryNumber: g.deliveryNumber,
      referenceNumber: g.referenceNumber,
      quantity: String(g.ssccs.length),
      ssccs: g.ssccs,
      entryIds: g.entryIds,
    };
  });
}

/** True if an entry with the same delivery + non-empty SSCC already exists. */
export function isDuplicatePackage(entries: LabelEntry[], delivery: string, sscc: string): boolean {
  const s = sscc.trim().toUpperCase();
  if (!s) return false;
  const d = delivery.trim().toUpperCase();
  return entries.some(
    (e) => e.deliveryNumber.trim().toUpperCase() === d && (e.sscc ?? '').trim().toUpperCase() === s
  );
}
