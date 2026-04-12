import { clsx } from 'clsx';
import {
  LayoutDashboard, Package, Warehouse, TruckIcon, BarChart3,
  BrainCircuit, Map, Settings, ChevronLeft, ChevronRight,
  Zap, Globe, Route
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';

const navItems = [
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

export function Sidebar() {
  const { activePage, sidebarCollapsed, setActivePage, toggleSidebar } = useAppStore();

  return (
    <aside
      className={clsx(
        'relative flex flex-col h-full bg-surface-900 border-r border-surface-800 transition-all duration-300 ease-in-out flex-shrink-0',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={clsx(
        'flex items-center h-16 px-4 border-b border-surface-800',
        sidebarCollapsed ? 'justify-center' : 'gap-3'
      )}>
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center shadow-glow-blue">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent-emerald rounded-full border border-surface-900" />
        </div>
        {!sidebarCollapsed && (
          <div className="animate-fade-in">
            <div className="text-sm font-bold text-white leading-tight">LogisticAI</div>
            <div className="text-xs text-surface-300 leading-tight">Command Center</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-0.5 px-2">
        {!sidebarCollapsed && (
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
                sidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                isActive
                  ? 'bg-primary-600/20 text-primary-400 sidebar-item-active'
                  : 'text-surface-300 hover:text-white hover:bg-surface-800'
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon className={clsx('flex-shrink-0 transition-colors', isActive ? 'text-primary-400' : 'text-surface-400 group-hover:text-white')} size={18} />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
              {!sidebarCollapsed && item.badge && (
                <span className={clsx(
                  'ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full',
                  item.badge && parseInt(item.badge) > 0
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-primary-500/20 text-primary-400'
                )}>
                  {item.badge}
                </span>
              )}
              {sidebarCollapsed && item.badge && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </button>
          );
        })}

        <div className="pt-4 mt-4 border-t border-surface-800">
          {!sidebarCollapsed && (
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
                  sidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                  isActive
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'text-surface-300 hover:text-white hover:bg-surface-800'
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={clsx('flex-shrink-0', isActive ? 'text-primary-400' : 'text-surface-400 group-hover:text-white')} size={18} />
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      {!sidebarCollapsed && (
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

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 bg-surface-800 border border-surface-700 rounded-full flex items-center justify-center text-surface-400 hover:text-white hover:bg-surface-700 transition-all z-10"
      >
        {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
