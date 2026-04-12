import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import type { KPI } from '../../types';

const colorMap: Record<string, { bg: string; border: string; text: string; spark: string; glow: string }> = {
  blue:    { bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    text: 'text-blue-400',    spark: '#3b82f6', glow: 'hover:shadow-glow-blue' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', spark: '#10b981', glow: 'hover:shadow-glow-emerald' },
  amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400',   spark: '#f59e0b', glow: 'hover:shadow-glow-amber' },
  rose:    { bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    text: 'text-rose-400',    spark: '#f43f5e', glow: 'hover:shadow-glow-rose' },
  violet:  { bg: 'bg-violet-500/10',  border: 'border-violet-500/20',  text: 'text-violet-400',  spark: '#8b5cf6', glow: '' },
  cyan:    { bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    text: 'text-cyan-400',    spark: '#06b6d4', glow: '' },
};

export function MetricCard({ kpi }: { kpi: KPI }) {
  const c = colorMap[kpi.color] || colorMap.blue;
  const sparkData = kpi.sparkline.map((v, i) => ({ i, v }));
  const isUp = kpi.trend === 'up';
  const isDown = kpi.trend === 'down';
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const changeColor = kpi.positive
    ? (kpi.change > 0 ? 'text-emerald-400' : 'text-rose-400')
    : (kpi.change > 0 ? 'text-rose-400' : 'text-emerald-400');

  return (
    <div className={clsx(
      'bg-surface-900 border border-surface-800 rounded-xl p-5 transition-all duration-300 metric-card-glow cursor-pointer animate-fade-in',
    )}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">{kpi.label}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold text-white">{kpi.value}</span>
            {kpi.unit && <span className="text-sm text-surface-400">{kpi.unit}</span>}
          </div>
        </div>
        <div className={clsx('p-2.5 rounded-xl', c.bg, c.border, 'border')}>
          <div className={clsx('w-5 h-5', c.text)} />
        </div>
      </div>

      {/* Sparkline */}
      <div className="h-12 -mx-1 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData}>
            <defs>
              <linearGradient id={`grad-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c.spark} stopOpacity={0.3} />
                <stop offset="100%" stopColor={c.spark} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={c.spark}
              strokeWidth={2}
              fill={`url(#grad-${kpi.id})`}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Change indicator */}
      <div className="flex items-center gap-1.5">
        <div className={clsx('flex items-center gap-1 text-xs font-semibold', changeColor)}>
          <TrendIcon size={12} />
          <span>{Math.abs(kpi.change)}%</span>
        </div>
        <span className="text-xs text-surface-500">{kpi.changeLabel}</span>
      </div>
    </div>
  );
}
