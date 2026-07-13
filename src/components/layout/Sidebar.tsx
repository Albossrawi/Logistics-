import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import {
  LayoutDashboard, Package, Warehouse, TruckIcon, BarChart3,
  BrainCircuit, Map, Settings, ChevronLeft, ChevronRight,
  Zap, Globe, Route, ScanLine, X
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';

const navItems = [
  { id: 'labels', label: 'Label Extractor', icon: ScanLine, badge: null },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
  { id: 'shipments', label: 'Shipments', icon: Package, badge: '6' },
  { id: 'inventory', label: 'Inventory', icon: Warehouse, badge: '2' },
  { id: 'carriers', label: 'Carriers', icon: TruckIcon, badge: null },
  { id: 'supplychain', label: 'Supply Chain', icon: Globe, badge: null },
  { id: 'routes', label: 'Route Optimizer', icon: Route, badge: '3' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
  { id: 'ai', label: 'AI Assistant', icon: BrainCircuit, badge: null },
];

const bottomItems = [
  { id: 'map', label: 'Live Map', icon: Map },
  { id: 'settings', label: 'Settings', icon: Settings },
];

/** True on md+ viewports; used so the desktop "collapsed" state never hides
 *  labels in the full-width mobile drawer. */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isDesktop;
}

export function Sidebar() {
  const {
    activePage, sidebarCollapsed, mobileNavOpen,
    setActivePage, toggleSidebar, setMobileNavOpen,
  } = useAppStore();

  const isDesktop = useIsDesktop();
  // On mobile the drawer is always full-width/expanded.
  const collapsed = sidebarCollapsed && isDesktop;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={clsx(
          'flex flex-col bg-surface-900 border-r border-surface-800 transition-transform duration-300 ease-in-out',
          // Mobile: off-canvas drawer
          'fixed top-0 left-0 z-50 h-full w-64',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: in flow, always visible, width from collapse state
          'md:relative md:translate-x-0 md:z-auto md:flex-shrink-0 md:transition-all',
          collapsed ? 'md:w-16' : 'md:w-60'
        )}
      >
        {/* Logo */}
        <div className={clsx(
          'flex items-center h-16 px-4 border-b border-surface-800',
          collapsed ? 'md:justify-center' : 'gap-3'
        )}>
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center shadow-glow-blue">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent-emerald rounded-full border border-surface-900" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <div className="text-sm font-bold text-white leading-tight">LogisticAI</div>
              <div className="text-xs text-surface-300 leading-tight">Command Center</div>
            </div>
          )}
          {/* Mobile close button */}
          <button
            onClick={() => setMobileNavOpen(false)}
            className="ml-auto md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-surface-400 hover:text-white hover:bg-surface-800"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-0.5 px-2">
          {!collapsed && (
            <div className="px-2 pb-2 text-xs font-semibold text-surface-300 uppercase tracking-wider">
              Operations
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={clsx(
                  'w-full flex items-center rounded-lg transition-all duration-150 group relative',
                  collapsed ? 'md:justify-center md:p-2.5 gap-3 px-3 py-2.5' : 'gap-3 px-3 py-2.5',
                  isActive
                    ? 'bg-primary-600/20 text-primary-400 sidebar-item-active'
                    : 'text-surface-300 hover:text-white hover:bg-surface-800'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={clsx('flex-shrink-0 transition-colors', isActive ? 'text-primary-400' : 'text-surface-400 group-hover:text-white')} size={18} />
                {!collapsed && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span className={clsx(
                    'ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full',
                    item.badge && parseInt(item.badge) > 0
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-primary-500/20 text-primary-400'
                  )}>
                    {item.badge}
                  </span>
                )}
                {collapsed && item.badge && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
                )}
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-surface-800">
            {!collapsed && (
              <div className="px-2 pb-2 text-xs font-semibold text-surface-300 uppercase tracking-wider">
                Tools
              </div>
            )}
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={clsx(
                    'w-full flex items-center rounded-lg transition-all duration-150 group',
                    collapsed ? 'md:justify-center md:p-2.5 gap-3 px-3 py-2.5' : 'gap-3 px-3 py-2.5',
                    isActive
                      ? 'bg-primary-600/20 text-primary-400'
                      : 'text-surface-300 hover:text-white hover:bg-surface-800'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={clsx('flex-shrink-0', isActive ? 'text-primary-400' : 'text-surface-400 group-hover:text-white')} size={18} />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Profile */}
        {!collapsed && (
          <div className="p-3 border-t border-surface-800">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-surface-800 cursor-pointer transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-violet flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                AB
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white truncate">Al Boss Rawi</div>
                <div className="text-xs text-surface-400 truncate">Logistics Manager</div>
              </div>
            </div>
          </div>
        )}

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 w-6 h-6 bg-surface-800 border border-surface-700 rounded-full hidden md:flex items-center justify-center text-surface-400 hover:text-white hover:bg-surface-700 transition-all z-10"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>
    </>
  );
}
