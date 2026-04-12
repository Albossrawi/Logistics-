import { TrendingUp, TrendingDown, Star } from 'lucide-react';
import { clsx } from 'clsx';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { carriers } from '../data/mockData';
import { useState } from 'react';
import type { Carrier } from '../types';

const modeColors: Record<string, string> = {
  air: 'bg-sky-500/20 text-sky-400',
  sea: 'bg-blue-500/20 text-blue-400',
  road: 'bg-amber-500/20 text-amber-400',
  rail: 'bg-violet-500/20 text-violet-400',
};

const carrierColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#06b6d4'];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          className={s <= Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-surface-600'}
        />
      ))}
      <span className="text-xs text-surface-400 ml-1">{rating}</span>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-surface-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.fill || p.color }}>{p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong></p>
      ))}
    </div>
  );
};

export function Carriers() {
  const [selected, setSelected] = useState<Carrier | null>(carriers[0]);

  const radarData = selected ? [
    { metric: 'On-Time', value: selected.onTimeRate },
    { metric: 'Rating', value: selected.rating * 20 },
    { metric: 'Coverage', value: selected.coverage.length * 25 },
    { metric: 'Reliability', value: 100 - (selected.incidents / selected.totalShipments * 1000) },
    { metric: 'Value', value: Math.max(0, 100 - selected.costPerKg * 10) },
  ] : [];

  const comparisonData = carriers.map((c) => ({
    name: c.name.split(' ')[0],
    onTime: c.onTimeRate,
    rating: c.rating * 20,
    activeShipments: c.activeShipments,
  }));

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Carriers', value: carriers.length, color: 'text-blue-400 bg-blue-500/10' },
          { label: 'Avg On-Time Rate', value: `${(carriers.reduce((s, c) => s + c.onTimeRate, 0) / carriers.length).toFixed(1)}%`, color: 'text-emerald-400 bg-emerald-500/10' },
          { label: 'Total Active Shipments', value: carriers.reduce((s, c) => s + c.activeShipments, 0), color: 'text-cyan-400 bg-cyan-500/10' },
          { label: 'Total Incidents (MTD)', value: carriers.reduce((s, c) => s + c.incidents, 0), color: 'text-amber-400 bg-amber-500/10' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-surface-900 border border-surface-800 rounded-xl p-4">
            <div className={clsx('text-2xl font-bold mb-1', color.split(' ')[0])}>{value}</div>
            <div className="text-xs text-surface-400">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Carrier Cards */}
        <div className="xl:col-span-2 space-y-3">
          {carriers.map((carrier, idx) => {
            const isSelected = selected?.id === carrier.id;
            return (
              <div
                key={carrier.id}
                onClick={() => setSelected(carrier)}
                className={clsx(
                  'bg-surface-900 border rounded-xl p-5 cursor-pointer transition-all',
                  isSelected ? 'border-primary-500/50 bg-primary-500/5' : 'border-surface-800 hover:border-surface-700'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {/* Logo */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                      style={{ background: carrierColors[idx % carrierColors.length] + '33', border: `1px solid ${carrierColors[idx % carrierColors.length]}44` }}
                    >
                      <span style={{ color: carrierColors[idx % carrierColors.length] }}>{carrier.logo}</span>
                    </div>
                    <div>
                      <div className="font-bold text-white">{carrier.name}</div>
                      <StarRating rating={carrier.rating} />
                      <div className="flex gap-1.5 mt-1.5">
                        {carrier.modes.map((m) => (
                          <span key={m} className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', modeColors[m])}>{m}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* On-time gauge */}
                  <div className="text-right">
                    <div className={clsx('text-2xl font-bold', carrier.onTimeRate >= 95 ? 'text-emerald-400' : carrier.onTimeRate >= 90 ? 'text-amber-400' : 'text-rose-400')}>
                      {carrier.onTimeRate}%
                    </div>
                    <div className="text-xs text-surface-400">On-time delivery</div>
                    <div className={clsx('flex items-center justify-end gap-1 mt-1 text-xs',
                      carrier.trend > 0 ? 'text-emerald-400' : 'text-rose-400'
                    )}>
                      {carrier.trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {Math.abs(carrier.trend)}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-surface-800">
                  {[
                    { label: 'Avg Transit', value: `${carrier.avgTransitDays}d` },
                    { label: 'Cost/kg', value: `$${carrier.costPerKg}` },
                    { label: 'Active', value: carrier.activeShipments },
                    { label: 'Incidents', value: carrier.incidents },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <div className="text-sm font-bold text-white">{value}</div>
                      <div className="text-xs text-surface-500">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Coverage */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {carrier.coverage.map((region) => (
                    <span key={region} className="text-xs text-surface-400 bg-surface-800 px-2 py-0.5 rounded-full">{region}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Radar Chart */}
          {selected && (
            <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-1">{selected.name} — Performance</h3>
              <p className="text-xs text-surface-400 mb-4">Multi-dimensional analysis</p>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(148,163,184,0.1)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Comparison Chart */}
          <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-1">On-Time Comparison</h3>
            <p className="text-xs text-surface-400 mb-4">All carriers vs target (95%)</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={comparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.07)" horizontal={false} />
                <XAxis type="number" domain={[80, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="onTime" name="On-Time %" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
