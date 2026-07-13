import { Bell, Sun, Moon, Search, RefreshCw, Menu } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { useAppStore } from '../../store/appStore';
import { AlertPanel } from './AlertPanel';

const pageNames: Record<string, string> = {
  labels: 'Delivery Label Extractor',
  dashboard: 'Operations Dashboard',
  shipments: 'Shipment Tracking',
  inventory: 'Inventory Management',
  carriers: 'Carrier Performance',
  supplychain: 'Supply Chain Network',
  routes: 'Route Optimizer',
  analytics: 'Analytics & Reports',
  ai: 'AI Logistics Assistant',
  map: 'Live Global Map',
  settings: 'Settings',
};

export function Header() {
  const { theme, setTheme, activePage, alerts, dateRange, setDateRange, toggleMobileNav } = useAppStore();
  const [showAlerts, setShowAlerts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const unreadCount = alerts.filter((a) => !a.read).length;

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <header className="h-16 flex items-center justify-between gap-2 px-4 md:px-6 bg-surface-900 border-b border-surface-800 flex-shrink-0 relative z-20">
      {/* Left: Menu (mobile) + Page Title */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={toggleMobileNav}
          className="md:hidden w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg bg-surface-800 border border-surface-700 text-surface-300 hover:text-white"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-base md:text-lg font-semibold text-white truncate">{pageNames[activePage] || 'Dashboard'}</h1>
          <p className="hidden sm:block text-xs text-surface-400">
            Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex items-center gap-2 bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 w-72 focus-within:border-primary-500 transition-colors">
        <Search size={16} className="text-surface-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search shipments, SKUs, orders..."
          className="bg-transparent text-sm text-surface-200 placeholder-surface-500 outline-none w-full"
        />
        <kbd className="text-xs text-surface-500 bg-surface-700 px-1.5 py-0.5 rounded">⌘K</kbd>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {/* Date Range */}
        <div className="hidden lg:flex items-center gap-1 bg-surface-800 border border-surface-700 rounded-lg p-1">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={clsx(
                'px-2.5 py-1 rounded text-xs font-medium transition-all',
                dateRange === range
                  ? 'bg-primary-600 text-white'
                  : 'text-surface-400 hover:text-white'
              )}
            >
              {range}
            </button>
          ))}
        </div>

        <button
          onClick={handleRefresh}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-800 border border-surface-700 text-surface-400 hover:text-white hover:border-surface-600 transition-all"
        >
          <RefreshCw size={16} className={clsx(refreshing && 'animate-spin')} />
        </button>

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-800 border border-surface-700 text-surface-400 hover:text-white hover:border-surface-600 transition-all"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className={clsx(
              'w-9 h-9 flex items-center justify-center rounded-lg border transition-all',
              showAlerts
                ? 'bg-primary-600/20 border-primary-500 text-primary-400'
                : 'bg-surface-800 border-surface-700 text-surface-400 hover:text-white hover:border-surface-600'
            )}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-xs text-white flex items-center justify-center font-bold badge-pulse">
                {unreadCount}
              </span>
            )}
          </button>
          {showAlerts && <AlertPanel onClose={() => setShowAlerts(false)} />}
        </div>
      </div>
    </header>
  );
}
