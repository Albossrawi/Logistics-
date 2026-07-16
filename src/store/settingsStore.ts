import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_FORMAT } from '../utils/validation';
import type { FormatConfig } from '../utils/validation';

export type ScanEngine = 'ocr' | 'ai';

interface SettingsStore {
  /** Which reader to use for new scans. */
  engine: ScanEngine;
  /** Anthropic API key (stored locally in this browser only). */
  apiKey: string;
  /** Vision model id. */
  model: string;
  /** Auto-read and auto-add each photo, then reopen the camera. */
  rapidCapture: boolean;
  /** Count CLL automatically = number of distinct SSCC numbers per delivery. */
  autoCll: boolean;
  /** Editable expected formats for the delivery & reference numbers. */
  format: FormatConfig;

  setEngine: (e: ScanEngine) => void;
  setApiKey: (k: string) => void;
  setModel: (m: string) => void;
  setRapidCapture: (v: boolean) => void;
  setAutoCll: (v: boolean) => void;
  setFormat: (patch: Partial<FormatConfig>) => void;
  resetFormat: () => void;
}

export const AI_MODELS = [
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5 — fast & cheap (recommended)' },
  { id: 'claude-opus-4-8', label: 'Claude Opus 4.8 — most accurate' },
];

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      engine: 'ocr',
      apiKey: '',
      model: 'claude-haiku-4-5',
      rapidCapture: false,
      autoCll: false,
      format: DEFAULT_FORMAT,
      setEngine: (engine) => set({ engine }),
      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
      setRapidCapture: (rapidCapture) => set({ rapidCapture }),
      setAutoCll: (autoCll) => set({ autoCll }),
      setFormat: (patch) => set((s) => ({ format: { ...s.format, ...patch } })),
      resetFormat: () => set({ format: DEFAULT_FORMAT }),
    }),
    {
      name: 'delivery-labels-settings',
      version: 2,
      migrate: (persisted, version) => {
        const s = persisted as SettingsStore;
        if (!s) return s;
        // v1: move the old Opus default to Haiku (a deliberate pick is kept).
        if (version < 1 && s.model === 'claude-opus-4-8') {
          s.model = 'claude-haiku-4-5';
        }
        // v2: drop the old SRV/6 reference requirement (references vary).
        if (version < 2 && s.format && s.format.referencePrefix === 'SRV' && s.format.referenceDigits === 6) {
          s.format = { ...s.format, referencePrefix: '', referenceDigits: 0 };
        }
        return s;
      },
    }
  )
);
