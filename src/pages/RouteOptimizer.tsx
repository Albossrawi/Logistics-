import { routeOptimizations, shipments } from '../data/mockData';
import { Zap, Clock, DollarSign, CheckCircle, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-surface-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.fill }}>{p.name}: <strong>${p.value.toLocaleString()}</strong></p>
      ))}
    </div>
  );
};

export function RouteOptimizer() {
  const totalSavings = routeOptimizations.reduce((s, r) => s + r.savings, 0);
  const totalCurrentCost = routeOptimizations.reduce((s, r) => s + r.currentCost, 0);

  const comparisonData = routeOptimizations.map((r) => ({
    name: r.name.split(' → ')[0],
    current: r.currentCost,
    optimized: r.optimizedCost,
    savings: r.savings,
  }));

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary */}
      <div className="bg-gradient-to-r from-primary-900/40 to-accent-cyan/10 border border-primary-800/30 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={18} className="text-primary-400" />
              <h2 className="text-lg font-bold text-white">AI Route Optimization</h2>
            </div>
            <p className="text-sm text-surface-400">
              Our AI has analyzed your active routes and identified {routeOptimizations.length} optimization opportunities.
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-emerald-400">${totalSavings.toLocaleString()}</div>
            <div className="text-sm text-surface-400">potential monthly savings</div>
            <div className="text-xs text-emerald-400 mt-0.5">
              {((totalSavings / totalCurrentCost) * 100).toFixed(1)}% cost reduction
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Routes Analyzed', value: '24', icon: Zap, color: 'text-blue-400 bg-blue-500/10' },
          { label: 'Savings Identified', value: `$${totalSavings.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/10' },
          { label: 'Avg Time Reduction', value: '2.1 days', icon: Clock, color: 'text-cyan-400 bg-cyan-500/10' },
          { label: 'Confidence Score', value: '87%', icon: CheckCircle, color: 'text-violet-400 bg-violet-500/10' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-surface-900 border border-surface-800 rounded-xl p-4 flex items-center gap-3">
            <div className={clsx('p-2.5 rounded-xl', color)}>
              <Icon size={18} />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{value}</div>
              <div className="text-xs text-surface-400">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Optimization Cards */}
        <div className="xl:col-span-3 space-y-4">
          <h3 className="font-semibold text-white">Optimization Recommendations</h3>
          {routeOptimizations.map((route, idx) => (
            <div key={route.id} className="bg-surface-900 border border-surface-800 rounded-xl p-5 hover:border-primary-500/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full font-medium">#{idx + 1} Priority</span>
                    <span className="text-xs text-surface-500">{route.confidence}% confidence</span>
                  </div>
                  <h4 className="font-semibold text-white mt-1.5">{route.name}</h4>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-emerald-400">-${route.savings.toLocaleString()}</div>
                  <div className="text-xs text-emerald-400">{route.savingsPercent}% reduction</div>
                </div>
              </div>

              {/* Cost comparison */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-surface-800 rounded-lg p-3 text-center">
                  <div className="text-xs text-surface-500 mb-1">Current Cost</div>
                  <div className="text-lg font-bold text-surface-300">${route.currentCost.toLocaleString()}</div>
                  <div className="text-xs text-surface-500">{route.currentTransitDays} days transit</div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
                  <div className="text-xs text-emerald-400 mb-1">Optimized Cost</div>
                  <div className="text-lg font-bold text-emerald-400">${route.optimizedCost.toLocaleString()}</div>
                  <div className="text-xs text-emerald-400">{route.optimizedTransitDays} days transit</div>
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="bg-primary-500/5 border border-primary-500/15 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Zap size={14} className="text-primary-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-surface-300 leading-relaxed">{route.recommendation}</p>
                </div>
              </div>

              {/* Confidence bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-surface-500">AI Confidence</span>
                  <span className="text-white font-medium">{route.confidence}%</span>
                </div>
                <div className="w-full bg-surface-700 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-primary-600 to-accent-cyan transition-all"
                    style={{ width: `${route.confidence}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button className="flex-1 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
                  Apply Optimization
                </button>
                <button className="px-4 bg-surface-800 hover:bg-surface-700 text-surface-300 text-sm py-2 rounded-lg transition-colors border border-surface-700">
                  Review Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Panel */}
        <div className="xl:col-span-2 space-y-5">
          {/* Cost Comparison Chart */}
          <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-1">Cost Comparison</h3>
            <p className="text-xs text-surface-400 mb-4">Current vs optimized per route</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={comparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.07)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Bar dataKey="current" name="Current" fill="#475569" radius={[0, 4, 4, 0]} />
                <Bar dataKey="optimized" name="Optimized" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Active Shipments for Optimization */}
          <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Shipments Ready to Optimize</h3>
            <div className="space-y-2">
              {shipments.filter(s => s.status === 'in_transit' || s.status === 'pending').map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-2.5 bg-surface-800 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white truncate">{s.trackingNumber}</div>
                    <div className="text-xs text-surface-500">{s.origin.city} → {s.destination.city}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-semibold text-emerald-400">
                      {s.status === 'in_transit' ? 'Reroutable' : 'Optimizable'}
                    </div>
                    <div className="text-xs text-surface-500">${s.value.toLocaleString()}</div>
                  </div>
                  <ArrowRight size={14} className="text-surface-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
