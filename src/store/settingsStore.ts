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
  { id: 'claude-opus-4-8', label: 'Claude Opus 4.8 — most accurate' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5 — faster & cheaper' },
];

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      engine: 'ocr',
      apiKey: '',
      model: 'claude-opus-4-8',
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
    { name: 'delivery-labels-settings' }
  )
);
