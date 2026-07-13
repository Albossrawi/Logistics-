import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Alert } from '../types';
import { alerts as initialAlerts } from '../data/mockData';

interface AppStore {
  theme: 'dark' | 'light';
  activePage: string;
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  alerts: Alert[];
  selectedShipment: string | null;
  dateRange: '7d' | '30d' | '90d' | '1y';
  setTheme: (theme: 'dark' | 'light') => void;
  setActivePage: (page: string) => void;
  toggleSidebar: () => void;
  setMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
  markAlertRead: (id: string) => void;
  markAllAlertsRead: () => void;
  setSelectedShipment: (id: string | null) => void;
  setDateRange: (range: '7d' | '30d' | '90d' | '1y') => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      activePage: 'labels',
      sidebarCollapsed: false,
      mobileNavOpen: false,
      alerts: initialAlerts,
      selectedShipment: null,
      dateRange: '30d',

      setTheme: (theme) => set({ theme }),
      setActivePage: (page) => set({ activePage: page, mobileNavOpen: false }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
      toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),
      markAlertRead: (id) =>
        set((s) => ({ alerts: s.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)) })),
      markAllAlertsRead: () =>
        set((s) => ({ alerts: s.alerts.map((a) => ({ ...a, read: true })) })),
      setSelectedShipment: (id) => set({ selectedShipment: id }),
      setDateRange: (range) => set({ dateRange: range }),
    }),
    {
      name: 'logistics-app-store',
      partialize: (state) => ({ theme: state.theme, sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
);
