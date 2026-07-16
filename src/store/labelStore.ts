import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LabelBatch, LabelEntry } from '../types';

const DEFAULT_TITLE = 'RETUR BEDRE NÆTTER/SENGEFABRIKKEN';

function todayISO(): string {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function newBatch(title = DEFAULT_TITLE): LabelBatch {
  return {
    id: uid(),
    title,
    date: todayISO(),
    pallet: '',
    entries: [],
    createdAt: new Date().toISOString(),
  };
}

interface LabelStore {
  batches: LabelBatch[];
  activeBatchId: string | null;

  activeBatch: () => LabelBatch | undefined;

  createBatch: () => void;
  selectBatch: (id: string) => void;
  deleteBatch: (id: string) => void;
  updateBatch: (id: string, patch: Partial<Pick<LabelBatch, 'title' | 'date' | 'pallet'>>) => void;

  addEntry: (batchId: string, entry: Omit<LabelEntry, 'id' | 'createdAt'>) => void;
  updateEntry: (batchId: string, entryId: string, patch: Partial<LabelEntry>) => void;
  deleteEntry: (batchId: string, entryId: string) => void;
}

export const useLabelStore = create<LabelStore>()(
  persist(
    (set, get) => {
      const first = newBatch();
      return {
        batches: [first],
        activeBatchId: first.id,

        activeBatch: () => {
          const { batches, activeBatchId } = get();
          return batches.find((b) => b.id === activeBatchId) ?? batches[0];
        },

        createBatch: () =>
          set((s) => {
            // Carry the title forward so the user rarely has to retype it.
            const lastTitle = s.batches[0]?.title ?? DEFAULT_TITLE;
            const b = newBatch(lastTitle);
            return { batches: [b, ...s.batches], activeBatchId: b.id };
          }),

        selectBatch: (id) => set({ activeBatchId: id }),

        deleteBatch: (id) =>
          set((s) => {
            const batches = s.batches.filter((b) => b.id !== id);
            const ensured = batches.length ? batches : [newBatch()];
            const activeBatchId =
              s.activeBatchId === id ? ensured[0].id : s.activeBatchId;
            return { batches: ensured, activeBatchId };
          }),

        updateBatch: (id, patch) =>
          set((s) => ({
            batches: s.batches.map((b) => (b.id === id ? { ...b, ...patch } : b)),
          })),

        addEntry: (batchId, entry) =>
          set((s) => ({
            batches: s.batches.map((b) =>
              b.id === batchId
                ? {
                    ...b,
                    entries: [
                      ...b.entries,
                      {
                        ...entry,
                        // Store codes upper-cased so all output is capital case.
                        deliveryNumber: entry.deliveryNumber.toUpperCase(),
                        referenceNumber: entry.referenceNumber.toUpperCase(),
                        id: uid(),
                        createdAt: new Date().toISOString(),
                      },
                    ],
                  }
                : b
            ),
          })),

        updateEntry: (batchId, entryId, patch) => {
          const p = { ...patch };
          if (p.deliveryNumber !== undefined) p.deliveryNumber = p.deliveryNumber.toUpperCase();
          if (p.referenceNumber !== undefined) p.referenceNumber = p.referenceNumber.toUpperCase();
          set((s) => ({
            batches: s.batches.map((b) =>
              b.id === batchId
                ? {
                    ...b,
                    entries: b.entries.map((e) =>
                      e.id === entryId ? { ...e, ...p } : e
                    ),
                  }
                : b
            ),
          }));
        },

        deleteEntry: (batchId, entryId) =>
          set((s) => ({
            batches: s.batches.map((b) =>
              b.id === batchId
                ? { ...b, entries: b.entries.filter((e) => e.id !== entryId) }
                : b
            ),
          })),
      };
    },
    {
      name: 'delivery-labels-store',
      // Photos are large data URLs — keep them in memory only, never in
      // localStorage, so we don't blow the ~5MB quota. Numbers/titles persist.
      partialize: (state) => ({
        activeBatchId: state.activeBatchId,
        batches: state.batches.map((b) => ({
          ...b,
          entries: b.entries.map((e) => {
            const rest = { ...e };
            delete rest.photo;
            return rest;
          }),
        })),
      }),
    }
  )
);
