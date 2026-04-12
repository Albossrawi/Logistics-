import { useState } from 'react';
import { MapPin, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { supplyChainNodes, shipments } from '../data/mockData';
import type { SupplyChainNode } from '../types';

const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
  supplier:            { label: 'Supplier',         color: 'text-violet-400', bg: 'bg-violet-500/20 border-violet-500/30' },
  warehouse:           { label: 'Warehouse',         color: 'text-blue-400',   bg: 'bg-blue-500/20 border-blue-500/30' },
  distribution_center: { label: 'Distribution',     color: 'text-cyan-400',   bg: 'bg-cyan-500/20 border-cyan-500/30' },
  port:                { label: 'Port',              color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30' },
  customer:            { label: 'Customer',          color: 'text-amber-400',  bg: 'bg-amber-500/20 border-amber-500/30' },
};

const statusConfig: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; color: string }> = {
  operational: { icon: CheckCircle,   color: 'text-emerald-400' },
  warning:     { icon: AlertTriangle, color: 'text-amber-400' },
  critical:    { icon: AlertTriangle, color: 'text-rose-400' },
  offline:     { icon: XCircle,       color: 'text-surface-500' },
};

function WorldMapSVG({ nodes, selected, onSelect }: {
  nodes: SupplyChainNode[];
  selected: SupplyChainNode | null;
  onSelect: (n: SupplyChainNode) => void;
}) {
  // Map lat/lng to SVG viewport (approximate world map projection)
  const project = (lat: number, lng: number): [number, number] => {
    const x = ((lng + 180) / 360) * 900;
    const y = ((90 - lat) / 180) * 450;
    return [x, y];
  };

  const nodeColor: Record<string, string> = {
    operational: '#10b981',
    warning:     '#f59e0b',
    critical:    '#f43f5e',
    offline:     '#475569',
  };

  // Draw connections between nodes (simplified supply chain links)
  const connections: [string, string][] = [
    ['N001', 'N004'], ['N001', 'N008'], ['N002', 'N008'], ['N002', 'N004'],
    ['N003', 'N010'], ['N003', 'N006'], ['N006', 'N007'], ['N007', 'N009'],
    ['N009', 'N007'], ['N008', 'N004'], ['N004', 'N005'], ['N005', 'N010'],
  ];

  return (
    <div className="relative w-full bg-surface-800 rounded-xl overflow-hidden border border-surface-700" style={{ height: 420 }}>
      <svg
        viewBox="0 0 900 450"
        className="w-full h-full"
        style={{ background: 'linear-gradient(180deg, #0c1829 0%, #0f172a 100%)' }}
      >
        {/* Subtle grid */}
        <defs>
          <pattern id="grid" width="60" height="45" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 45" fill="none" stroke="rgba(148,163,184,0.04)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="900" height="450" fill="url(#grid)" />

        {/* Simplified continent outlines */}
        {/* North America */}
        <path d="M 50 80 L 220 70 L 230 110 L 200 160 L 150 200 L 100 190 L 60 150 Z" fill="rgba(30,41,59,0.8)" stroke="rgba(71,85,105,0.3)" strokeWidth="1" />
        {/* South America */}
        <path d="M 160 220 L 220 210 L 240 280 L 220 360 L 180 380 L 150 320 L 140 260 Z" fill="rgba(30,41,59,0.8)" stroke="rgba(71,85,105,0.3)" strokeWidth="1" />
        {/* Europe */}
        <path d="M 420 60 L 520 55 L 530 100 L 490 130 L 440 120 L 410 95 Z" fill="rgba(30,41,59,0.8)" stroke="rgba(71,85,105,0.3)" strokeWidth="1" />
        {/* Africa */}
        <path d="M 430 140 L 520 130 L 540 220 L 510 320 L 460 340 L 420 280 L 400 200 Z" fill="rgba(30,41,59,0.8)" stroke="rgba(71,85,105,0.3)" strokeWidth="1" />
        {/* Asia */}
        <path d="M 530 50 L 780 45 L 800 130 L 750 170 L 640 180 L 560 150 L 530 100 Z" fill="rgba(30,41,59,0.8)" stroke="rgba(71,85,105,0.3)" strokeWidth="1" />
        {/* Australia */}
        <path d="M 720 280 L 820 275 L 830 340 L 790 370 L 730 355 L 710 315 Z" fill="rgba(30,41,59,0.8)" stroke="rgba(71,85,105,0.3)" strokeWidth="1" />

        {/* Supply chain connections */}
        {connections.map(([fromId, toId]) => {
          const from = nodes.find((n) => n.id === fromId);
          const to = nodes.find((n) => n.id === toId);
          if (!from || !to) return null;
          const [x1, y1] = project(from.lat, from.lng);
          const [x2, y2] = project(to.lat, to.lng);
          const isActive = selected?.id === fromId || selected?.id === toId;
          return (
            <line
              key={`${fromId}-${toId}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isActive ? 'rgba(59,130,246,0.6)' : 'rgba(59,130,246,0.15)'}
              strokeWidth={isActive ? 1.5 : 0.8}
              strokeDasharray={isActive ? '5,3' : '3,3'}
            />
          );
        })}

        {/* Active shipment paths */}
        {shipments.filter(s => s.status === 'in_transit').map((s) => {
          const [x1, y1] = project(s.origin.lat, s.origin.lng);
          const [x2, y2] = project(s.destination.lat, s.destination.lng);
          const [xc, yc] = project(s.currentLocation.lat, s.currentLocation.lng);
          return (
            <g key={s.id}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(6,182,212,0.1)" strokeWidth="1" />
              <circle cx={xc} cy={yc} r="4" fill="#06b6d4" opacity="0.9">
                <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.9;0.5;0.9" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const [x, y] = project(node.lat, node.lng);
          const color = nodeColor[node.status];
          const isSelected = selected?.id === node.id;
          const utilPct = node.utilization || 0;
          return (
            <g key={node.id} onClick={() => onSelect(node)} style={{ cursor: 'pointer' }}>
              {isSelected && (
                <circle cx={x} cy={y} r="16" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5">
                  <animate attributeName="r" values="16;20;16" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0.2;0.5" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={x} cy={y} r={isSelected ? 10 : 8} fill={color + '33'} stroke={color} strokeWidth="1.5" />
              <circle cx={x} cy={y} r={isSelected ? 5 : 3.5} fill={color} />
              {/* Utilization arc */}
              <text x={x + 12} y={y - 10} fill="rgba(203,213,225,0.8)" fontSize="9" fontFamily="Inter, sans-serif">
                {node.city}
              </text>
              <text x={x + 12} y={y} fill={color} fontSize="8" fontFamily="Inter, sans-serif">
                {utilPct}%
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-3">
        {[
          { color: '#10b981', label: 'Operational' },
          { color: '#f59e0b', label: 'Warning' },
          { color: '#f43f5e', label: 'Critical' },
          { color: '#06b6d4', label: 'Active Shipment' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 bg-surface-900/80 backdrop-blur rounded-lg px-2 py-1">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-xs text-surface-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SupplyChain() {
  const [selected, setSelected] = useState<SupplyChainNode | null>(null);

  const operational = supplyChainNodes.filter((n) => n.status === 'operational').length;
  const warning = supplyChainNodes.filter((n) => n.status === 'warning').length;
  const avgUtilization = Math.round(supplyChainNodes.reduce((s, n) => s + (n.utilization || 0), 0) / supplyChainNodes.length);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Nodes', value: supplyChainNodes.length, color: 'text-blue-400', sub: 'Global network' },
          { label: 'Operational', value: operational, color: 'text-emerald-400', sub: 'Fully running' },
          { label: 'Warnings', value: warning, color: 'text-amber-400', sub: 'Need attention' },
          { label: 'Avg Utilization', value: `${avgUtilization}%`, color: 'text-cyan-400', sub: 'Network load' },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="bg-surface-900 border border-surface-800 rounded-xl p-4">
            <div className={clsx('text-2xl font-bold', color)}>{value}</div>
            <div className="text-sm text-surface-300 font-medium">{label}</div>
            <div className="text-xs text-surface-500">{sub}</div>
          </div>
        ))}
      </div>

      {/* Map */}
      <WorldMapSVG nodes={supplyChainNodes} selected={selected} onSelect={setSelected} />

      {/* Node Detail + List */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Node List */}
        <div className="xl:col-span-2 bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-800">
            <h3 className="font-semibold text-white">Network Nodes</h3>
          </div>
          <div className="divide-y divide-surface-800/50">
            {supplyChainNodes.map((node) => {
              const tc = typeConfig[node.type];
              const sc = statusConfig[node.status];
              const StatusIcon = sc.icon;
              const utilPct = node.utilization || 0;
              const isHigh = utilPct > 85;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelected(node)}
                  className={clsx(
                    'flex items-center gap-4 px-5 py-3.5 hover:bg-surface-800/50 cursor-pointer transition-colors',
                    selected?.id === node.id && 'bg-primary-500/5 border-l-2 border-l-primary-500'
                  )}
                >
                  <StatusIcon size={16} className={sc.color} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">{node.name}</span>
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full border', tc.bg, tc.color)}>
                        {tc.label}
                      </span>
                    </div>
                    <div className="text-xs text-surface-500 mt-0.5">{node.city}, {node.country}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={clsx('text-sm font-bold', isHigh ? 'text-amber-400' : 'text-white')}>
                      {utilPct}%
                    </div>
                    <div className="text-xs text-surface-500">utilization</div>
                  </div>
                  <div className="w-16">
                    <div className="w-full bg-surface-700 rounded-full h-1.5">
                      <div
                        className={clsx('h-1.5 rounded-full', isHigh ? 'bg-amber-500' : 'bg-primary-500')}
                        style={{ width: `${utilPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Node Detail */}
        {selected ? (
          <div className="bg-surface-900 border border-surface-800 rounded-xl p-5 h-fit">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-white">{selected.name}</h3>
                <p className="text-xs text-surface-500 mt-0.5">{selected.city}, {selected.country}</p>
              </div>
              <span className={clsx('text-xs px-2 py-1 rounded-full border', typeConfig[selected.type]?.bg, typeConfig[selected.type]?.color)}>
                {typeConfig[selected.type]?.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { k: 'Status', v: selected.status, color: statusConfig[selected.status]?.color },
                { k: 'Throughput', v: `${selected.throughput.toLocaleString()} units` },
                { k: 'Capacity', v: `${selected.capacity?.toLocaleString()} units` },
                { k: 'Utilization', v: `${selected.utilization}%` },
                { k: 'Latitude', v: selected.lat.toFixed(4) },
                { k: 'Longitude', v: selected.lng.toFixed(4) },
              ].map(({ k, v, color }) => (
                <div key={k} className="bg-surface-800 rounded-lg p-2.5">
                  <div className="text-surface-500 mb-1">{k}</div>
                  <div className={clsx('font-semibold', color || 'text-white')}>{v}</div>
                </div>
              ))}
            </div>

            {/* Util bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-surface-400">Capacity Utilization</span>
                <span className={clsx('font-bold', (selected.utilization || 0) > 85 ? 'text-amber-400' : 'text-emerald-400')}>
                  {selected.utilization}%
                </span>
              </div>
              <div className="w-full bg-surface-700 rounded-full h-2.5">
                <div
                  className={clsx('h-2.5 rounded-full transition-all', (selected.utilization || 0) > 85 ? 'bg-amber-500' : 'bg-emerald-500')}
                  style={{ width: `${selected.utilization}%` }}
                />
              </div>
            </div>

            {selected.status === 'warning' && (
              <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-400">
                <AlertTriangle size={12} className="inline mr-1.5" />
                High utilization alert. Consider rerouting shipments or increasing capacity.
              </div>
            )}
          </div>
        ) : (
          <div className="bg-surface-900 border border-surface-800 rounded-xl p-5 flex items-center justify-center h-48">
            <div className="text-center">
              <MapPin size={32} className="text-surface-600 mx-auto mb-2" />
              <p className="text-sm text-surface-400">Click a node on the map or list to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
