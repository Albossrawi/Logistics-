import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { Package, AlertTriangle, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { kpis, shipments, monthlyShipmentData, weeklyVolumeData, costBreakdownData, alerts } from '../data/mockData';
import { MetricCard } from '../components/dashboard/MetricCard';
import { useAppStore } from '../store/appStore';

const statusColors: Record<string, string> = {
  delivered: 'bg-emerald-500/20 text-emerald-400',
  in_transit: 'bg-blue-500/20 text-blue-400',
  out_for_delivery: 'bg-cyan-500/20 text-cyan-400',
  delayed: 'bg-rose-500/20 text-rose-400',
  pending: 'bg-amber-500/20 text-amber-400',
  exception: 'bg-rose-500/20 text-rose-400',
};

const statusLabels: Record<string, string> = {
  delivered: 'Delivered',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delayed: 'Delayed',
  pending: 'Pending',
  exception: 'Exception',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-surface-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

export function Dashboard() {
  const { setActivePage, setSelectedShipment } = useAppStore();
  const unreadAlerts = alerts.filter((a) => !a.read);
  const recentShipments = shipments.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <MetricCard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Volume Trend */}
        <div className="xl:col-span-2 bg-surface-900 border border-surface-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white">Shipment Volume & Costs</h3>
              <p className="text-xs text-surface-400 mt-0.5">12-week rolling view</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary-500 rounded inline-block" /> Volume</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-accent-emerald rounded inline-block" /> Efficiency %</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyVolumeData}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="volume" name="Shipments" stroke="#3b82f6" strokeWidth={2} fill="url(#volGrad)" dot={false} />
              <Area type="monotone" dataKey="efficiency" name="Efficiency" stroke="#10b981" strokeWidth={2} fill="url(#effGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Breakdown Donut */}
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-white">Cost Breakdown</h3>
            <p className="text-xs text-surface-400 mt-0.5">This month</p>
          </div>
          <div className="flex flex-col items-center">
            <PieChart width={180} height={180}>
              <Pie
                data={costBreakdownData}
                cx={90} cy={90}
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {costBreakdownData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
            <div className="grid grid-cols-1 gap-1.5 w-full mt-2">
              {costBreakdownData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-xs text-surface-400">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Monthly Performance */}
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white">Monthly Performance</h3>
              <p className="text-xs text-surface-400 mt-0.5">On-time vs delayed</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyShipmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="onTime" name="On Time" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="delayed" name="Delayed" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Shipments */}
        <div className="xl:col-span-2 bg-surface-900 border border-surface-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white">Recent Shipments</h3>
              <p className="text-xs text-surface-400 mt-0.5">Latest activity</p>
            </div>
            <button
              onClick={() => setActivePage('shipments')}
              className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {recentShipments.map((s) => (
              <div
                key={s.id}
                onClick={() => { setActivePage('shipments'); setSelectedShipment(s.id); }}
                className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/50 hover:bg-surface-800 cursor-pointer transition-colors group"
              >
                <div className="p-2 rounded-lg bg-primary-500/10 border border-primary-500/20 flex-shrink-0">
                  <Package size={14} className="text-primary-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{s.trackingNumber}</span>
                    <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0', statusColors[s.status])}>
                      {statusLabels[s.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-surface-400 truncate">
                      {s.origin.city} → {s.destination.city}
                    </span>
                    <span className="text-xs text-surface-500">• {s.carrier}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-semibold text-white">{s.progress}%</div>
                  <div className="text-xs text-surface-500">ETA: {s.eta}</div>
                </div>
                <div className="w-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight size={14} className="text-surface-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Alerts Banner */}
      {unreadAlerts.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <AlertTriangle size={16} className="text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-300">{unreadAlerts.length} active alerts require attention</p>
                <p className="text-xs text-amber-400/70 mt-0.5">
                  {unreadAlerts.filter(a => a.severity === 'error').length} critical, {unreadAlerts.filter(a => a.severity === 'warning').length} warnings
                </p>
              </div>
            </div>
            <button className="text-xs bg-amber-500 hover:bg-amber-400 text-amber-950 font-semibold px-3 py-1.5 rounded-lg transition-colors">
              Review Alerts
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
