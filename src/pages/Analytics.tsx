import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ComposedChart
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Package, Clock, Target } from 'lucide-react';
import { clsx } from 'clsx';
import { weeklyVolumeData, carriers } from '../data/mockData';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-surface-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        p.value !== null && <p key={i} style={{ color: p.color || p.stroke || p.fill }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(p.value < 10 ? 1 : 0) : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// Generate more analytics data
const quarterlyData = [
  { q: 'Q1 2025', revenue: 4.2, cost: 2.8, profit: 1.4, shipments: 1840 },
  { q: 'Q2 2025', revenue: 4.8, cost: 2.9, profit: 1.9, shipments: 2100 },
  { q: 'Q3 2025', revenue: 5.1, cost: 2.7, profit: 2.4, shipments: 2320 },
  { q: 'Q4 2025', revenue: 6.2, cost: 3.1, profit: 3.1, shipments: 2890 },
  { q: 'Q1 2026', revenue: 5.8, cost: 2.85, profit: 2.95, shipments: 2650 },
  { q: 'Q2 2026 (proj)', revenue: 6.5, cost: 2.95, profit: 3.55, shipments: 3100 },
];

const regionData = [
  { region: 'Asia-Pacific', value: 38, color: '#3b82f6' },
  { region: 'North America', value: 28, color: '#10b981' },
  { region: 'Europe', value: 22, color: '#8b5cf6' },
  { region: 'Middle East', value: 8, color: '#f59e0b' },
  { region: 'Other', value: 4, color: '#64748b' },
];

const deliveryTimeData = Array.from({ length: 8 }, (_, i) => ({
  week: `W${i + 1}`,
  air: parseFloat((2.1 + Math.random() * 0.8).toFixed(1)),
  sea: parseFloat((19 + Math.random() * 4).toFixed(1)),
  road: parseFloat((3.2 + Math.random() * 1.2).toFixed(1)),
}));

export function Analytics() {
  const totalRevenue = quarterlyData.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue (YTD)', value: `$${totalRevenue.toFixed(1)}M`, change: '+18.4%', positive: true, icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/10' },
          { label: 'Shipments Completed', value: '10,800', change: '+12.1%', positive: true, icon: Package, color: 'text-blue-400 bg-blue-500/10' },
          { label: 'Avg Delivery Time', value: '4.2 days', change: '-0.8d', positive: true, icon: Clock, color: 'text-cyan-400 bg-cyan-500/10' },
          { label: 'SLA Achievement', value: '96.2%', change: '+1.4%', positive: true, icon: Target, color: 'text-violet-400 bg-violet-500/10' },
        ].map(({ label, value, change, positive, icon: Icon, color }) => (
          <div key={label} className="bg-surface-900 border border-surface-800 rounded-xl p-4">
            <div className={clsx('inline-flex p-2.5 rounded-xl mb-3', color)}>
              <Icon size={18} />
            </div>
            <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
            <div className="text-xs text-surface-400">{label}</div>
            <div className={clsx('flex items-center gap-1 mt-1.5 text-xs font-semibold', positive ? 'text-emerald-400' : 'text-rose-400')}>
              {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {change} vs last year
            </div>
          </div>
        ))}
      </div>

      {/* Revenue & Cost Trend */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-surface-900 border border-surface-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white">Revenue vs Cost Trend</h3>
              <p className="text-xs text-surface-400 mt-0.5">Quarterly overview ($M)</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 rounded inline-block" /> Revenue</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-rose-500 rounded inline-block" /> Cost</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-500 rounded inline-block" /> Profit</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={quarterlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="q" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="Revenue" fill="#10b981" fillOpacity={0.3} radius={[4, 4, 0, 0]} />
              <Bar dataKey="cost" name="Cost" fill="#f43f5e" fillOpacity={0.3} radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="profit" name="Profit" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Regional Split */}
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-white">Volume by Region</h3>
            <p className="text-xs text-surface-400 mt-0.5">Shipment distribution</p>
          </div>
          <div className="flex justify-center mb-4">
            <PieChart width={160} height={160}>
              <Pie data={regionData} cx={80} cy={80} innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                {regionData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </div>
          <div className="space-y-2">
            {regionData.map((item) => (
              <div key={item.region} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-xs text-surface-400">{item.region}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-surface-700 rounded-full h-1">
                    <div className="h-1 rounded-full" style={{ width: `${item.value * 2}%`, background: item.color }} />
                  </div>
                  <span className="text-xs font-semibold text-white w-8 text-right">{item.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Shipment Volume Weekly */}
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white">Weekly Shipment Volume</h3>
              <p className="text-xs text-surface-400 mt-0.5">Last 12 weeks</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyVolumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.07)" />
              <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="volume" name="Shipments" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Avg Transit by Mode */}
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-white">Avg Delivery Time by Mode</h3>
            <p className="text-xs text-surface-400 mt-0.5">Days — 8 week trend</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={deliveryTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.07)" />
              <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="air" name="Air (days)" stroke="#06b6d4" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="road" name="Road (days)" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Carrier Performance Table */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-800">
          <h3 className="font-semibold text-white">Carrier Performance Benchmark</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-800">
                {['Carrier', 'On-Time Rate', 'Avg Transit', 'Total Volume', 'Cost/kg', 'Incidents', 'Rating'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-surface-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/50">
              {carriers.sort((a, b) => b.onTimeRate - a.onTimeRate).map((c) => (
                <tr key={c.id} className="hover:bg-surface-800/30 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-white">{c.name}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-surface-700 rounded-full h-1.5">
                        <div
                          className={clsx('h-1.5 rounded-full', c.onTimeRate >= 95 ? 'bg-emerald-500' : c.onTimeRate >= 90 ? 'bg-amber-500' : 'bg-rose-500')}
                          style={{ width: `${c.onTimeRate}%` }}
                        />
                      </div>
                      <span className={clsx('text-sm font-bold', c.onTimeRate >= 95 ? 'text-emerald-400' : c.onTimeRate >= 90 ? 'text-amber-400' : 'text-rose-400')}>
                        {c.onTimeRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-surface-300">{c.avgTransitDays}d</td>
                  <td className="px-5 py-3.5 text-sm text-surface-300">{c.totalShipments.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-sm text-surface-300">${c.costPerKg}</td>
                  <td className="px-5 py-3.5">
                    <span className={clsx('text-sm font-bold', c.incidents > 20 ? 'text-rose-400' : c.incidents > 10 ? 'text-amber-400' : 'text-emerald-400')}>
                      {c.incidents}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400 text-sm">★</span>
                      <span className="text-sm font-bold text-white">{c.rating}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
