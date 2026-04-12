import { useState } from 'react';
import { Search, Package, MapPin, ChevronRight, CheckCircle, Truck, AlertTriangle, X } from 'lucide-react';
import { clsx } from 'clsx';
import { shipments } from '../data/mockData';
import type { Shipment, ShipmentStatus } from '../types';
import { useAppStore } from '../store/appStore';

const statusConfig: Record<ShipmentStatus, { label: string; color: string; bg: string; dot: string }> = {
  delivered:        { label: 'Delivered',         color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-500' },
  in_transit:       { label: 'In Transit',         color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20',       dot: 'bg-blue-500' },
  out_for_delivery: { label: 'Out for Delivery',   color: 'text-cyan-400',   bg: 'bg-cyan-500/10 border-cyan-500/20',       dot: 'bg-cyan-500' },
  delayed:          { label: 'Delayed',            color: 'text-rose-400',   bg: 'bg-rose-500/10 border-rose-500/20',       dot: 'bg-rose-500' },
  pending:          { label: 'Pending',            color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20',     dot: 'bg-amber-500' },
  exception:        { label: 'Exception',          color: 'text-rose-400',   bg: 'bg-rose-500/10 border-rose-500/20',       dot: 'bg-rose-500' },
};

const priorityConfig: Record<string, string> = {
  low:      'text-surface-400',
  medium:   'text-blue-400',
  high:     'text-amber-400',
  critical: 'text-rose-400',
};

function ProgressBar({ value, status }: { value: number; status: ShipmentStatus }) {
  const colors: Record<ShipmentStatus, string> = {
    delivered: 'bg-emerald-500',
    in_transit: 'bg-blue-500',
    out_for_delivery: 'bg-cyan-500',
    delayed: 'bg-rose-500',
    pending: 'bg-amber-500',
    exception: 'bg-rose-500',
  };
  return (
    <div className="w-full bg-surface-700 rounded-full h-1.5">
      <div className={clsx('h-1.5 rounded-full transition-all', colors[status])} style={{ width: `${value}%` }} />
    </div>
  );
}

function ShipmentDetail({ shipment, onClose }: { shipment: Shipment; onClose: () => void }) {
  const cfg = statusConfig[shipment.status];
  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-surface-900 border-l border-surface-800 z-50 flex flex-col shadow-2xl animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-surface-800">
        <div>
          <h2 className="font-bold text-white">{shipment.trackingNumber}</h2>
          <p className="text-xs text-surface-400 mt-0.5">PO: {shipment.poNumber} • {shipment.customer}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Status & Progress */}
        <div className={clsx('p-4 rounded-xl border', cfg.bg)}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={clsx('w-2 h-2 rounded-full', cfg.dot)} />
              <span className={clsx('font-semibold text-sm', cfg.color)}>{cfg.label}</span>
            </div>
            <span className="text-sm font-bold text-white">{shipment.progress}%</span>
          </div>
          <ProgressBar value={shipment.progress} status={shipment.status} />
          <div className="flex justify-between mt-2 text-xs text-surface-400">
            <span>{shipment.origin.city}</span>
            <span>{shipment.destination.city}</span>
          </div>
        </div>

        {/* Route Visual */}
        <div className="bg-surface-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Route</h3>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="w-8 h-8 bg-primary-500/20 border border-primary-500/30 rounded-full flex items-center justify-center">
                <MapPin size={14} className="text-primary-400" />
              </div>
              <div className="text-xs text-surface-300 mt-1 font-medium">{shipment.origin.city}</div>
              <div className="text-xs text-surface-500">{shipment.origin.country}</div>
            </div>
            <div className="flex-1 relative">
              <div className="h-px bg-surface-600 w-full" />
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-accent-cyan h-px"
                style={{ width: `${shipment.progress}%` }}
              />
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${shipment.progress}%` }}>
                <div className="w-3 h-3 bg-white border-2 border-primary-500 rounded-full shadow" />
              </div>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-surface-700 border border-surface-600 rounded-full flex items-center justify-center">
                <MapPin size={14} className="text-surface-400" />
              </div>
              <div className="text-xs text-surface-300 mt-1 font-medium">{shipment.destination.city}</div>
              <div className="text-xs text-surface-500">{shipment.destination.country}</div>
            </div>
          </div>
          <div className="text-center mt-2">
            <span className="text-xs text-surface-400">Currently at: </span>
            <span className="text-xs font-medium text-white">{shipment.currentLocation.city}</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Carrier', value: shipment.carrier },
            { label: 'Priority', value: shipment.priority.toUpperCase(), color: priorityConfig[shipment.priority] },
            { label: 'ETA', value: shipment.eta },
            { label: 'Category', value: shipment.category },
            { label: 'Weight', value: `${shipment.weight.toLocaleString()} kg` },
            { label: 'Value', value: `$${shipment.value.toLocaleString()}` },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-surface-800 rounded-lg p-3">
              <div className="text-xs text-surface-400 mb-1">{label}</div>
              <div className={clsx('text-sm font-semibold', color || 'text-white')}>{value}</div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Tracking History</h3>
          <div className="space-y-0">
            {shipment.events.map((event, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={clsx(
                    'w-3 h-3 rounded-full flex-shrink-0 border-2 mt-1',
                    i === 0 ? 'border-primary-500 bg-primary-500' : 'border-surface-600 bg-surface-800'
                  )} />
                  {i < shipment.events.length - 1 && <div className="w-px flex-1 bg-surface-700 my-1" />}
                </div>
                <div className={clsx('pb-4', i === shipment.events.length - 1 && 'pb-0')}>
                  <div className="text-xs text-surface-400">
                    {new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-sm font-medium text-white mt-0.5">{event.description}</div>
                  <div className="text-xs text-surface-500 mt-0.5">{event.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Shipments() {
  const { selectedShipment, setSelectedShipment } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'all'>('all');

  const filtered = shipments.filter((s) => {
    const matchSearch = !search ||
      s.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.origin.city.toLowerCase().includes(search.toLowerCase()) ||
      s.destination.city.toLowerCase().includes(search.toLowerCase()) ||
      s.customer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeDetail = selectedShipment ? shipments.find((s) => s.id === selectedShipment) : null;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Active', value: '6', icon: Package, color: 'text-blue-400 bg-blue-500/10' },
          { label: 'In Transit', value: '2', icon: Truck, color: 'text-cyan-400 bg-cyan-500/10' },
          { label: 'Delayed', value: '1', icon: AlertTriangle, color: 'text-rose-400 bg-rose-500/10' },
          { label: 'Delivered Today', value: '1', icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/10' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-surface-900 border border-surface-800 rounded-xl p-4 flex items-center gap-3">
            <div className={clsx('p-2.5 rounded-xl', color)}>
              <Icon size={18} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-surface-400">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-surface-900 border border-surface-800 rounded-lg px-3 py-2 flex-1 min-w-48">
          <Search size={15} className="text-surface-400 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tracking #, city, customer..."
            className="bg-transparent text-sm text-white placeholder-surface-500 outline-none w-full"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'in_transit', 'delayed', 'out_for_delivery', 'delivered', 'pending'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                statusFilter === s
                  ? 'bg-primary-600 border-primary-500 text-white'
                  : 'bg-surface-900 border-surface-800 text-surface-400 hover:text-white hover:border-surface-700'
              )}
            >
              {s === 'all' ? 'All' : statusConfig[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-800">
                {['Tracking #', 'Route', 'Carrier', 'Status', 'Priority', 'Progress', 'ETA', 'Value', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/50">
              {filtered.map((s) => {
                const cfg = statusConfig[s.status];
                return (
                  <tr
                    key={s.id}
                    onClick={() => setSelectedShipment(s.id)}
                    className={clsx(
                      'hover:bg-surface-800/50 cursor-pointer transition-colors group',
                      selectedShipment === s.id && 'bg-primary-500/5 border-l-2 border-l-primary-500'
                    )}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-primary-400 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-white">{s.trackingNumber}</div>
                          <div className="text-xs text-surface-500">{s.customer}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-sm text-white">{s.origin.city}</div>
                      <div className="flex items-center gap-1 text-xs text-surface-500">
                        <span>→</span>
                        <span>{s.destination.city}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-surface-300 whitespace-nowrap">{s.carrier}</td>
                    <td className="px-4 py-3.5">
                      <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap', cfg.bg, cfg.color)}>
                        <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={clsx('text-xs font-semibold uppercase', priorityConfig[s.priority])}>
                        {s.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 min-w-28">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <ProgressBar value={s.progress} status={s.status} />
                        </div>
                        <span className="text-xs text-surface-400 whitespace-nowrap">{s.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-surface-300 whitespace-nowrap">{s.eta}</td>
                    <td className="px-4 py-3.5 text-sm text-white font-medium whitespace-nowrap">
                      ${s.value.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <ChevronRight size={16} className="text-surface-600 group-hover:text-surface-400 transition-colors" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-surface-500">
            No shipments found matching your filters.
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {activeDetail && (
        <ShipmentDetail shipment={activeDetail} onClose={() => setSelectedShipment(null)} />
      )}
    </div>
  );
}
