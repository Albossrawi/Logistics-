import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

  setEngine: (e: ScanEngine) => void;
  setApiKey: (k: string) => void;
  setModel: (m: string) => void;
  setRapidCapture: (v: boolean) => void;
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
      setEngine: (engine) => set({ engine }),
      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
      setRapidCapture: (rapidCapture) => set({ rapidCapture }),
    }),
    { name: 'delivery-labels-settings' }
  )
);
