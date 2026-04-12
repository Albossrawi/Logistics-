import { useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Package, Search } from 'lucide-react';
import { clsx } from 'clsx';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Line, Area, AreaChart
} from 'recharts';
import { inventoryItems, demandForecastData } from '../data/mockData';
import type { InventoryItem } from '../types';

function StockLevel({ item }: { item: InventoryItem }) {
  const pct = Math.min((item.quantity / item.maxStock) * 100, 100);
  const isCritical = item.quantity <= item.minStock;
  const isLow = item.quantity <= item.reorderPoint && !isCritical;
  const color = isCritical ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className={clsx(isCritical ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-emerald-400', 'font-semibold')}>
          {item.quantity.toLocaleString()}
        </span>
        <span className="text-surface-500">/ {item.maxStock.toLocaleString()}</span>
      </div>
      <div className="w-full bg-surface-700 rounded-full h-1.5">
        <div className={clsx('h-1.5 rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-surface-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        p.value !== null && <p key={i} style={{ color: p.color || p.stroke }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

export function Inventory() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = ['all', ...Array.from(new Set(inventoryItems.map((i) => i.category)))];

  const filtered = inventoryItems.filter((item) => {
    const matchSearch = !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const criticalItems = inventoryItems.filter((i) => i.quantity <= i.minStock);
  const lowItems = inventoryItems.filter((i) => i.quantity <= i.reorderPoint && i.quantity > i.minStock);
  const totalValue = inventoryItems.reduce((sum, i) => sum + i.totalValue, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total SKUs', value: inventoryItems.length, color: 'text-blue-400 bg-blue-500/10', sub: 'Active items' },
          { label: 'Critical Stock', value: criticalItems.length, color: 'text-rose-400 bg-rose-500/10', sub: 'Below minimum' },
          { label: 'Low Stock', value: lowItems.length, color: 'text-amber-400 bg-amber-500/10', sub: 'Reorder needed' },
          { label: 'Total Value', value: `$${(totalValue / 1000).toFixed(0)}K`, color: 'text-emerald-400 bg-emerald-500/10', sub: 'Inventory value' },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="bg-surface-900 border border-surface-800 rounded-xl p-4">
            <div className={clsx('inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3', color)}>
              <Package size={18} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-sm text-surface-300 font-medium">{label}</div>
            <div className="text-xs text-surface-500">{sub}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {criticalItems.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-rose-400" />
            <span className="text-sm font-semibold text-rose-300">Critical Stock Levels — Immediate Action Required</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {criticalItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className="flex items-center gap-2 bg-rose-500/20 border border-rose-500/30 rounded-lg px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-500/30 transition-colors"
              >
                <span className="font-semibold">{item.sku}</span>
                <span className="text-rose-400/70">— {item.daysOfStock}d remaining</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Main Table */}
        <div className="xl:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-surface-900 border border-surface-800 rounded-lg px-3 py-2 flex-1 min-w-48">
              <Search size={14} className="text-surface-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or SKU..."
                className="bg-transparent text-sm text-white placeholder-surface-500 outline-none w-full"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                    categoryFilter === cat
                      ? 'bg-primary-600 border-primary-500 text-white'
                      : 'bg-surface-900 border-surface-800 text-surface-400 hover:text-white'
                  )}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-800">
                    {['SKU / Name', 'Category', 'Warehouse', 'Stock Level', 'Days Left', 'Turnover', 'Value', 'Trend'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800/50">
                  {filtered.map((item) => {
                    const isCritical = item.quantity <= item.minStock;
                    const isLow = item.quantity <= item.reorderPoint && !isCritical;
                    const TrendIcon = item.trend === 'up' ? TrendingUp : item.trend === 'down' ? TrendingDown : Minus;
                    const trendColor = item.trend === 'up' ? 'text-emerald-400' : item.trend === 'down' ? 'text-rose-400' : 'text-surface-400';
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelected(item)}
                        className={clsx(
                          'hover:bg-surface-800/50 cursor-pointer transition-colors',
                          selected?.id === item.id && 'bg-primary-500/5',
                          isCritical && 'bg-rose-500/5'
                        )}
                      >
                        <td className="px-4 py-3.5">
                          <div className="text-sm font-semibold text-white">{item.name}</div>
                          <div className="text-xs text-surface-500 font-mono">{item.sku}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs bg-surface-800 px-2 py-1 rounded-lg text-surface-300">{item.category}</span>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-surface-300 whitespace-nowrap">{item.warehouse}</td>
                        <td className="px-4 py-3.5 min-w-32"><StockLevel item={item} /></td>
                        <td className="px-4 py-3.5">
                          <span className={clsx('text-sm font-bold', isCritical ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-white')}>
                            {item.daysOfStock}d
                          </span>
                          {isCritical && <div className="text-xs text-rose-400">CRITICAL</div>}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-surface-300 whitespace-nowrap">{item.turnoverRate}x</td>
                        <td className="px-4 py-3.5 text-sm font-medium text-white whitespace-nowrap">
                          ${(item.totalValue / 1000).toFixed(0)}K
                        </td>
                        <td className="px-4 py-3.5">
                          <TrendIcon size={16} className={trendColor} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {selected ? (
            <>
              {/* Item Detail */}
              <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-white">{selected.name}</h3>
                    <p className="text-xs text-surface-500 font-mono mt-0.5">{selected.sku}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-surface-500 hover:text-white transition-colors text-xs">×</button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  {[
                    { k: 'Warehouse', v: selected.warehouse },
                    { k: 'Supplier', v: selected.supplier },
                    { k: 'Unit Cost', v: `$${selected.unitCost}` },
                    { k: 'Total Value', v: `$${selected.totalValue.toLocaleString()}` },
                    { k: 'Reorder At', v: selected.reorderPoint.toLocaleString() },
                    { k: 'Last Restocked', v: selected.lastRestocked },
                  ].map(({ k, v }) => (
                    <div key={k} className="bg-surface-800 rounded-lg p-2">
                      <div className="text-surface-500">{k}</div>
                      <div className="text-white font-medium mt-0.5 truncate">{v}</div>
                    </div>
                  ))}
                </div>

                {/* Forecast */}
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">AI Demand Forecast</div>
                  <div className="flex justify-between">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{selected.forecast7d.toLocaleString()}</div>
                      <div className="text-xs text-surface-500">7-day forecast</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{selected.forecast30d.toLocaleString()}</div>
                      <div className="text-xs text-surface-500">30-day forecast</div>
                    </div>
                    <div className="text-center">
                      <div className={clsx('text-lg font-bold', selected.daysOfStock < 14 ? 'text-rose-400' : 'text-emerald-400')}>
                        {selected.daysOfStock}d
                      </div>
                      <div className="text-xs text-surface-500">Days of stock</div>
                    </div>
                  </div>
                </div>

                {(selected.quantity <= selected.reorderPoint) && (
                  <button className="w-full mt-4 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
                    Place Reorder
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="bg-surface-900 border border-surface-800 rounded-xl p-5 text-center">
              <Package size={40} className="text-surface-600 mx-auto mb-2" />
              <p className="text-sm text-surface-400">Select an item to view details and forecast</p>
            </div>
          )}

          {/* Demand Forecast Chart */}
          <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-white">Demand Forecast — April</h3>
              <p className="text-xs text-surface-400 mt-0.5">Actual vs AI prediction with confidence band</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={demandForecastData.slice(0, 20)}>
                <defs>
                  <linearGradient id="confBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.07)" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="upper" name="Upper" stroke="none" fill="url(#confBand)" dot={false} />
                <Area type="monotone" dataKey="lower" name="Lower" stroke="none" fill="#0f172a" dot={false} />
                <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="actual" name="Actual" stroke="#10b981" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-xs">
              <div className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-emerald-500 inline-block" />Actual</div>
              <div className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-blue-500 border-dashed inline-block" />Forecast</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
